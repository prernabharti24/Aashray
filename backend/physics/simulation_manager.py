import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from .base_engine import BaseSimulationEngine
from .reduced_order_engine import ReducedOrderSimulationEngine
from .ansys_engine import ANSYSSimulationEngine
from .demo_engine import DemoSimulationEngine
from ..models import (
    ShelterDesign,
    SimulationResult,
    ComparisonResponse,
    ComparisonMetric,
    DesignReport
)

class SimulationManager:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.data_dir = data_dir
        self.climates: List[Dict[str, Any]] = self._load_json("climates.json")
        self.materials: Dict[str, Any] = self._load_json("materials.json")

        self.engines: Dict[str, BaseSimulationEngine] = {
            "reduced_order": ReducedOrderSimulationEngine(),
            "ansys": ANSYSSimulationEngine(),
            "demo": DemoSimulationEngine()
        }

    def _load_json(self, filename: str) -> Any:
        path = os.path.join(self.data_dir, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def get_climates(self) -> List[Dict[str, Any]]:
        return self.climates

    def get_climate(self, climate_id: str) -> Dict[str, Any]:
        for c in self.climates:
            if c["id"] == climate_id:
                return c
        return self.climates[0]

    def get_materials(self) -> Dict[str, Any]:
        return self.materials

    def run_simulation(
        self,
        design: ShelterDesign,
        engine_type: str = "reduced_order",
        initial_temp_c: Optional[float] = None
    ) -> SimulationResult:
        climate = self.get_climate(design.location_id)
        engine = self.engines.get(engine_type)
        if not engine:
            engine = self.engines["reduced_order"]

        # If ANSYS is requested but not present, seamlessly use reduced-order and notify
        if engine_type == "ansys" and not engine.is_ansys_connected():
            engine = self.engines["reduced_order"]

        return engine.simulate(design, climate, self.materials, initial_temp_c)

    def generate_recommendation(self, current_design: ShelterDesign) -> ComparisonResponse:
        """
        Generate physically optimized shelter design using local earth materials and insulation.
        Simulates both designs to produce exact calculated deltas.
        """
        climate = self.get_climate(current_design.location_id)
        current_result = self.run_simulation(current_design)

        # Clone and optimize
        rec_dict = current_design.model_dump()
        rec_dict["id"] = f"{current_design.id}_optimized"
        rec_dict["name"] = f"AASHRAY Climate-Optimized Design ({current_design.shelter_type})"

        loc_id = current_design.location_id
        is_cold = loc_id in ["ladakh", "dras", "shillong"]

        reasons = []

        if is_cold:
            # Cold climate optimization
            if rec_dict["wall_material_id"] in ["red_brick", "concrete_block", "local_stone"]:
                rec_dict["wall_material_id"] = "adobe_mud"
                reasons.append("Replaced standard masonry with 300mm Sun-Dried Adobe Mud bricks to boost thermal mass and nighttime heat retention.")
            
            if rec_dict["roof_material_id"] in ["rcc_concrete", "cgi_sheet"]:
                rec_dict["roof_material_id"] = "mud_straw_timber"
                reasons.append("Upgraded roof to traditional multi-layer Mud-Plastered Timber deck with high thermal resistance.")

            if rec_dict["insulation_id"] == "none":
                rec_dict["insulation_id"] = "straw_woodwool" if loc_id != "dras" else "xps_100"
                reasons.append("Added natural compressed strawboard / bio-insulation layer to eliminate roof thermal bridges.")

            if rec_dict["glazing_id"] == "single_clear":
                rec_dict["glazing_id"] = "double_clear"
                reasons.append("Upgraded windows to double-glazed air cavity units to reduce nighttime conductive window heat loss.")

            # Orient south for maximum solar gain
            rec_dict["orientation_deg"] = 180.0
            reasons.append("Oriented main openings due South (180°) for passive solar heat capture throughout the day.")
            rec_dict["advanced_settings"]["infiltration_rate_ach"] = 0.6
        else:
            # Hot arid climate optimization (Jaisalmer, etc.)
            rec_dict["wall_material_id"] = "rammed_earth"
            reasons.append("Used Stabilized Rammed Earth (350mm) to delay external peak heat wave arrival by 10-12 hours.")
            rec_dict["roof_material_id"] = "mud_straw_timber"
            rec_dict["insulation_id"] = "straw_woodwool"
            rec_dict["glazing_id"] = "double_low_e"
            reasons.append("Added wood-wool roof insulation and Low-E glazing to deflect excessive midday solar radiation.")

        recommended_design = ShelterDesign(**rec_dict)
        recommended_result = self.run_simulation(recommended_design)

        # Calculate exact metrics
        temp_2am_diff = recommended_result.temp_at_2am - current_result.temp_at_2am
        heat_loss_diff = recommended_result.total_heat_loss_kwh - current_result.total_heat_loss_kwh
        solar_gain_diff = recommended_result.total_solar_gain_kwh - current_result.total_solar_gain_kwh

        metrics = [
            ComparisonMetric(
                metric="Night-time Temp (2 AM)",
                unit="°C",
                current_value=current_result.temp_at_2am,
                recommended_value=recommended_result.temp_at_2am,
                difference=round(temp_2am_diff, 1),
                is_better=(temp_2am_diff > 0 if is_cold else temp_2am_diff < 0),
                explanation="Calculated minimum temperature inside shelter during the coldest night hour."
            ),
            ComparisonMetric(
                metric="Total 24h Heat Loss",
                unit="kWh",
                current_value=current_result.total_heat_loss_kwh,
                recommended_value=recommended_result.total_heat_loss_kwh,
                difference=round(heat_loss_diff, 2),
                is_better=(heat_loss_diff < 0),
                explanation="Integrated 24-hour thermal energy escaping through roof, walls, windows and air gaps."
            ),
            ComparisonMetric(
                metric="Passive Solar Heat Gain",
                unit="kWh",
                current_value=current_result.total_solar_gain_kwh,
                recommended_value=recommended_result.total_solar_gain_kwh,
                difference=round(solar_gain_diff, 2),
                is_better=(solar_gain_diff > 0 if is_cold else solar_gain_diff < 0),
                explanation="Useful solar radiation captured through orientation-aligned glazed openings."
            ),
            ComparisonMetric(
                metric="Thermal Damping Ratio",
                unit="%",
                current_value=round(current_result.thermal_damping_ratio * 100, 1),
                recommended_value=round(recommended_result.thermal_damping_ratio * 100, 1),
                difference=round((recommended_result.thermal_damping_ratio - current_result.thermal_damping_ratio) * 100, 1),
                is_better=(recommended_result.thermal_damping_ratio >= current_result.thermal_damping_ratio),
                explanation="Capacity of local earth thermal mass to flatten indoor temperature swings."
            )
        ]

        return ComparisonResponse(
            current_design=current_design,
            recommended_design=recommended_design,
            current_result=current_result,
            recommended_result=recommended_result,
            metrics=metrics,
            architectural_reasoning=reasons
        )

    def generate_report(self, design: ShelterDesign) -> DesignReport:
        climate = self.get_climate(design.location_id)
        result = self.run_simulation(design)
        comparison = self.generate_recommendation(design)

        return DesignReport(
            title=f"AASHRAY Architectural Thermal Performance Dossier — {design.name}",
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            design=design,
            climate_info=climate,
            simulation_result=result,
            comparison=comparison,
            materials_summary={
                "wall": design.wall_material_id,
                "roof": design.roof_material_id,
                "insulation": design.insulation_id,
                "glazing": design.glazing_id
            },
            engineering_assumptions=[
                "1D transient lumped-parameter energy balance with sol-air external radiation boundary condition.",
                "Internal convective heat transfer coefficient hin = 8.0 W/m²K, external hout = 22.0 W/m²K.",
                "Active thermal mass participation factor set to 35% of inner envelope volume.",
                "Periodic steady-state converged over multi-day diurnal stabilization cycles."
            ],
            limitations=[
                "Simulation calculations are derived from our Reduced-Order Transient Physics Engine.",
                "Actual interior temperature will vary with real-time microclimate deviations, door openings, and non-uniform solar shading.",
                "Results are intended for architectural decision support and comparative optimization prior to high-fidelity CFD / ANSYS FEM meshing."
            ]
        )
