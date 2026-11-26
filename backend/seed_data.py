import os
import json
from .database import SessionLocal, init_db
from . import crud
from .models import ShelterDesign

def seed_database():
    print("Initializing MySQL database schema...")
    init_db()

    data_dir = os.path.join(os.path.dirname(__file__), "data_backup")
    if not os.path.exists(data_dir):
        data_dir = os.path.join(os.path.dirname(__file__), "data")

    climates_path = os.path.join(data_dir, "climates.json")
    materials_path = os.path.join(data_dir, "materials.json")

    db = SessionLocal()
    try:
        # 1. Seed Climates
        if os.path.exists(climates_path):
            with open(climates_path, "r", encoding="utf-8") as f:
                climates = json.load(f)
            for c in climates:
                crud.create_climate(db, c)
            print(f"Seeded {len(climates)} climates into MySQL.")

        # 2. Seed Materials
        if os.path.exists(materials_path):
            with open(materials_path, "r", encoding="utf-8") as f:
                materials = json.load(f)

            count_mats = 0
            for w in materials.get("wall_materials", []):
                crud.create_material(db, w, material_type="wall")
                count_mats += 1
            for r in materials.get("roof_materials", []):
                crud.create_material(db, r, material_type="roof")
                count_mats += 1
            for i in materials.get("insulation_materials", []):
                crud.create_material(db, i, material_type="insulation")
                count_mats += 1
            for g in materials.get("glazing_types", []):
                crud.create_material(db, g, material_type="glazing")
                count_mats += 1
            print(f"Seeded {count_mats} materials into MySQL.")

        # 3. Seed Default Shelter
        default_shelter = ShelterDesign(
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
        crud.create_shelter(db, default_shelter, is_default=True)
        print("Seeded default shelter into MySQL.")

        # 4. Verify counts
        db_climates = crud.get_climates(db)
        db_materials = crud.get_materials_dict(db)
        db_shelters = crud.get_all_shelters(db)
        print(f"Verification: {len(db_climates)} climates, {sum(len(v) for v in db_materials.values())} materials, {len(db_shelters)} shelters in MySQL.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
