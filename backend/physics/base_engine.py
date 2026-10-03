from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from ..models import ShelterDesign, SimulationResult

class BaseSimulationEngine(ABC):
    """
    Abstract Base Class for AASHRAY Simulation Engines.
    Supports Reduced-Order transient physics models, ANSYS APDL/Fluent connectors, and fast demo engines.
    """
    
    @abstractmethod
    def simulate(
        self,
        design: ShelterDesign,
        climate: Dict[str, Any],
        materials_db: Dict[str, Any],
        initial_temp_c: Optional[float] = None
    ) -> SimulationResult:
        """Run transient thermal simulation for 24-hour cycle."""
        pass

    @abstractmethod
    def get_engine_name(self) -> str:
        """Return human-readable engine name."""
        pass

    @abstractmethod
    def is_ansys_connected(self) -> bool:
        """Return True if real ANSYS environment is connected and active."""
        pass
