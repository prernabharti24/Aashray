from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AdvancedSettings(BaseModel):
    solar_absorptance_override: Optional[float] = None
    internal_convection_coeff: float = Field(default=8.0, description="W/m2K")
    external_convection_coeff: float = Field(default=22.0, description="W/m2K")
    infiltration_rate_ach: float = Field(default=1.0, description="Air changes per hour")
    internal_heat_gain_w: float = Field(default=150.0, description="Heat from occupants & lighting (W)")
    ground_coupling_factor: float = Field(default=0.7, description="Ground thermal coupling factor")
    time_step_sec: int = Field(default=3600, description="Physics numerical time step in seconds")

class ShelterDesign(BaseModel):
    id: str = "shelter_01"
    name: str = "Ladakh Winter Shelter"
    location_id: str = "ladakh"
    shelter_type: str = "Community Shelter"
    length_m: float = Field(default=4.0, ge=1.5, le=30.0)
    width_m: float = Field(default=3.0, ge=1.5, le=30.0)
    height_m: float = Field(default=2.8, ge=1.8, le=10.0)
    orientation_deg: float = Field(default=180.0, ge=0.0, le=360.0, description="0=North, 90=East, 180=South, 270=West")
    wall_material_id: str = "red_brick"
    roof_material_id: str = "rcc_concrete"
    insulation_id: str = "none"
    window_count: int = Field(default=2, ge=0, le=12)
    window_width_m: float = Field(default=1.2, ge=0.3, le=4.0)
    window_height_m: float = Field(default=1.0, ge=0.3, le=3.0)
    glazing_id: str = "single_clear"
    advanced_settings: AdvancedSettings = Field(default_factory=AdvancedSettings)

class HourlyPoint(BaseModel):
    hour: int
    time_label: str
    outdoor_temp: float
    indoor_temp: float
    solar_irradiance: float
    solar_gain_w: float
    heat_loss_w: float
    is_sunset: bool = False
    is_2am: bool = False
    is_sunrise: bool = False

class HeatLossBreakdown(BaseModel):
    roof_percent: float
    roof_watts: float
    walls_percent: float
    walls_watts: float
    windows_percent: float
    windows_watts: float
    ventilation_percent: float
    ventilation_watts: float
    ground_percent: float
    ground_watts: float
    dominant_path: str

class SimulationRequest(BaseModel):
    design: ShelterDesign
    initial_temp_c: Optional[float] = None
    engine_type: str = "reduced_order"
    duration_hours: int = 24

class SimulationResult(BaseModel):
    design_id: str
    design_name: str
    engine_used: str
    is_reduced_order: bool = True
    transparency_disclaimer: str
    mean_indoor_temp: float
    min_indoor_temp: float
    max_indoor_temp: float
    temp_at_2am: float
    outdoor_temp_at_2am: float
    total_heat_loss_kwh: float
    peak_heat_loss_kw: float
    total_solar_gain_kwh: float
    thermal_damping_ratio: float
    thermal_lag_hours: float
    comfort_verdict: str
    hourly_data: List[HourlyPoint]
    heat_loss_breakdown: HeatLossBreakdown
    design_suggestions: List[str]

class ComparisonMetric(BaseModel):
    metric: str
    unit: str
    current_value: float
    recommended_value: float
    difference: float
    is_better: bool
    explanation: str

class ComparisonResponse(BaseModel):
    current_design: ShelterDesign
    recommended_design: ShelterDesign
    current_result: SimulationResult
    recommended_result: SimulationResult
    metrics: List[ComparisonMetric]
    architectural_reasoning: List[str]

class DesignReport(BaseModel):
    title: str
    generated_at: str
    design: ShelterDesign
    climate_info: Dict[str, Any]
    simulation_result: SimulationResult
    comparison: Optional[ComparisonResponse] = None
    materials_summary: Dict[str, Any]
    engineering_assumptions: List[str]
    limitations: List[str]
