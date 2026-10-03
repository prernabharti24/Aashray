from typing import Dict, Any, Optional
from .base_engine import BaseSimulationEngine
from .reduced_order_engine import ReducedOrderSimulationEngine
from ..models import ShelterDesign, SimulationResult

class DemoSimulationEngine(BaseSimulationEngine):
    """
    Demo simulation engine wrapping reduced-order engine with explicit Demo tags.
    """
    def __init__(self):
        self.underlying_engine = ReducedOrderSimulationEngine()

    def get_engine_name(self) -> str:
        return "Demo / Fast Transient Model"

    def is_ansys_connected(self) -> bool:
        return False

    def simulate(
        self,
        design: ShelterDesign,
        climate: Dict[str, Any],
        materials_db: Dict[str, Any],
        initial_temp_c: Optional[float] = None
    ) -> SimulationResult:
        result = self.underlying_engine.simulate(design, climate, materials_db, initial_temp_c)
        result.engine_used = "Demo / Reduced-Order Model Result"
        return result
