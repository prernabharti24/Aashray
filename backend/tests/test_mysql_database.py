import os
import pytest
from sqlalchemy import text
from backend.database import SessionLocal, init_db, engine
from backend import crud
from backend.models import ShelterDesign, AdvancedSettings
from backend.physics.simulation_manager import SimulationManager

@pytest.fixture(scope="function")
def db_session():
    init_db()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

def test_mysql_connection_and_tables(db_session):
    # Test connection and database name
    current_db = db_session.execute(text("SELECT DATABASE();")).scalar()
    assert current_db == "aashray_db"

    # Verify all tables exist
    result = db_session.execute(text("SHOW TABLES;")).fetchall()
    tables = [r[0] for r in result]
    expected_tables = ["climates", "materials", "shelters", "simulations", "design_reports", "users", "floorplans"]
    for t in expected_tables:
        assert t in tables, f"Expected table '{t}' was not found in MySQL"

def test_mysql_climates_and_materials_seeded(db_session):
    climates = crud.get_climates(db_session)
    assert len(climates) >= 5
    ids = [c["id"] for c in climates]
    assert "ladakh" in ids
    assert "dras" in ids
    assert "jaisalmer" in ids

    materials = crud.get_materials_dict(db_session)
    assert len(materials["wall_materials"]) >= 4
    assert len(materials["roof_materials"]) >= 3
    assert len(materials["insulation_materials"]) >= 3
    assert len(materials["glazing_types"]) >= 3

def test_mysql_shelter_crud_operations(db_session):
    test_id = "test_crud_shelter_99"

    # Clean up prior test data if exists
    crud.delete_shelter(db_session, test_id)

    # 1. INSERT
    shelter = ShelterDesign(
        id=test_id,
        name="MySQL CRUD Test Shelter",
        location_id="ladakh",
        shelter_type="Emergency Unit",
        length_m=6.0,
        width_m=4.0,
        height_m=3.0,
        orientation_deg=180.0,
        wall_material_id="adobe_mud",
        roof_material_id="mud_straw_timber",
        insulation_id="straw_woodwool",
        window_count=3,
        window_width_m=1.0,
        window_height_m=1.2,
        glazing_id="double_clear",
        advanced_settings=AdvancedSettings(infiltration_rate_ach=0.8)
    )
    created = crud.create_shelter(db_session, shelter)
    assert created.id == test_id
    assert created.name == "MySQL CRUD Test Shelter"

    # 2. SELECT (by ID and list)
    fetched = crud.get_shelter_by_id(db_session, test_id)
    assert fetched is not None
    assert fetched.length_m == 6.0
    assert fetched.wall_material_id == "adobe_mud"

    all_shelters = crud.get_all_shelters(db_session)
    assert any(s.id == test_id for s in all_shelters)

    # 3. UPDATE
    updated = crud.update_shelter(db_session, test_id, {
        "name": "Updated MySQL Test Shelter",
        "length_m": 7.5,
        "width_m": 5.0
    })
    assert updated is not None
    assert updated.name == "Updated MySQL Test Shelter"
    assert updated.length_m == 7.5
    assert updated.width_m == 5.0

    # 4. DELETE
    deleted = crud.delete_shelter(db_session, test_id)
    assert deleted is True
    assert crud.get_shelter_by_id(db_session, test_id) is None

def test_mysql_simulation_persistence(db_session):
    shelter_id = "test_sim_shelter_01"
    crud.delete_shelter(db_session, shelter_id)

    shelter = ShelterDesign(
        id=shelter_id,
        name="Simulation Persistence Shelter",
        location_id="dras",
        shelter_type="High Altitude Barracks",
        length_m=5.0,
        width_m=4.0,
        height_m=2.8,
        orientation_deg=180.0,
        wall_material_id="adobe_mud",
        roof_material_id="mud_straw_timber",
        insulation_id="straw_woodwool",
        window_count=2,
        window_width_m=1.0,
        window_height_m=1.0,
        glazing_id="double_clear"
    )
    crud.create_shelter(db_session, shelter)

    manager = SimulationManager(db=db_session)
    res = manager.run_simulation(shelter, db=db_session)

    # Persist to MySQL
    sim_record = crud.save_simulation(db_session, res, shelter_id)
    assert sim_record.id is not None
    assert sim_record.shelter_id == shelter_id
    assert sim_record.temp_at_2am == res.temp_at_2am

    # Query back
    latest = crud.get_latest_simulation_by_shelter(db_session, shelter_id)
    assert latest is not None
    assert latest.temp_at_2am == res.temp_at_2am

    # Clean up (Cascade will remove simulations)
    crud.delete_shelter(db_session, shelter_id)
    assert crud.get_simulation_by_id(db_session, sim_record.id) is None

def test_mysql_user_crud(db_session):
    user_id = "test_user_drdo"
    crud.delete_user(db_session, user_id)

    # INSERT
    user = crud.create_user(db_session, {
        "id": user_id,
        "email": "drdo_architect@aashray.gov.in",
        "name": "DRDO Field Architect",
        "role": "lead_designer"
    })
    assert user.id == user_id
    assert user.email == "drdo_architect@aashray.gov.in"

    # SELECT
    fetched = crud.get_user_by_email(db_session, "drdo_architect@aashray.gov.in")
    assert fetched is not None
    assert fetched.name == "DRDO Field Architect"

    # UPDATE
    updated = crud.update_user(db_session, user_id, {"name": "Chief DRDO Architect"})
    assert updated.name == "Chief DRDO Architect"

    # DELETE
    crud.delete_user(db_session, user_id)
    assert crud.get_user_by_id(db_session, user_id) is None

def test_mysql_climate_crud(db_session):
    test_id = "test_climate_alpine"
    crud.delete_climate(db_session, test_id)

    # 1. INSERT
    clim_data = {
        "id": test_id,
        "name": "Alpine Cold Valley",
        "region": "Himalayas",
        "altitude_m": 4200.0,
        "description": "High altitude test zone",
        "latitude": 32.5,
        "design_day": "Midwinter",
        "hourly_outdoor_temp": [-10.0] * 24,
        "hourly_solar_irradiance": [100.0] * 24,
        "hourly_wind_speed": [4.0] * 24,
        "ground_temp": -3.0,
        "recommended_focus": "Extreme thermal envelope"
    }
    created = crud.create_climate(db_session, clim_data)
    assert created.id == test_id

    # 2. SELECT
    fetched = crud.get_climate_by_id(db_session, test_id)
    assert fetched is not None
    assert fetched["name"] == "Alpine Cold Valley"

    # 3. UPDATE
    updated = crud.update_climate(db_session, test_id, {"name": "Updated Alpine Valley"})
    assert updated.name == "Updated Alpine Valley"

    # 4. DELETE
    deleted = crud.delete_climate(db_session, test_id)
    assert deleted is True
    assert crud.get_climate_by_id(db_session, test_id) is None

def test_mysql_material_crud(db_session):
    test_id = "test_mat_aerogel"
    crud.delete_material(db_session, test_id)

    # 1. INSERT
    mat_data = {
        "id": test_id,
        "name": "Silica Aerogel Blanket",
        "category": "insulation",
        "material_type": "insulation",
        "is_local_earth": False,
        "description": "Advanced thermal blanket",
        "thickness_m": 0.02,
        "conductivity_w_mk": 0.015,
        "density_kg_m3": 160.0,
        "u_reduction_factor": 0.15
    }
    created = crud.create_material(db_session, mat_data, material_type="insulation")
    assert created.id == test_id

    # 2. SELECT
    fetched = crud.get_material_by_id(db_session, test_id)
    assert fetched is not None
    assert fetched.name == "Silica Aerogel Blanket"

    # 3. UPDATE
    updated = crud.update_material(db_session, test_id, {"conductivity_w_mk": 0.014})
    assert updated.conductivity_w_mk == 0.014

    # 4. DELETE
    deleted = crud.delete_material(db_session, test_id)
    assert deleted is True
    assert crud.get_material_by_id(db_session, test_id) is None

def test_mysql_floorplan_crud(db_session):
    test_id = "test_fp_mysql_101"
    crud.delete_floorplan(db_session, test_id)

    # 1. INSERT
    fp = crud.create_floorplan(db_session, {
        "id": test_id,
        "filename": "architectural_floorplan.png",
        "image_width_px": 800,
        "image_height_px": 600,
        "detected_pixel_length": 500.0,
        "detected_pixel_width": 380.0,
        "calibrated_length_m": 7.5,
        "calibrated_width_m": 5.7,
        "ceiling_height_m": 2.8,
        "detection_status": "calibrated",
        "reference_measurement_m": 7.5
    })
    assert fp.id == test_id
    assert fp.filename == "architectural_floorplan.png"

    # 2. SELECT
    fetched = crud.get_floorplan_by_id(db_session, test_id)
    assert fetched is not None
    assert fetched.detected_pixel_length == 500.0
    assert fetched.calibrated_length_m == 7.5

    # 3. UPDATE (User-corrected measurements & ceiling height)
    updated = crud.update_floorplan(db_session, test_id, {
        "user_corrected_length_m": 8.0,
        "user_corrected_width_m": 6.0,
        "ceiling_height_m": 3.0,
        "detection_status": "user_confirmed"
    })
    assert updated is not None
    assert updated.user_corrected_length_m == 8.0
    assert updated.user_corrected_width_m == 6.0
    assert updated.ceiling_height_m == 3.0
    assert updated.detection_status == "user_confirmed"

    # 4. DELETE
    deleted = crud.delete_floorplan(db_session, test_id)
    assert deleted is True
    assert crud.get_floorplan_by_id(db_session, test_id) is None
