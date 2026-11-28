import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from .auth_utils import hash_password, verify_password
from .db_models import (
    ClimateModel,
    MaterialModel,
    ShelterModel,
    SimulationModel,
    DesignReportModel,
    UserModel,
    FloorPlanModel
)
from .models import ShelterDesign, SimulationResult, DesignReport, AdvancedSettings

# ==========================================
# CLIMATE CRUD
# ==========================================

def get_climates(db: Session) -> List[Dict[str, Any]]:
    rows = db.query(ClimateModel).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "region": r.region,
            "altitude_m": r.altitude_m,
            "description": r.description,
            "latitude": r.latitude,
            "design_day": r.design_day,
            "hourly_outdoor_temp": r.hourly_outdoor_temp,
            "hourly_solar_irradiance": r.hourly_solar_irradiance,
            "hourly_wind_speed": r.hourly_wind_speed,
            "ground_temp": r.ground_temp,
            "recommended_focus": r.recommended_focus
        }
        for r in rows
    ]

def get_climate_by_id(db: Session, climate_id: str) -> Optional[Dict[str, Any]]:
    r = db.query(ClimateModel).filter(ClimateModel.id == climate_id).first()
    if not r:
        return None
    return {
        "id": r.id,
        "name": r.name,
        "region": r.region,
        "altitude_m": r.altitude_m,
        "description": r.description,
        "latitude": r.latitude,
        "design_day": r.design_day,
        "hourly_outdoor_temp": r.hourly_outdoor_temp,
        "hourly_solar_irradiance": r.hourly_solar_irradiance,
        "hourly_wind_speed": r.hourly_wind_speed,
        "ground_temp": r.ground_temp,
        "recommended_focus": r.recommended_focus
    }

def create_climate(db: Session, data: Dict[str, Any]) -> ClimateModel:
    climate = ClimateModel(
        id=data["id"],
        name=data["name"],
        region=data["region"],
        altitude_m=float(data["altitude_m"]),
        description=data.get("description", ""),
        latitude=float(data["latitude"]),
        design_day=data["design_day"],
        hourly_outdoor_temp=data["hourly_outdoor_temp"],
        hourly_solar_irradiance=data["hourly_solar_irradiance"],
        hourly_wind_speed=data["hourly_wind_speed"],
        ground_temp=float(data["ground_temp"]),
        recommended_focus=data.get("recommended_focus", "")
    )
    db.merge(climate)
    db.commit()
    return climate

def update_climate(db: Session, climate_id: str, data: Dict[str, Any]) -> Optional[ClimateModel]:
    climate = db.query(ClimateModel).filter(ClimateModel.id == climate_id).first()
    if not climate:
        return None
    for k, v in data.items():
        if hasattr(climate, k):
            setattr(climate, k, v)
    db.commit()
    db.refresh(climate)
    return climate

def delete_climate(db: Session, climate_id: str) -> bool:
    climate = db.query(ClimateModel).filter(ClimateModel.id == climate_id).first()
    if not climate:
        return False
    db.delete(climate)
    db.commit()
    return True


# ==========================================
# MATERIAL CRUD
# ==========================================

def get_materials_dict(db: Session) -> Dict[str, List[Dict[str, Any]]]:
    rows = db.query(MaterialModel).all()
    grouped = {
        "wall_materials": [],
        "roof_materials": [],
        "insulation_materials": [],
        "glazing_types": []
    }
    for r in rows:
        item = {
            "id": r.id,
            "name": r.name,
            "category": r.category,
            "is_local_earth": r.is_local_earth,
            "description": r.description or ""
        }
        if r.thickness_m is not None:
            item["thickness_m"] = r.thickness_m
        if r.conductivity_w_mk is not None:
            item["conductivity_w_mk"] = r.conductivity_w_mk
        if r.density_kg_m3 is not None:
            item["density_kg_m3"] = r.density_kg_m3
        if r.specific_heat_j_kgk is not None:
            item["specific_heat_j_kgk"] = r.specific_heat_j_kgk
        if r.solar_absorptance is not None:
            item["solar_absorptance"] = r.solar_absorptance
        if r.emissivity is not None:
            item["emissivity"] = r.emissivity
        if r.u_value_w_m2k is not None:
            item["u_value_w_m2k"] = r.u_value_w_m2k
        if r.u_reduction_factor is not None:
            item["u_reduction_factor"] = r.u_reduction_factor
        if r.u_value is not None:
            item["u_value"] = r.u_value
        if r.shgc is not None:
            item["shgc"] = r.shgc
        if r.thermal_mass_rating is not None:
            item["thermal_mass_rating"] = r.thermal_mass_rating

        if r.material_type == "wall":
            grouped["wall_materials"].append(item)
        elif r.material_type == "roof":
            grouped["roof_materials"].append(item)
        elif r.material_type == "insulation":
            grouped["insulation_materials"].append(item)
        elif r.material_type == "glazing":
            grouped["glazing_types"].append(item)

    return grouped

def material_model_to_dict(r: Optional[MaterialModel]) -> Optional[Dict[str, Any]]:
    if not r:
        return None
    item = {
        "id": r.id,
        "name": r.name,
        "category": r.category,
        "material_type": r.material_type,
        "is_local_earth": r.is_local_earth,
        "description": r.description or ""
    }
    for field in [
        "thickness_m", "conductivity_w_mk", "density_kg_m3", "specific_heat_j_kgk",
        "solar_absorptance", "emissivity", "u_value_w_m2k", "u_reduction_factor",
        "u_value", "shgc", "thermal_mass_rating"
    ]:
        val = getattr(r, field, None)
        if val is not None:
            item[field] = val
    return item

def get_material_by_id(db: Session, mat_id: str) -> Optional[MaterialModel]:
    return db.query(MaterialModel).filter(MaterialModel.id == mat_id).first()

def create_material(db: Session, data: Dict[str, Any], material_type: Optional[str] = None) -> MaterialModel:
    mat_type = material_type or data.get("material_type") or data.get("category", "wall")
    mat = MaterialModel(
        id=data["id"],
        name=data["name"],
        category=data.get("category", mat_type),
        material_type=mat_type,
        is_local_earth=bool(data.get("is_local_earth", False)),
        description=data.get("description", ""),
        thickness_m=data.get("thickness_m"),
        conductivity_w_mk=data.get("conductivity_w_mk"),
        density_kg_m3=data.get("density_kg_m3"),
        specific_heat_j_kgk=data.get("specific_heat_j_kgk"),
        solar_absorptance=data.get("solar_absorptance"),
        emissivity=data.get("emissivity"),
        u_value_w_m2k=data.get("u_value_w_m2k"),
        u_reduction_factor=data.get("u_reduction_factor"),
        u_value=data.get("u_value"),
        shgc=data.get("shgc"),
        thermal_mass_rating=data.get("thermal_mass_rating")
    )
    db.merge(mat)
    db.commit()
    return mat

def update_material(db: Session, mat_id: str, data: Dict[str, Any]) -> Optional[MaterialModel]:
    mat = db.query(MaterialModel).filter(MaterialModel.id == mat_id).first()
    if not mat:
        return None
    for k, v in data.items():
        if hasattr(mat, k):
            setattr(mat, k, v)
    db.commit()
    db.refresh(mat)
    return mat

def delete_material(db: Session, mat_id: str) -> bool:
    mat = db.query(MaterialModel).filter(MaterialModel.id == mat_id).first()
    if not mat:
        return False
    db.delete(mat)
    db.commit()
    return True


# ==========================================
# SHELTER CRUD
# ==========================================

def shelter_model_to_schema(model: ShelterModel) -> ShelterDesign:
    adv = model.advanced_settings or {}
    return ShelterDesign(
        id=model.id,
        name=model.name,
        location_id=model.location_id,
        shelter_type=model.shelter_type,
        length_m=model.length_m,
        width_m=model.width_m,
        height_m=model.height_m,
        orientation_deg=model.orientation_deg,
        wall_material_id=model.wall_material_id,
        roof_material_id=model.roof_material_id,
        insulation_id=model.insulation_id,
        window_count=model.window_count,
        window_width_m=model.window_width_m,
        window_height_m=model.window_height_m,
        glazing_id=model.glazing_id,
        advanced_settings=AdvancedSettings(**adv)
    )

def get_all_shelters(db: Session) -> List[ShelterDesign]:
    rows = db.query(ShelterModel).order_by(ShelterModel.created_at.desc()).all()
    return [shelter_model_to_schema(r) for r in rows]

def get_shelter_by_id(db: Session, shelter_id: str) -> Optional[ShelterDesign]:
    row = db.query(ShelterModel).filter(ShelterModel.id == shelter_id).first()
    return shelter_model_to_schema(row) if row else None

def get_default_shelter(db: Session) -> ShelterDesign:
    row = db.query(ShelterModel).filter(ShelterModel.is_default == True).first()
    if not row:
        row = db.query(ShelterModel).filter(ShelterModel.id == "ladakh_winter_shelter_01").first()
    if row:
        return shelter_model_to_schema(row)

    # Fallback to create and return default shelter in database
    default_design = ShelterDesign(
        id="ladakh_winter_shelter_01",
        name="Ladakh Winter Shelter",
        location_id="ladakh",
        shelter_type="Community Shelter",
        length_m=4.0,
        width_m=3.0,
        height_m=2.8,
        orientation_deg=180.0,
        wall_material_id="red_brick",
        roof_material_id="rcc_concrete",
        insulation_id="none",
        window_count=2,
        window_width_m=1.2,
        window_height_m=1.0,
        glazing_id="single_clear"
    )
    create_shelter(db, default_design, is_default=True)
    return default_design

def create_shelter(db: Session, shelter: ShelterDesign, is_default: bool = False) -> ShelterDesign:
    existing = db.query(ShelterModel).filter(ShelterModel.id == shelter.id).first()
    if existing:
        for k, v in shelter.model_dump().items():
            if k == "advanced_settings":
                existing.advanced_settings = v
            elif hasattr(existing, k):
                setattr(existing, k, v)
        if is_default:
            existing.is_default = True
        db.commit()
        db.refresh(existing)
        return shelter_model_to_schema(existing)

    adv_dict = shelter.advanced_settings.model_dump() if shelter.advanced_settings else {}
    model = ShelterModel(
        id=shelter.id or str(uuid.uuid4()),
        name=shelter.name,
        location_id=shelter.location_id,
        shelter_type=shelter.shelter_type,
        length_m=shelter.length_m,
        width_m=shelter.width_m,
        height_m=shelter.height_m,
        orientation_deg=shelter.orientation_deg,
        wall_material_id=shelter.wall_material_id,
        roof_material_id=shelter.roof_material_id,
        insulation_id=shelter.insulation_id,
        window_count=shelter.window_count,
        window_width_m=shelter.window_width_m,
        window_height_m=shelter.window_height_m,
        glazing_id=shelter.glazing_id,
        advanced_settings=adv_dict,
        is_default=is_default
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return shelter_model_to_schema(model)

def update_shelter(db: Session, shelter_id: str, patch_data: Dict[str, Any]) -> Optional[ShelterDesign]:
    model = db.query(ShelterModel).filter(ShelterModel.id == shelter_id).first()
    if not model:
        return None
    for k, v in patch_data.items():
        if k == "advanced_settings":
            model.advanced_settings = v
        elif hasattr(model, k):
            setattr(model, k, v)
    db.commit()
    db.refresh(model)
    return shelter_model_to_schema(model)

def delete_shelter(db: Session, shelter_id: str) -> bool:
    model = db.query(ShelterModel).filter(ShelterModel.id == shelter_id).first()
    if not model:
        return False
    db.delete(model)
    db.commit()
    return True


# ==========================================
# SIMULATION CRUD
# ==========================================

def save_simulation(db: Session, res: SimulationResult, shelter_id: str) -> SimulationModel:
    sim_id = f"sim_{shelter_id}_{int(uuid.uuid4().hex[:8], 16)}"
    model = SimulationModel(
        id=sim_id,
        shelter_id=shelter_id,
        engine_used=res.engine_used,
        is_reduced_order=res.is_reduced_order,
        transparency_disclaimer=res.transparency_disclaimer,
        mean_indoor_temp=res.mean_indoor_temp,
        min_indoor_temp=res.min_indoor_temp,
        max_indoor_temp=res.max_indoor_temp,
        temp_at_2am=res.temp_at_2am,
        outdoor_temp_at_2am=res.outdoor_temp_at_2am,
        total_heat_loss_kwh=res.total_heat_loss_kwh,
        peak_heat_loss_kw=res.peak_heat_loss_kw,
        total_solar_gain_kwh=res.total_solar_gain_kwh,
        thermal_damping_ratio=res.thermal_damping_ratio,
        thermal_lag_hours=res.thermal_lag_hours,
        comfort_verdict=res.comfort_verdict,
        hourly_data=[p.model_dump() for p in res.hourly_data],
        heat_loss_breakdown=res.heat_loss_breakdown.model_dump(),
        design_suggestions=res.design_suggestions
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model

def get_simulation_by_id(db: Session, sim_id: str) -> Optional[SimulationModel]:
    return db.query(SimulationModel).filter(SimulationModel.id == sim_id).first()

def get_latest_simulation_by_shelter(db: Session, shelter_id: str) -> Optional[SimulationModel]:
    return db.query(SimulationModel).filter(SimulationModel.shelter_id == shelter_id).order_by(SimulationModel.created_at.desc()).first()

def delete_simulation(db: Session, sim_id: str) -> bool:
    row = db.query(SimulationModel).filter(SimulationModel.id == sim_id).first()
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


# ==========================================
# REPORT CRUD
# ==========================================

def save_report(db: Session, report: DesignReport, shelter_id: str) -> DesignReportModel:
    rep_id = f"report_{shelter_id}_{int(uuid.uuid4().hex[:8], 16)}"
    model = DesignReportModel(
        id=rep_id,
        shelter_id=shelter_id,
        title=report.title,
        generated_at=report.generated_at,
        report_data=report.model_dump()
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model

def get_report_by_id(db: Session, report_id: str) -> Optional[DesignReportModel]:
    return db.query(DesignReportModel).filter(DesignReportModel.id == report_id).first()

def delete_report(db: Session, report_id: str) -> bool:
    row = db.query(DesignReportModel).filter(DesignReportModel.id == report_id).first()
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


# ==========================================
# USER CRUD
# ==========================================

def create_user(db: Session, data: Dict[str, Any]) -> UserModel:
    pwd_hash = data.get("password_hash")
    if not pwd_hash and "password" in data and data["password"]:
        pwd_hash = hash_password(data["password"])

    user = UserModel(
        id=data.get("id") or str(uuid.uuid4()),
        email=data["email"].strip().lower(),
        name=data["name"].strip(),
        role=data.get("role", "architect"),
        password_hash=pwd_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_id(db: Session, user_id: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.email == email.strip().lower()).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[UserModel]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not user.password_hash:
        return None
    if verify_password(user.password_hash, password):
        return user
    return None

def update_user(db: Session, user_id: str, data: Dict[str, Any]) -> Optional[UserModel]:
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None
    for k, v in data.items():
        if k == "password" and v:
            user.password_hash = hash_password(v)
        elif hasattr(user, k):
            setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: str) -> bool:
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


# ==========================================
# FLOOR PLAN CRUD
# ==========================================

def create_floorplan(db: Session, data: Dict[str, Any]) -> FloorPlanModel:
    fp = FloorPlanModel(
        id=data.get("id") or f"fp_{uuid.uuid4().hex[:12]}",
        filename=data["filename"],
        file_path=data.get("file_path"),
        image_width_px=data.get("image_width_px"),
        image_height_px=data.get("image_height_px"),
        detected_pixel_length=data.get("detected_pixel_length"),
        detected_pixel_width=data.get("detected_pixel_width"),
        calibrated_length_m=data.get("calibrated_length_m"),
        calibrated_width_m=data.get("calibrated_width_m"),
        ceiling_height_m=data.get("ceiling_height_m", 2.8),
        detection_status=data.get("detection_status", "detected"),
        user_corrected_length_m=data.get("user_corrected_length_m"),
        user_corrected_width_m=data.get("user_corrected_width_m"),
        user_corrected_height_m=data.get("user_corrected_height_m"),
        scale_ratio=data.get("scale_ratio"),
        reference_measurement_m=data.get("reference_measurement_m")
    )
    db.add(fp)
    db.commit()
    db.refresh(fp)
    return fp

def get_floorplan_by_id(db: Session, floorplan_id: str) -> Optional[FloorPlanModel]:
    return db.query(FloorPlanModel).filter(FloorPlanModel.id == floorplan_id).first()

def update_floorplan(db: Session, floorplan_id: str, data: Dict[str, Any]) -> Optional[FloorPlanModel]:
    fp = db.query(FloorPlanModel).filter(FloorPlanModel.id == floorplan_id).first()
    if not fp:
        return None
    for k, v in data.items():
        if hasattr(fp, k) and v is not None:
            setattr(fp, k, v)
    db.commit()
    db.refresh(fp)
    return fp

def list_floorplans(db: Session) -> List[FloorPlanModel]:
    return db.query(FloorPlanModel).order_by(FloorPlanModel.created_at.desc()).all()

def delete_floorplan(db: Session, floorplan_id: str) -> bool:
    fp = db.query(FloorPlanModel).filter(FloorPlanModel.id == floorplan_id).first()
    if not fp:
        return False
    db.delete(fp)
    db.commit()
    return True
