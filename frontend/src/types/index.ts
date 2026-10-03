export interface AdvancedSettings {
  solar_absorptance_override?: number;
  internal_convection_coeff: number;
  external_convection_coeff: number;
  infiltration_rate_ach: number;
  internal_heat_gain_w: number;
  ground_coupling_factor: number;
  time_step_sec: number;
}

export interface ShelterDesign {
  id: string;
  name: string;
  location_id: string;
  shelter_type: string;
  length_m: number;
  width_m: number;
  height_m: number;
  orientation_deg: number;
  wall_material_id: string;
  roof_material_id: string;
  insulation_id: string;
  window_count: number;
  window_width_m: number;
  window_height_m: number;
  glazing_id: string;
  advanced_settings: AdvancedSettings;
}

export interface Climate {
  id: string;
  name: string;
  region: string;
  altitude_m: number;
  description: string;
  latitude: number;
  design_day: string;
  hourly_outdoor_temp: number[];
  hourly_solar_irradiance: number[];
  hourly_wind_speed: number[];
  ground_temp: number;
  recommended_focus: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  is_local_earth: boolean;
  description: string;
  thickness_m?: number;
  conductivity_w_mk?: number;
  density_kg_m3?: number;
  specific_heat_j_kgk?: number;
  solar_absorptance?: number;
  emissivity?: number;
  u_value_w_m2k?: number;
  u_reduction_factor?: number;
  u_value?: number;
  shgc?: number;
  thermal_mass_rating?: string;
}

export interface MaterialsDB {
  wall_materials: MaterialItem[];
  roof_materials: MaterialItem[];
  insulation_materials: MaterialItem[];
  glazing_types: MaterialItem[];
}

export interface HourlyPoint {
  hour: number;
  time_label: string;
  outdoor_temp: number;
  indoor_temp: number;
  solar_irradiance: number;
  solar_gain_w: number;
  heat_loss_w: number;
  is_sunset: boolean;
  is_2am: boolean;
  is_sunrise: boolean;
}

export interface HeatLossBreakdown {
  roof_percent: number;
  roof_watts: number;
  walls_percent: number;
  walls_watts: number;
  windows_percent: number;
  windows_watts: number;
  ventilation_percent: number;
  ventilation_watts: number;
  ground_percent: number;
  ground_watts: number;
  dominant_path: string;
}

export interface SimulationResult {
  design_id: string;
  design_name: string;
  engine_used: string;
  is_reduced_order: boolean;
  transparency_disclaimer: string;
  mean_indoor_temp: number;
  min_indoor_temp: number;
  max_indoor_temp: number;
  temp_at_2am: number;
  outdoor_temp_at_2am: number;
  total_heat_loss_kwh: number;
  peak_heat_loss_kw: number;
  total_solar_gain_kwh: number;
  thermal_damping_ratio: number;
  thermal_lag_hours: number;
  comfort_verdict: string;
  hourly_data: HourlyPoint[];
  heat_loss_breakdown: HeatLossBreakdown;
  design_suggestions: string[];
}

export interface ComparisonMetric {
  metric: string;
  unit: string;
  current_value: number;
  recommended_value: number;
  difference: number;
  is_better: boolean;
  explanation: string;
}

export interface ComparisonResponse {
  current_design: ShelterDesign;
  recommended_design: ShelterDesign;
  current_result: SimulationResult;
  recommended_result: SimulationResult;
  metrics: ComparisonMetric[];
  architectural_reasoning: string[];
}

export interface DesignReport {
  title: string;
  generated_at: string;
  design: ShelterDesign;
  climate_info: Climate;
  simulation_result: SimulationResult;
  comparison?: ComparisonResponse;
  materials_summary: Record<string, string>;
  engineering_assumptions: string[];
  limitations: string[];
}
