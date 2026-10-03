import math
from typing import Dict, Any, Optional, List
from .base_engine import BaseSimulationEngine
from ..models import ShelterDesign, SimulationResult, HourlyPoint, HeatLossBreakdown

class ReducedOrderSimulationEngine(BaseSimulationEngine):
    """
    Transient Lumped-Parameter 1D Thermal Network Simulation Engine.
    
    Physics modeled:
    - 24-hr transient differential energy balance: C_eff * dT/dt = Sum(Q_conductive) + Q_infil + Q_solar + Q_internal
    - Sol-air external boundary temperatures on roof and oriented vertical walls
    - Multi-layer envelope thermal resistance (U-values with insulation modifiers)
    - Thermal mass capacitance (rho * Cp * V_eff) providing phase shift and temperature damping
    - Solar heat gain coefficient (SHGC) through orientation-aware glazing
    - Infiltration / air change heat flux
    - Ground slab coupling
    """

    def get_engine_name(self) -> str:
        return "Reduced-Order Transient Thermal Model"

    def is_ansys_connected(self) -> bool:
        return False

    def simulate(
        self,
        design: ShelterDesign,
        climate: Dict[str, Any],
        materials_db: Dict[str, Any],
        initial_temp_c: Optional[float] = None
    ) -> SimulationResult:
        # 1. Look up materials
        wall_mat = next((m for m in materials_db.get("wall_materials", []) if m["id"] == design.wall_material_id), None)
        roof_mat = next((m for m in materials_db.get("roof_materials", []) if m["id"] == design.roof_material_id), None)
        insul_mat = next((m for m in materials_db.get("insulation_materials", []) if m["id"] == design.insulation_id), None)
        glazing = next((m for m in materials_db.get("glazing_types", []) if m["id"] == design.glazing_id), None)

        if not wall_mat:
            wall_mat = materials_db["wall_materials"][0]
        if not roof_mat:
            roof_mat = materials_db["roof_materials"][0]
        if not insul_mat:
            insul_mat = materials_db["insulation_materials"][0]
        if not glazing:
            glazing = materials_db["glazing_types"][0]

        # 2. Dimensions & Areas
        L = design.length_m
        W = design.width_m
        H = design.height_m
        volume_m3 = L * W * H
        area_roof = L * W
        area_floor = L * W
        area_win = design.window_count * design.window_width_m * design.window_height_m
        area_gross_walls = 2.0 * (L + W) * H
        area_net_walls = max(1.0, area_gross_walls - area_win)

        # 3. Thermal Transmittance (U-values) in W/m2K
        h_in = design.advanced_settings.internal_convection_coeff
        h_out = design.advanced_settings.external_convection_coeff
        r_insul = (insul_mat.get("thickness_m", 0.0) / insul_mat.get("conductivity_w_mk", 1.0)) if insul_mat.get("thickness_m", 0.0) > 0 else 0.0

        r_wall_layer = wall_mat["thickness_m"] / max(0.01, wall_mat["conductivity_w_mk"])
        u_wall = 1.0 / ((1.0 / h_in) + r_wall_layer + r_insul + (1.0 / h_out))

        r_roof_layer = roof_mat["thickness_m"] / max(0.01, roof_mat["conductivity_w_mk"])
        u_roof = 1.0 / ((1.0 / h_in) + r_roof_layer + r_insul + (1.0 / h_out))

        u_win = glazing.get("u_value", 5.7)
        shgc_win = glazing.get("shgc", 0.82)
        u_floor = 0.8 * design.advanced_settings.ground_coupling_factor

        # 4. Effective Thermal Capacitance C_total (Joules/K)
        # Air thermal mass: rho_air * Cp_air * Volume
        c_air = 1.204 * 1005.0 * volume_m3
        # Active participating inner thermal mass layer (inner 35% of walls & roof)
        eff_fraction = 0.35
        m_wall = area_net_walls * wall_mat["thickness_m"] * eff_fraction * wall_mat["density_kg_m3"]
        c_wall = m_wall * wall_mat["specific_heat_j_kgk"]
        
        m_roof = area_roof * roof_mat["thickness_m"] * eff_fraction * roof_mat["density_kg_m3"]
        c_roof = m_roof * roof_mat["specific_heat_j_kgk"]

        c_total = c_air + c_wall + c_roof

        # 5. Climate hourly series
        hourly_t_out = climate.get("hourly_outdoor_temp", [0.0]*24)
        hourly_solar = climate.get("hourly_solar_irradiance", [0.0]*24)
        t_ground = climate.get("ground_temp", sum(hourly_t_out)/24.0)

        # Infiltration rate in kg/s
        ach = design.advanced_settings.infiltration_rate_ach
        m_dot_infil = (ach * volume_m3 * 1.204) / 3600.0  # kg/s
        cp_air = 1005.0  # J/kg-K

        # Orientation angle in radians (180 deg = South)
        orient_rad = math.radians(design.orientation_deg)
        alpha_roof = design.advanced_settings.solar_absorptance_override or roof_mat.get("solar_absorptance", 0.70)
        alpha_wall = design.advanced_settings.solar_absorptance_override or wall_mat.get("solar_absorptance", 0.65)
        q_internal = design.advanced_settings.internal_heat_gain_w

        # 6. Transient Integration over 2 cycles to achieve steady-periodic state
        dt = 3600.0  # 1 hour steps
        sub_steps = 10
        dt_sub = dt / sub_steps

        # Starting estimate
        if initial_temp_c is not None:
            t_indoor = initial_temp_c
        else:
            t_indoor = sum(hourly_t_out) / len(hourly_t_out) + 4.0

        # Run 2 warm-up 24h cycles so system converges to periodic equilibrium
        for cycle in range(3):
            for h in range(24):
                t_out = hourly_t_out[h]
                i_glo = hourly_solar[h]

                # Sol-air calculation for roof
                # T_sol_roof = T_out + (alpha * I / h_out) - (eps * delta_R / h_out)
                t_sol_roof = t_out + (alpha_roof * i_glo / h_out) - 2.5 if i_glo > 0 else t_out - 3.5

                # Sol-air calculation for walls (averaged across oriented envelope)
                # Facing south gets higher solar gain around midday
                solar_wall_factor = 0.55 + 0.35 * math.cos(orient_rad - math.pi)
                i_wall = i_glo * max(0.0, solar_wall_factor)
                t_sol_wall = t_out + (alpha_wall * i_wall / h_out) - 1.5 if i_wall > 0 else t_out - 1.5

                # Solar through windows (facing front orientation)
                q_sol_win = area_win * shgc_win * i_glo * max(0.1, math.cos(orient_rad - math.pi) * 0.7)

                for _ in range(sub_steps):
                    q_roof = area_roof * u_roof * (t_sol_roof - t_indoor)
                    q_wall = area_net_walls * u_wall * (t_sol_wall - t_indoor)
                    q_win = area_win * u_win * (t_out - t_indoor)
                    q_floor = area_floor * u_floor * (t_ground - t_indoor)
                    q_infil = m_dot_infil * cp_air * (t_out - t_indoor)

                    q_net = q_roof + q_wall + q_win + q_floor + q_infil + q_sol_win + q_internal
                    dT = (q_net * dt_sub) / c_total
                    t_indoor += dT

        # 7. Collect final 24-hr profile results
        hourly_data: List[HourlyPoint] = []
        heat_losses_roof = 0.0
        heat_losses_walls = 0.0
        heat_losses_win = 0.0
        heat_losses_infil = 0.0
        heat_losses_ground = 0.0
        total_solar_gain_j = 0.0

        for h in range(24):
            t_out = hourly_t_out[h]
            i_glo = hourly_solar[h]

            t_sol_roof = t_out + (alpha_roof * i_glo / h_out) - 2.5 if i_glo > 0 else t_out - 3.5
            solar_wall_factor = 0.55 + 0.35 * math.cos(orient_rad - math.pi)
            i_wall = i_glo * max(0.0, solar_wall_factor)
            t_sol_wall = t_out + (alpha_wall * i_wall / h_out) - 1.5 if i_wall > 0 else t_out - 1.5
            q_sol_win = area_win * shgc_win * i_glo * max(0.1, math.cos(orient_rad - math.pi) * 0.7)
            total_solar_gain_j += q_sol_win * 3600.0

            # Sub-step simulation
            for _ in range(sub_steps):
                q_roof = area_roof * u_roof * (t_sol_roof - t_indoor)
                q_wall = area_net_walls * u_wall * (t_sol_wall - t_indoor)
                q_win = area_win * u_win * (t_out - t_indoor)
                q_floor = area_floor * u_floor * (t_ground - t_indoor)
                q_infil = m_dot_infil * cp_air * (t_out - t_indoor)

                # Track night / heat loss component fluxes (when flux is leaving shelter)
                if q_roof < 0:
                    heat_losses_roof += abs(q_roof) * dt_sub
                if q_wall < 0:
                    heat_losses_walls += abs(q_wall) * dt_sub
                if q_win < 0:
                    heat_losses_win += abs(q_win) * dt_sub
                if q_infil < 0:
                    heat_losses_infil += abs(q_infil) * dt_sub
                if q_floor < 0:
                    heat_losses_ground += abs(q_floor) * dt_sub

                q_net = q_roof + q_wall + q_win + q_floor + q_infil + q_sol_win + q_internal
                dT = (q_net * dt_sub) / c_total
                t_indoor += dT

            total_loss_current_w = max(0.0, -(min(0, q_roof) + min(0, q_wall) + min(0, q_win) + min(0, q_infil) + min(0, q_floor)))

            hourly_data.append(HourlyPoint(
                hour=h,
                time_label=f"{h:02d}:00",
                outdoor_temp=round(t_out, 1),
                indoor_temp=round(t_indoor, 1),
                solar_irradiance=round(i_glo, 0),
                solar_gain_w=round(q_sol_win, 1),
                heat_loss_w=round(total_loss_current_w, 1),
                is_sunset=(h == 18),
                is_2am=(h == 2),
                is_sunrise=(h == 6)
            ))

        # 8. Derived Key Performance Indicators
        indoor_temps = [p.indoor_temp for p in hourly_data]
        outdoor_temps = [p.outdoor_temp for p in hourly_data]
        mean_indoor = sum(indoor_temps) / len(indoor_temps)
        min_indoor = min(indoor_temps)
        max_indoor = max(indoor_temps)
        temp_2am = hourly_data[2].indoor_temp
        outdoor_2am = hourly_data[2].outdoor_temp

        delta_t_in = max_indoor - min_indoor
        delta_t_out = max(outdoor_temps) - min(outdoor_temps)
        damping_ratio = 1.0 - (delta_t_in / max(0.1, delta_t_out))
        damping_ratio = max(0.0, min(0.95, damping_ratio))

        # Thermal phase lag estimation (hour of max indoor - hour of max outdoor)
        h_max_out = outdoor_temps.index(max(outdoor_temps))
        h_max_in = indoor_temps.index(max(indoor_temps))
        lag_hours = (h_max_in - h_max_out) % 24

        # Heat loss distribution
        total_loss_j = heat_losses_roof + heat_losses_walls + heat_losses_win + heat_losses_infil + heat_losses_ground
        if total_loss_j < 1e-3:
            total_loss_j = 1.0

        roof_pct = (heat_losses_roof / total_loss_j) * 100.0
        walls_pct = (heat_losses_walls / total_loss_j) * 100.0
        win_pct = (heat_losses_win / total_loss_j) * 100.0
        infil_pct = (heat_losses_infil / total_loss_j) * 100.0
        ground_pct = (heat_losses_ground / total_loss_j) * 100.0

        breakdown_dict = {
            "roof": (roof_pct, heat_losses_roof / 3600.0 / 24.0),
            "walls": (walls_pct, heat_losses_walls / 3600.0 / 24.0),
            "windows": (win_pct, heat_losses_win / 3600.0 / 24.0),
            "ventilation": (infil_pct, heat_losses_infil / 3600.0 / 24.0),
            "ground": (ground_pct, heat_losses_ground / 3600.0 / 24.0)
        }
        dominant_path = max(breakdown_dict.keys(), key=lambda k: breakdown_dict[k][0])

        total_loss_kwh = total_loss_j / (3.6e6)
        peak_heat_loss_kw = max(p.heat_loss_w for p in hourly_data) / 1000.0
        total_solar_gain_kwh = total_solar_gain_j / (3.6e6)

        # Comfort verdict
        if min_indoor < 10.0:
            comfort_verdict = "Severe Cold Discomfort — Urgent thermal insulation required to maintain habitable conditions."
        elif min_indoor < 16.0:
            comfort_verdict = "Moderately Cool — Good thermal mass buffering, but night heat retention needs enhancement."
        elif max_indoor > 32.0:
            comfort_verdict = "Overheating Risk — Consider shading and high-mass passive night ventilation."
        else:
            comfort_verdict = "Thermally Comfortable — Indoor temperature remains well-buffered within the acceptable comfort envelope."

        # Design suggestions based on dominant path & materials
        suggestions = []
        if roof_pct >= 30.0:
            suggestions.append(f"Roof accounts for {roof_pct:.1f}% of total heat loss: Add 50-100mm strawboard or EPS insulation to top slab.")
        if win_pct >= 20.0 and glazing.get("id") == "single_clear":
            suggestions.append("Windows account for high conductive loss: Upgrade to double-glazed air cavity units with insulated thermal shutters.")
        if walls_pct >= 30.0 and not wall_mat.get("is_local_earth"):
            suggestions.append("Switch to high thermal mass local Adobe or Rammed Earth walls (300mm+) to smooth diurnal temperature extremes.")
        if infil_pct >= 18.0:
            suggestions.append("Infiltration heat loss is significant: Install airtight window weather-stripping and an entry airlock vestibule.")
        if not suggestions:
            suggestions.append("The shelter envelope is well-balanced for this microclimate. Maintain south-facing solar orientation.")

        breakdown = HeatLossBreakdown(
            roof_percent=round(roof_pct, 1),
            roof_watts=round(breakdown_dict["roof"][1], 1),
            walls_percent=round(walls_pct, 1),
            walls_watts=round(breakdown_dict["walls"][1], 1),
            windows_percent=round(win_pct, 1),
            windows_watts=round(breakdown_dict["windows"][1], 1),
            ventilation_percent=round(infil_pct, 1),
            ventilation_watts=round(breakdown_dict["ventilation"][1], 1),
            ground_percent=round(ground_pct, 1),
            ground_watts=round(breakdown_dict["ground"][1], 1),
            dominant_path=f"{dominant_path.capitalize()} ({round(breakdown_dict[dominant_path][0], 1)}%)"
        )

        return SimulationResult(
            design_id=design.id,
            design_name=design.name,
            engine_used="Reduced-Order Transient Model",
            is_reduced_order=True,
            transparency_disclaimer="Simulation results depend on input climate data, material properties, and boundary-condition assumptions.",
            mean_indoor_temp=round(mean_indoor, 1),
            min_indoor_temp=round(min_indoor, 1),
            max_indoor_temp=round(max_indoor, 1),
            temp_at_2am=round(temp_2am, 1),
            outdoor_temp_at_2am=round(outdoor_2am, 1),
            total_heat_loss_kwh=round(total_loss_kwh, 2),
            peak_heat_loss_kw=round(peak_heat_loss_kw, 2),
            total_solar_gain_kwh=round(total_solar_gain_kwh, 2),
            thermal_damping_ratio=round(damping_ratio, 2),
            thermal_lag_hours=round(lag_hours, 1),
            comfort_verdict=comfort_verdict,
            hourly_data=hourly_data,
            heat_loss_breakdown=breakdown,
            design_suggestions=suggestions
        )
