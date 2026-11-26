from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    func
)
from sqlalchemy.orm import relationship
from .database import Base

class ClimateModel(Base):
    __tablename__ = "climates"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    altitude_m = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    design_day = Column(String(100), nullable=False)
    hourly_outdoor_temp = Column(JSON, nullable=False)
    hourly_solar_irradiance = Column(JSON, nullable=False)
    hourly_wind_speed = Column(JSON, nullable=False)
    ground_temp = Column(Float, nullable=False)
    recommended_focus = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class MaterialModel(Base):
    __tablename__ = "materials"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    material_type = Column(String(50), nullable=False, index=True)  # 'wall', 'roof', 'insulation', 'glazing'
    is_local_earth = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    thickness_m = Column(Float, nullable=True)
    conductivity_w_mk = Column(Float, nullable=True)
    density_kg_m3 = Column(Float, nullable=True)
    specific_heat_j_kgk = Column(Float, nullable=True)
    solar_absorptance = Column(Float, nullable=True)
    emissivity = Column(Float, nullable=True)
    u_value_w_m2k = Column(Float, nullable=True)
    u_reduction_factor = Column(Float, nullable=True)
    u_value = Column(Float, nullable=True)
    shgc = Column(Float, nullable=True)
    thermal_mass_rating = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ShelterModel(Base):
    __tablename__ = "shelters"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location_id = Column(String(50), ForeignKey("climates.id"), nullable=False)
    shelter_type = Column(String(100), nullable=False)
    length_m = Column(Float, nullable=False)
    width_m = Column(Float, nullable=False)
    height_m = Column(Float, nullable=False)
    orientation_deg = Column(Float, nullable=False)
    wall_material_id = Column(String(50), ForeignKey("materials.id"), nullable=False)
    roof_material_id = Column(String(50), ForeignKey("materials.id"), nullable=False)
    insulation_id = Column(String(50), ForeignKey("materials.id"), nullable=False)
    window_count = Column(Integer, nullable=False)
    window_width_m = Column(Float, nullable=False)
    window_height_m = Column(Float, nullable=False)
    glazing_id = Column(String(50), ForeignKey("materials.id"), nullable=False)
    advanced_settings = Column(JSON, nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    climate = relationship("ClimateModel", foreign_keys=[location_id])
    wall_material = relationship("MaterialModel", foreign_keys=[wall_material_id])
    roof_material = relationship("MaterialModel", foreign_keys=[roof_material_id])
    insulation_material = relationship("MaterialModel", foreign_keys=[insulation_id])
    glazing_material = relationship("MaterialModel", foreign_keys=[glazing_id])

    simulations = relationship("SimulationModel", back_populates="shelter", cascade="all, delete-orphan")
    reports = relationship("DesignReportModel", back_populates="shelter", cascade="all, delete-orphan")


class SimulationModel(Base):
    __tablename__ = "simulations"

    id = Column(String(100), primary_key=True, index=True)
    shelter_id = Column(String(100), ForeignKey("shelters.id", ondelete="CASCADE"), nullable=False, index=True)
    engine_used = Column(String(50), nullable=False)
    is_reduced_order = Column(Boolean, default=True)
    transparency_disclaimer = Column(Text, nullable=True)
    mean_indoor_temp = Column(Float, nullable=False)
    min_indoor_temp = Column(Float, nullable=False)
    max_indoor_temp = Column(Float, nullable=False)
    temp_at_2am = Column(Float, nullable=False)
    outdoor_temp_at_2am = Column(Float, nullable=False)
    total_heat_loss_kwh = Column(Float, nullable=False)
    peak_heat_loss_kw = Column(Float, nullable=False)
    total_solar_gain_kwh = Column(Float, nullable=False)
    thermal_damping_ratio = Column(Float, nullable=False)
    thermal_lag_hours = Column(Float, nullable=False)
    comfort_verdict = Column(String(100), nullable=False)
    hourly_data = Column(JSON, nullable=False)
    heat_loss_breakdown = Column(JSON, nullable=False)
    design_suggestions = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    shelter = relationship("ShelterModel", back_populates="simulations")


class DesignReportModel(Base):
    __tablename__ = "design_reports"

    id = Column(String(100), primary_key=True, index=True)
    shelter_id = Column(String(100), ForeignKey("shelters.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    generated_at = Column(String(50), nullable=False)
    report_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    shelter = relationship("ShelterModel", back_populates="reports")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(50), default="architect")
    created_at = Column(DateTime, server_default=func.now())


class FloorPlanModel(Base):
    __tablename__ = "floorplans"

    id = Column(String(100), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    image_width_px = Column(Integer, nullable=True)
    image_height_px = Column(Integer, nullable=True)
    detected_pixel_length = Column(Float, nullable=True)
    detected_pixel_width = Column(Float, nullable=True)
    calibrated_length_m = Column(Float, nullable=True)
    calibrated_width_m = Column(Float, nullable=True)
    ceiling_height_m = Column(Float, default=2.8)
    detection_status = Column(String(50), default="detected")
    user_corrected_length_m = Column(Float, nullable=True)
    user_corrected_width_m = Column(Float, nullable=True)
    user_corrected_height_m = Column(Float, nullable=True)
    scale_ratio = Column(String(50), nullable=True)
    reference_measurement_m = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
