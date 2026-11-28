import os
# Ensure SQLAlchemy pure Python mode to avoid Windows DLL control blocking
os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

from fastapi import FastAPI, HTTPException, Response, Depends, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import get_db, init_db
from . import crud
from .auth_utils import generate_session_token
from .models import (
    ShelterDesign,
    SimulationRequest,
    SimulationResult,
    ComparisonResponse,
    DesignReport,
    TemperatureGraphRequest,
    FloorPlanAnalysisResponse,
    FloorPlanSaveRequest,
    UserRegisterRequest,
    UserLoginRequest,
    UserAuthResponse,
    UserResponse
)
from .physics.simulation_manager import SimulationManager
from .chart_service import generate_temperature_chart
from .floorplan_service import analyze_floorplan_image

app = FastAPI(
    title="AASHRAY API — Mitti Se Mausam Tak",
    description="Backend API with MySQL database for climate-responsive shelter design and thermal performance simulation (SIH26051 DRDO)",
    version="2.0.0"
)

# Enable CORS for frontend Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = SimulationManager()

@app.on_event("startup")
def startup_event():
    """
    Initializes MySQL database tables and verifies connectivity at application startup.
    """
    try:
        init_db()
        from .seed_data import seed_database
        # If climates table is empty, seed initial data from backup
        from .database import SessionLocal
        with SessionLocal() as db:
            climates = crud.get_climates(db)
            if not climates:
                print("MySQL tables empty, running seed...")
                seed_database()
            else:
                print(f"MySQL connected. {len(climates)} climates available in aashray_db.")
    except Exception as e:
        print(f"Database startup warning: {e}")

@app.get("/")
def root():
    return {
        "app": "AASHRAY",
        "subtitle": "Mitti Se Mausam Tak",
        "tagline": "Design a shelter for its climate.",
        "status": "online",
        "database": "MySQL",
        "version": "2.0.0"
    }

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
    return {
        "status": "ok",
        "database": "MySQL",
        "db_status": db_status,
        "timestamp": "2026-09-28T12:00:00Z"
    }

# ==========================================
# CLIMATES (CRUD in MySQL)
# ==========================================

@app.get("/api/climates", response_model=List[Dict[str, Any]])
def get_climates(db: Session = Depends(get_db)):
    """SELECT all climate records from MySQL."""
    try:
        return crud.get_climates(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error fetching climates: {str(e)}")

@app.get("/api/climates/{climate_id}", response_model=Dict[str, Any])
def get_climate(climate_id: str, db: Session = Depends(get_db)):
    """SELECT a single climate record from MySQL by ID."""
    try:
        clim = crud.get_climate_by_id(db, climate_id)
        if not clim:
            raise HTTPException(status_code=404, detail="Climate not found")
        return clim
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving climate: {str(e)}")

@app.post("/api/climates", status_code=status.HTTP_201_CREATED)
def create_climate(climate_data: Dict[str, Any], db: Session = Depends(get_db)):
    """INSERT a new climate record into MySQL."""
    try:
        climate = crud.create_climate(db, climate_data)
        return {"id": climate.id, "name": climate.name, "region": climate.region}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error creating climate: {str(e)}")

@app.put("/api/climates/{climate_id}")
def update_climate_put(climate_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """PUT / full update a climate record in MySQL."""
    try:
        updated = crud.update_climate(db, climate_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="Climate not found for update")
        return crud.get_climate_by_id(db, climate_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating climate: {str(e)}")

@app.patch("/api/climates/{climate_id}")
def update_climate_patch(climate_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """PATCH / partial update a climate record in MySQL."""
    try:
        updated = crud.update_climate(db, climate_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="Climate not found for update")
        return crud.get_climate_by_id(db, climate_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating climate: {str(e)}")

@app.delete("/api/climates/{climate_id}")
def delete_climate(climate_id: str, db: Session = Depends(get_db)):
    """DELETE a climate record from MySQL."""
    try:
        success = crud.delete_climate(db, climate_id)
        if not success:
            raise HTTPException(status_code=404, detail="Climate not found for deletion")
        return {"status": "deleted", "climate_id": climate_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error deleting climate: {str(e)}")

# ==========================================
# MATERIALS (CRUD in MySQL)
# ==========================================

@app.get("/api/materials", response_model=Dict[str, Any])
def get_materials(db: Session = Depends(get_db)):
    """SELECT all materials from MySQL, grouped by type."""
    try:
        return crud.get_materials_dict(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error fetching materials: {str(e)}")

@app.get("/api/materials/{material_id}")
def get_material(material_id: str, db: Session = Depends(get_db)):
    """SELECT a single material from MySQL by ID."""
    try:
        mat = crud.get_material_by_id(db, material_id)
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found")
        return crud.material_model_to_dict(mat)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving material: {str(e)}")

@app.post("/api/materials", status_code=status.HTTP_201_CREATED)
def create_material(data: Dict[str, Any], db: Session = Depends(get_db)):
    """INSERT a new material record into MySQL."""
    try:
        mat = crud.create_material(db, data)
        return crud.material_model_to_dict(mat)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error creating material: {str(e)}")

@app.put("/api/materials/{material_id}")
def update_material_put(material_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """PUT / full update a material record in MySQL."""
    try:
        mat = crud.update_material(db, material_id, data)
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found for update")
        return crud.material_model_to_dict(mat)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating material: {str(e)}")

@app.patch("/api/materials/{material_id}")
def update_material_patch(material_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """PATCH / partial update a material record in MySQL."""
    try:
        mat = crud.update_material(db, material_id, data)
        if not mat:
            raise HTTPException(status_code=404, detail="Material not found for update")
        return crud.material_model_to_dict(mat)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating material: {str(e)}")

@app.delete("/api/materials/{material_id}")
def delete_material(material_id: str, db: Session = Depends(get_db)):
    """DELETE a material record from MySQL."""
    try:
        success = crud.delete_material(db, material_id)
        if not success:
            raise HTTPException(status_code=404, detail="Material not found for deletion")
        return {"status": "deleted", "material_id": material_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error deleting material: {str(e)}")

# ==========================================
# SHELTERS (CRUD in MySQL)
# ==========================================

@app.get("/api/default-shelter", response_model=ShelterDesign)
def get_default_shelter(db: Session = Depends(get_db)):
    try:
        return crud.get_default_shelter(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error fetching default shelter: {str(e)}")

@app.get("/api/shelters", response_model=List[ShelterDesign])
def list_shelters(db: Session = Depends(get_db)):
    """SELECT all shelter records from MySQL."""
    try:
        return crud.get_all_shelters(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving shelters: {str(e)}")

@app.get("/api/shelters/{shelter_id}", response_model=ShelterDesign)
def get_shelter(shelter_id: str, db: Session = Depends(get_db)):
    """SELECT a single shelter record from MySQL by primary key."""
    try:
        shelter = crud.get_shelter_by_id(db, shelter_id)
        if not shelter:
            raise HTTPException(status_code=404, detail="Shelter not found")
        return shelter
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving shelter: {str(e)}")

@app.post("/api/shelters", response_model=ShelterDesign, status_code=status.HTTP_201_CREATED)
def create_shelter(shelter: ShelterDesign, db: Session = Depends(get_db)):
    """INSERT a new shelter record into MySQL."""
    try:
        return crud.create_shelter(db, shelter)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error creating shelter: {str(e)}")

@app.put("/api/shelters/{shelter_id}", response_model=ShelterDesign)
def update_shelter(shelter_id: str, patch_data: Dict[str, Any], db: Session = Depends(get_db)):
    """UPDATE an existing shelter record in MySQL (PUT)."""
    try:
        updated = crud.update_shelter(db, shelter_id, patch_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Shelter not found for update")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating shelter: {str(e)}")

@app.patch("/api/shelters/{shelter_id}", response_model=ShelterDesign)
def patch_shelter(shelter_id: str, patch_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Partially UPDATE an existing shelter record in MySQL (PATCH)."""
    try:
        updated = crud.update_shelter(db, shelter_id, patch_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Shelter not found for update")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating shelter: {str(e)}")

@app.delete("/api/shelters/{shelter_id}")
def delete_shelter(shelter_id: str, db: Session = Depends(get_db)):
    """DELETE a shelter record and its associated simulations/reports from MySQL."""
    try:
        success = crud.delete_shelter(db, shelter_id)
        if not success:
            raise HTTPException(status_code=404, detail="Shelter not found for deletion")
        return {"status": "deleted", "shelter_id": shelter_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error deleting shelter: {str(e)}")

# ==========================================
# SIMULATION & RECOMMENDATION (PERSIST TO MySQL)
# ==========================================

@app.post("/api/simulate", response_model=SimulationResult)
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    try:
        # Save or update shelter design in MySQL
        crud.create_shelter(db, req.design)

        result = manager.run_simulation(
            design=req.design,
            engine_type=req.engine_type,
            initial_temp_c=req.initial_temp_c,
            db=db
        )

        # Persist simulation result to MySQL simulations table
        crud.save_simulation(db, result, req.design.id)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@app.get("/api/simulations/{sim_id}")
def get_simulation(sim_id: str, db: Session = Depends(get_db)):
    """SELECT simulation result from MySQL."""
    try:
        sim = crud.get_simulation_by_id(db, sim_id)
        if not sim:
            raise HTTPException(status_code=404, detail="Simulation not found")
        return {
            "id": sim.id,
            "shelter_id": sim.shelter_id,
            "engine_used": sim.engine_used,
            "mean_indoor_temp": sim.mean_indoor_temp,
            "min_indoor_temp": sim.min_indoor_temp,
            "max_indoor_temp": sim.max_indoor_temp,
            "temp_at_2am": sim.temp_at_2am,
            "total_heat_loss_kwh": sim.total_heat_loss_kwh,
            "total_solar_gain_kwh": sim.total_solar_gain_kwh,
            "comfort_verdict": sim.comfort_verdict,
            "created_at": str(sim.created_at)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving simulation: {str(e)}")

@app.delete("/api/simulations/{sim_id}")
def delete_simulation(sim_id: str, db: Session = Depends(get_db)):
    """DELETE simulation result from MySQL."""
    try:
        success = crud.delete_simulation(db, sim_id)
        if not success:
            raise HTTPException(status_code=404, detail="Simulation not found for deletion")
        return {"status": "deleted", "simulation_id": sim_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error deleting simulation: {str(e)}")

@app.post("/api/recommend", response_model=ComparisonResponse)
def get_recommendation(design: ShelterDesign, db: Session = Depends(get_db)):
    try:
        # Save base shelter design in MySQL
        crud.create_shelter(db, design)

        comparison = manager.generate_recommendation(design, db=db)

        # Save recommended shelter design in MySQL
        crud.create_shelter(db, comparison.recommended_design)

        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/api/report", response_model=DesignReport)
def generate_report(design: ShelterDesign, db: Session = Depends(get_db)):
    try:
        # Save shelter design in MySQL
        crud.create_shelter(db, design)

        report = manager.generate_report(design, db=db)

        # Save report in MySQL design_reports table
        crud.save_report(db, report, design.id)

        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

@app.get("/api/reports/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    """SELECT design report from MySQL."""
    try:
        report = crud.get_report_by_id(db, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return {
            "id": report.id,
            "shelter_id": report.shelter_id,
            "title": report.title,
            "generated_at": report.generated_at,
            "report_data": report.report_data,
            "created_at": str(report.created_at)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving report: {str(e)}")

@app.delete("/api/reports/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    """DELETE design report from MySQL."""
    try:
        success = crud.delete_report(db, report_id)
        if not success:
            raise HTTPException(status_code=404, detail="Report not found for deletion")
        return {"status": "deleted", "report_id": report_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error deleting report: {str(e)}")

# ==========================================
# AUTHENTICATION & REGISTRATION (MySQL)
# ==========================================

import re

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
@app.post("/api/auth/signup", status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new user into MySQL with secure password hashing.
    """
    # 1. Validation
    name = req.fullName.strip() if req.fullName else ""
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Full name must be at least 2 characters.")

    email = req.email.strip().lower() if req.email else ""
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")

    if not req.password or len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    if req.confirmPassword is not None and req.password != req.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # 2. Check if email already exists
    existing = crud.get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # 3. Create user in MySQL
    try:
        user = crud.create_user(db, {
            "name": name,
            "email": email,
            "password": req.password,
            "role": req.role or "architect"
        })
        token = generate_session_token(user.id, user.email)
        return {
            "status": "success",
            "message": "Account created successfully! You can now log in.",
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e).lower()
        if "duplicate" in err_msg or "unique" in err_msg:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        raise HTTPException(status_code=500, detail="Database registration failed. Please try again.")

@app.post("/api/auth/login")
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user credentials against MySQL.
    """
    email = req.email.strip().lower() if req.email else ""
    if not email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    user = crud.authenticate_user(db, email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your email and password."
        )

    token = generate_session_token(user.id, user.email)
    return {
        "status": "success",
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

# ==========================================
# USERS (CRUD in MySQL)
# ==========================================

@app.post("/api/users", status_code=status.HTTP_201_CREATED)
def create_user(user_data: Dict[str, Any], db: Session = Depends(get_db)):
    """INSERT user profile into MySQL."""
    email = user_data.get("email", "").strip().lower()
    if email:
        existing = crud.get_user_by_email(db, email)
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
    try:
        user = crud.create_user(db, user_data)
        return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e).lower()
        if "duplicate" in err_msg or "unique" in err_msg:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        raise HTTPException(status_code=500, detail="Database error creating user.")

@app.get("/api/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    """SELECT user profile from MySQL."""
    try:
        user = crud.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving user: {str(e)}")

@app.put("/api/users/{user_id}")
def update_user_put(user_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """PUT / full update a user profile in MySQL."""
    try:
        user = crud.update_user(db, user_id, data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found for update")
        return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating user: {str(e)}")

@app.patch("/api/users/{user_id}")
def update_user_patch(user_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """PATCH / partial update a user profile in MySQL."""
    try:
        user = crud.update_user(db, user_id, data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found for update")
        return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error updating user: {str(e)}")

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """DELETE user profile from MySQL."""
    try:
        success = crud.delete_user(db, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found for deletion")
        return {"status": "deleted", "user_id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error deleting user: {str(e)}")

# ==========================================
# MATPLOTLIB GRAPH ENDPOINTS
# ==========================================

@app.post("/api/graph/temperature")
def get_temperature_graph(req: TemperatureGraphRequest):
    try:
        image_bytes = generate_temperature_chart(req.hourly_data)
        return Response(content=image_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph generation error: {str(e)}")

@app.get("/api/graph/temperature")
def get_default_temperature_graph(location_id: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        design = crud.get_default_shelter(db)
        if location_id:
            design.location_id = location_id
        result = manager.run_simulation(design=design, db=db)
        image_bytes = generate_temperature_chart(result.hourly_data)
        return Response(content=image_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph generation error: {str(e)}")

# ==========================================
# FLOOR PLAN UPLOAD, COMPUTER VISION & MYSQL PERSISTENCE
# ==========================================

@app.post("/api/floorplan/analyze", response_model=FloorPlanAnalysisResponse)
async def analyze_floorplan(
    file: UploadFile = File(...),
    reference_length_m: Optional[float] = Form(None),
    reference_pixel_span: Optional[float] = Form(None),
    scale_ratio: Optional[str] = Form(None),
    ceiling_height_m: Optional[float] = Form(2.8),
    db: Session = Depends(get_db)
):
    """
    Accepts PNG, JPG, JPEG, or PDF floor plans.
    Uses OpenCV and deterministic Computer Vision (no AI/ML models).
    Extracts structural walls, architectural envelope, and pixel dimensions.
    Calibrates to real-world meters proportionally upon user reference or scale.
    Persists analysis record into MySQL.
    """
    allowed_extensions = ('.png', '.jpg', '.jpeg', '.pdf')
    filename = file.filename or "floorplan.png"
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload PNG, JPG, JPEG, or PDF floor plans."
        )

    try:
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        analysis = analyze_floorplan_image(
            file_bytes=file_bytes,
            filename=filename,
            reference_length_m=reference_length_m,
            reference_pixel_span=reference_pixel_span,
            scale_ratio=scale_ratio
        )

        # Persist floor plan analysis to MySQL database
        fp_record = crud.create_floorplan(db, {
            "filename": filename,
            "image_width_px": analysis.get("image_width"),
            "image_height_px": analysis.get("image_height"),
            "detected_pixel_length": analysis.get("pixel_length"),
            "detected_pixel_width": analysis.get("pixel_width"),
            "calibrated_length_m": analysis.get("length_m"),
            "calibrated_width_m": analysis.get("width_m"),
            "ceiling_height_m": ceiling_height_m or 2.8,
            "detection_status": "calibrated" if analysis.get("has_dimensions") else "uncalibrated",
            "scale_ratio": scale_ratio,
            "reference_measurement_m": reference_length_m
        })
        analysis["floorplan_id"] = fp_record.id

        return analysis
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Floor plan processing error: {str(e)}")

@app.post("/api/floorplan/save-measurements")
def save_floorplan_measurements(req: FloorPlanSaveRequest, db: Session = Depends(get_db)):
    """
    Updates MySQL floor plan record with user-corrected length, width, and ceiling height.
    """
    try:
        data = {
            "user_corrected_length_m": req.user_corrected_length_m,
            "user_corrected_width_m": req.user_corrected_width_m,
            "user_corrected_height_m": req.ceiling_height_m,
            "ceiling_height_m": req.ceiling_height_m,
            "detection_status": "user_confirmed"
        }
        updated = crud.update_floorplan(db, req.floorplan_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="Floor plan record not found in MySQL")
        return {
            "status": "saved",
            "floorplan_id": updated.id,
            "user_corrected_length_m": updated.user_corrected_length_m,
            "user_corrected_width_m": updated.user_corrected_width_m,
            "ceiling_height_m": updated.ceiling_height_m
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error saving measurements: {str(e)}")

@app.get("/api/floorplans")
def list_floorplans(db: Session = Depends(get_db)):
    """SELECT all floor plan records from MySQL."""
    try:
        rows = crud.list_floorplans(db)
        return [
            {
                "id": r.id,
                "filename": r.filename,
                "detected_pixel_length": r.detected_pixel_length,
                "detected_pixel_width": r.detected_pixel_width,
                "calibrated_length_m": r.calibrated_length_m,
                "calibrated_width_m": r.calibrated_width_m,
                "ceiling_height_m": r.ceiling_height_m,
                "detection_status": r.detection_status,
                "created_at": str(r.created_at)
            }
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error listing floorplans: {str(e)}")

@app.get("/api/floorplans/{floorplan_id}")
def get_floorplan(floorplan_id: str, db: Session = Depends(get_db)):
    """SELECT a single floor plan record from MySQL."""
    try:
        fp = crud.get_floorplan_by_id(db, floorplan_id)
        if not fp:
            raise HTTPException(status_code=404, detail="Floor plan record not found")
        return {
            "id": fp.id,
            "filename": fp.filename,
            "detected_pixel_length": fp.detected_pixel_length,
            "detected_pixel_width": fp.detected_pixel_width,
            "calibrated_length_m": fp.calibrated_length_m,
            "calibrated_width_m": fp.calibrated_width_m,
            "ceiling_height_m": fp.ceiling_height_m,
            "user_corrected_length_m": fp.user_corrected_length_m,
            "user_corrected_width_m": fp.user_corrected_width_m,
            "user_corrected_height_m": fp.user_corrected_height_m,
            "detection_status": fp.detection_status,
            "created_at": str(fp.created_at)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error retrieving floorplan: {str(e)}")

