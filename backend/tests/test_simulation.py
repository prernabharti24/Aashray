import pytest
from backend.models import ShelterDesign, SimulationRequest
from backend.physics.simulation_manager import SimulationManager

def test_simulation_manager_loading():
    manager = SimulationManager()
    climates = manager.get_climates()
    materials = manager.get_materials()
    assert len(climates) >= 4
    assert "wall_materials" in materials
    assert "roof_materials" in materials
    assert "insulation_materials" in materials

def test_transient_simulation_ladakh():
    manager = SimulationManager()
    design = ShelterDesign(
        id="test_ladakh",
        name="Test Ladakh Shelter",
        location_id="ladakh",
        wall_material_id="adobe_mud",
        roof_material_id="mud_straw_timber",
        insulation_id="straw_woodwool",
        window_count=2,
        glazing_id="double_clear"
    )
    result = manager.run_simulation(design)
    assert result.is_reduced_order is True
    assert len(result.hourly_data) == 24
    assert result.temp_at_2am is not None
    assert result.heat_loss_breakdown.roof_percent >= 0
    assert result.total_heat_loss_kwh > 0
    # Thermal damping should be positive
    assert result.thermal_damping_ratio > 0

def test_comparison_recommendation():
    manager = SimulationManager()
    uninsulated_design = ShelterDesign(
        id="test_uninsulated",
        name="Uninsulated Brick Shelter",
        location_id="ladakh",
        wall_material_id="red_brick",
        roof_material_id="rcc_concrete",
        insulation_id="none",
        window_count=2,
        glazing_id="single_clear"
    )
    comparison = manager.generate_recommendation(uninsulated_design)
    # The recommended design with insulation & earth materials should have higher night temp in Ladakh
    assert comparison.recommended_result.temp_at_2am > comparison.current_result.temp_at_2am
    assert len(comparison.architectural_reasoning) > 0
