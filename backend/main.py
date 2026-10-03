from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from .models import (
    ShelterDesign,
    SimulationRequest,
    SimulationResult,
    ComparisonResponse,
    DesignReport
)
from .physics.simulation_manager import SimulationManager

app = FastAPI(
    title="AASHRAY API — Mitti Se Mausam Tak",
    description="Backend API for climate-responsive shelter design and thermal performance simulation (SIH26051 DRDO)",
    version="1.0.0"
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

@app.get("/")
def root():
    return {
        "app": "AASHRAY",
        "subtitle": "Mitti Se Mausam Tak",
        "tagline": "Design a shelter for its climate.",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": "2026-09-28T12:00:00Z"}

@app.get("/api/climates", response_model=List[Dict[str, Any]])
def get_climates():
    return manager.get_climates()

@app.get("/api/materials", response_model=Dict[str, Any])
def get_materials():
    return manager.get_materials()

@app.get("/api/default-shelter", response_model=ShelterDesign)
def get_default_shelter():
    return ShelterDesign(
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

@app.post("/api/simulate", response_model=SimulationResult)
def run_simulation(req: SimulationRequest):
    try:
        result = manager.run_simulation(
            design=req.design,
            engine_type=req.engine_type,
            initial_temp_c=req.initial_temp_c
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@app.post("/api/recommend", response_model=ComparisonResponse)
def get_recommendation(design: ShelterDesign):
    try:
        comparison = manager.generate_recommendation(design)
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/api/report", response_model=DesignReport)
def generate_report(design: ShelterDesign):
    try:
        report = manager.generate_report(design)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")
