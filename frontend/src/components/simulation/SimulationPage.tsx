import React, { useState } from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  Thermometer,
  MapPin,
  Layers,
  Sparkles,
  Play,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const SimulationPage: React.FC = () => {
  const {
    currentDesign,
    runSimulation,
    setActivePage,
    climates,
    materials
  } = useShelter();

  const [initialTemp, setInitialTemp] = useState<number>(18.0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const activeClimate = climates.find(c => c.id === currentDesign.location_id) || climates[0];
  const wallMat = materials.wall_materials.find(m => m.id === currentDesign.wall_material_id) || materials.wall_materials[0];

  const simulationSteps = [
    { label: "Preparing climate data & diurnal irradiance curves...", icon: MapPin },
    { label: "Loading shelter 3D dimensions & surface areas...", icon: Layers },
    { label: "Applying material thermal conductivities & capacitance...", icon: Cpu },
    { label: "Applying sol-air solar boundary conditions...", icon: Sparkles },
    { label: "Executing 24-hr transient differential thermal solver...", icon: Thermometer },
    { label: "Generating heat flux breakdown & architectural insights...", icon: CheckCircle2 }
  ];

  const handleStartSimulation = async () => {
    setIsSimulating(true);
    setCurrentStepIndex(0);

    // Step-by-step progress animation
    for (let i = 0; i < simulationSteps.length; i++) {
      setCurrentStepIndex(i);
      await new Promise(resolve => setTimeout(resolve, 450));
    }

    try {
      await runSimulation(initialTemp);
      setTimeout(() => {
        setIsSimulating(false);
        setActivePage('results');
      }, 300);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
      setActivePage('results');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-mint text-forest border border-[#C8E6C9] text-xs font-bold uppercase tracking-wider">
          <Thermometer className="w-3.5 h-3.5 text-forest" />
          <span>Transient Physics Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest font-sans">
          How will your shelter perform?
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          Simulate 24 hours of ambient weather, solar heat influx, and internal envelope heat exchange.
        </p>
      </div>

      {/* Selected Shelter Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFD2] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0EFE6] pb-4">
          <div>
            <span className="text-[11px] font-bold text-earth uppercase tracking-widest">
              Target Architecture
            </span>
            <h3 className="text-2xl font-bold text-forest font-sans mt-0.5">
              {currentDesign.name}
            </h3>
            <span className="text-xs text-gray-500 font-medium">{currentDesign.shelter_type}</span>
          </div>

          <div className="bg-mint/60 border border-[#C8E6C9] px-4 py-2 rounded-2xl text-xs font-bold text-forest">
            <span className="text-leaf">✓</span> Ready for Transient Solver
          </div>
        </div>

        {/* 4 Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EBE8DC]">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Location</span>
            <span className="font-bold text-forest text-sm">{activeClimate.name.split(' (')[0]}</span>
            <span className="text-[10px] text-earth block mt-0.5">Tmin: {Math.min(...activeClimate.hourly_outdoor_temp)}°C</span>
          </div>

          <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EBE8DC]">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Dimensions</span>
            <span className="font-bold text-forest text-sm">{currentDesign.length_m}m × {currentDesign.width_m}m</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Volume: {(currentDesign.length_m * currentDesign.width_m * currentDesign.height_m).toFixed(1)} m³</span>
          </div>

          <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EBE8DC]">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Wall Material</span>
            <span className="font-bold text-forest text-sm truncate block">{wallMat.name.split(' (')[0]}</span>
            <span className="text-[10px] text-earth block mt-0.5">{wallMat.is_local_earth ? '🌱 High Thermal Mass' : 'Standard Masonry'}</span>
          </div>

          <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EBE8DC]">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Orientation</span>
            <span className="font-bold text-forest text-sm">{currentDesign.orientation_deg}°</span>
            <span className="text-[10px] text-forest block mt-0.5">{currentDesign.orientation_deg === 180 ? 'South (Solar Trap)' : 'Custom Facing'}</span>
          </div>
        </div>

        {/* SIMULATION SETTINGS */}
        <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-[#E5E3D8] space-y-4">
          <h4 className="text-xs font-bold text-forest uppercase tracking-wider">
            Simulation Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Simulation Horizon
              </label>
              <div className="bg-white border border-[#D5D3C5] px-3 py-2.5 rounded-xl font-bold text-forest">
                24 Hours Diurnal Cycle
              </div>
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Climate Zone
              </label>
              <div className="bg-white border border-[#D5D3C5] px-3 py-2.5 rounded-xl font-bold text-forest truncate">
                {activeClimate.name.split(' (')[0]}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Initial Indoor Temp (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={initialTemp}
                onChange={e => setInitialTemp(parseFloat(e.target.value) || 18.0)}
                className="w-full bg-white border border-[#D5D3C5] px-3 py-2 rounded-xl font-bold text-forest focus:ring-2 focus:ring-forest outline-none"
              />
            </div>
          </div>
        </div>

        {/* PROGRESS ANIMATION / RUN BUTTON */}
        {!isSimulating ? (
          <div className="pt-2 flex flex-col items-center">
            <button
              onClick={handleStartSimulation}
              className="w-full sm:w-2/3 py-4 rounded-2xl bg-forest hover:bg-teal-dark text-white font-extrabold text-base shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3 bg-linear-to-r from-forest to-teal-dark"
            >
              <Play className="w-5 h-5 fill-solar text-solar" />
              <span>RUN SIMULATION</span>
            </button>
            <span className="text-[11px] text-gray-500 mt-2">
              Reduced-Order Transient Solver • Time step: 1 hour (360s sub-steps)
            </span>
          </div>
        ) : (
          <div className="py-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-forest">
                <span>Running Transient Thermal Simulation...</span>
                <span>{Math.round(((currentStepIndex + 1) / simulationSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[#E5E3D8] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-leaf h-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / simulationSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-2 pt-2">
              {simulationSteps.map((s, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 text-xs p-2 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-mint text-forest font-bold shadow-2xs scale-[1.01]'
                        : isPassed
                        ? 'text-forest/80 font-medium'
                        : 'text-gray-400 opacity-60'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isPassed ? 'bg-leaf text-white text-[10px]' : isCurrent ? 'bg-forest text-solar text-[10px] animate-spin' : 'bg-gray-200'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
