import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import { EnvelopeHeatExchange } from '../home/EnvelopeHeatExchange';
import {
  Compass,
  Thermometer,
  Layers,
  ArrowRight,
  Sparkles,
  MapPin,
  FileText,
  Scale,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Play
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    currentDesign,
    updateDesign,
    setActivePage,
    setIsOnboardingOpen,
    setIsComparisonOpen,
    setIsReportOpen,
    hasSimulated,
    simulationResult,
    runSimulation,
    isLoading,
    climates,
    materials
  } = useShelter();

  const activeClimate = climates.find(c => c.id === currentDesign.location_id) || climates[0];
  const activeWall = materials.wall_materials.find(w => w.id === currentDesign.wall_material_id) || materials.wall_materials[0];
  const activeRoof = materials.roof_materials.find(r => r.id === currentDesign.roof_material_id) || materials.roof_materials[0];

  const floorArea = (currentDesign.length_m * currentDesign.width_m).toFixed(1);
  const volume = (currentDesign.length_m * currentDesign.width_m * currentDesign.height_m).toFixed(1);
  const totalWindowArea = (currentDesign.window_count * currentDesign.window_width_m * currentDesign.window_height_m).toFixed(1);

  // Compass cardinal direction helper
  const getCardinalDirection = (deg: number) => {
    const val = Math.floor((deg / 45) + 0.5) % 8;
    const directions = ["North (0°)", "North-East (45°)", "East (90°)", "South-East (135°)", "South (180°)", "South-West (225°)", "West (270°)", "North-West (315°)"];
    return directions[val];
  };

  const handleQuickSimulate = async () => {
    try {
      await runSimulation();
      setActivePage('results');
    } catch (e) {
      console.error("Simulation failed", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Workspace Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFD2] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-earth uppercase tracking-widest bg-solar/40 px-2.5 py-0.5 rounded-full border border-solar">
                Shelter Architecture Studio
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 font-medium">Interactive Workspace</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest font-sans">
              Shelter Performance Dashboard
            </h1>
            
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Real-time microclimate envelope diagnostics, 24-hour diurnal thermal mass analysis, and low-carbon earth architectural design.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-solar" />
              <span>New Design Wizard</span>
            </button>

            <button
              onClick={() => setIsComparisonOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-white text-forest border border-[#D5D3C5] font-semibold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-earth" />
              <span>Compare Materials</span>
            </button>

            {hasSimulated && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-white text-forest border border-[#D5D3C5] font-semibold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-forest" />
                <span>Engineering Report</span>
              </button>
            )}
          </div>

        </div>

        {/* 1-2-3 Interactive Workflow Stepper */}
        <div className="mt-6 pt-6 border-t border-[#F0EFE6] grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            onClick={() => setActivePage('design')}
            className="flex items-center space-x-3 p-3 rounded-2xl bg-mint/60 hover:bg-mint border border-[#C8E6C9] text-left transition-all group cursor-pointer"
          >
            <span className="w-7 h-7 rounded-xl bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
              1
            </span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-forest block uppercase tracking-wider">
                1. Design Shelter
              </span>
              <p className="text-[11px] text-gray-500 truncate">Dimensions, Orientation & Earth Walls</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-forest/60 ml-auto group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          <button
            onClick={() => setActivePage('simulation')}
            className={`flex items-center space-x-3 p-3 rounded-2xl border text-left transition-all group cursor-pointer ${
              hasSimulated
                ? 'bg-mint/60 hover:bg-mint border-[#C8E6C9]'
                : 'bg-white hover:bg-[#FAF9F5] border-[#E2DFD2]'
            }`}
          >
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform ${
              hasSimulated ? 'bg-forest text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              2
            </span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-forest block uppercase tracking-wider">
                2. Simulate Heat Flux
              </span>
              <p className="text-[11px] text-gray-500 truncate">24h Diurnal Physics Solver</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-forest/60 ml-auto group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          <button
            onClick={() => setActivePage('results')}
            className={`flex items-center space-x-3 p-3 rounded-2xl border text-left transition-all group cursor-pointer ${
              hasSimulated
                ? 'bg-solar/35 hover:bg-solar/50 border-[#FFE082]'
                : 'bg-white hover:bg-[#FAF9F5] border-[#E2DFD2]'
            }`}
          >
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform ${
              hasSimulated ? 'bg-forest text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              3
            </span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-forest block uppercase tracking-wider">
                3. Comfort Results
              </span>
              <p className="text-[11px] text-gray-500 truncate">
                {hasSimulated ? 'Results Ready • View Curves' : 'Thermal Deltas & Advice'}
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-forest/60 ml-auto group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

        </div>
      </div>

      {/* ACTIVE PROJECT & INTERACTIVE MICROCLIMATE CONTROLS */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E0DED3] shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#F0EFE6]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-earth">
                Active Project
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-forest font-semibold bg-mint px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                {currentDesign.shelter_type}
              </span>
            </div>
            <h2 className="text-xl font-bold text-forest font-sans mt-0.5">
              {currentDesign.name}
            </h2>
          </div>

          {/* Quick Simulate Trigger */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuickSimulate}
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Solving Physics...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-solar fill-solar" />
                  <span>Run 24h Solver</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActivePage('design')}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-white text-forest border border-[#D5D3C5] font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <span>Edit Assembly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Microclimate Station Selector */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>Target Microclimate Station</span>
            </span>
            <span className="text-[11px] text-gray-400">Click to switch regional design climate</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {climates.map(cl => {
              const isSelected = cl.id === activeClimate.id;
              const minT = Math.min(...(cl.hourly_outdoor_temp || [-15]));
              const maxT = Math.max(...(cl.hourly_outdoor_temp || [25]));
              return (
                <button
                  key={cl.id}
                  onClick={() => updateDesign({ location_id: cl.id })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-forest text-white border-forest shadow-md'
                      : 'bg-[#FAF9F5] hover:bg-white text-gray-700 border-[#E5E3D8] hover:border-forest/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold truncate">
                      {cl.name.split(' (')[0]}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-solar shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] space-y-0.5 opacity-85">
                    <div>Min: {minT.toFixed(0)}°C • Max: {maxT.toFixed(0)}°C</div>
                    <div>Alt: {cl.altitude_m}m</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4 INTERACTIVE ARCHITECTURAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Geometry */}
        <div 
          onClick={() => setActivePage('design')}
          className="bg-white rounded-3xl p-5 border border-[#E2DFD2] shadow-2xs hover:shadow-md hover:border-forest/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-mint text-forest flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-forest transition-colors">
                Geometry
              </span>
            </div>
            <div className="text-xl font-bold text-forest font-mono">
              {currentDesign.length_m}m × {currentDesign.width_m}m
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Height: {currentDesign.height_m}m • Area: {floorArea} m²
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F4EE] flex items-center justify-between text-[11px] text-forest font-semibold">
            <span>Volume: {volume} m³</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Solar Orientation */}
        <div 
          onClick={() => setActivePage('design')}
          className="bg-white rounded-3xl p-5 border border-[#E2DFD2] shadow-2xs hover:shadow-md hover:border-forest/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-solar/40 text-earth flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-forest transition-colors">
                Orientation
              </span>
            </div>
            <div className="text-base font-bold text-forest">
              {getCardinalDirection(currentDesign.orientation_deg)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentDesign.window_count} Windows • Area: {totalWindowArea} m²
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F4EE] flex items-center justify-between text-[11px] text-forest font-semibold">
            <span>Passive Solar Capture</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Envelope Materials */}
        <div 
          onClick={() => setIsComparisonOpen(true)}
          className="bg-white rounded-3xl p-5 border border-[#E2DFD2] shadow-2xs hover:shadow-md hover:border-forest/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-soft-blue text-[#1E3A8A] flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-forest transition-colors">
                Materials
              </span>
            </div>
            <div className="text-sm font-bold text-forest line-clamp-1">
              {activeWall ? activeWall.name : 'Adobe Mud'}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              Roof: {activeRoof ? activeRoof.name : 'Timber Deck'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F4EE] flex items-center justify-between text-[11px] text-forest font-semibold">
            <span>Thermal Mass Flywheel</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Thermal Comfort Status */}
        <div 
          onClick={() => setActivePage(hasSimulated ? 'results' : 'simulation')}
          className="bg-white rounded-3xl p-5 border border-[#E2DFD2] shadow-2xs hover:shadow-md hover:border-forest/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-mint text-forest flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-forest transition-colors">
                Comfort Solver
              </span>
            </div>
            {hasSimulated && simulationResult ? (
              <>
                <div className="text-xl font-bold text-forest font-mono">
                  {simulationResult.min_indoor_temp.toFixed(1)}°C
                  <span className="text-xs font-sans text-gray-500 ml-1">2 AM Min</span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  2 AM Outdoor: {simulationResult.outdoor_temp_at_2am.toFixed(1)}°C (+{(simulationResult.min_indoor_temp - simulationResult.outdoor_temp_at_2am).toFixed(1)}°C buffer)
                </p>
              </>
            ) : (
              <>
                <div className="text-base font-bold text-gray-700">
                  Ready for Solver
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Click to simulate diurnal performance
                </p>
              </>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F4EE] flex items-center justify-between text-[11px] text-forest font-semibold">
            <span>{hasSimulated ? 'View 24h Curves' : 'Run Simulation'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* CORE ARCHITECTURAL HUBS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Hub 1: 3D Geometry Studio */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-mint text-forest flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-earth block mb-1">
              Module 1
            </span>
            <h3 className="text-lg font-bold text-forest font-sans">
              3D Design Studio
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Configure shelter dimensions, cardinal solar orientation, earth wall thickness, roof overhangs, and window assemblies.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#F5F4EE]">
            <button
              onClick={() => setActivePage('design')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-forest hover:bg-teal-dark text-white font-semibold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span>Open 3D Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hub 2: Physics Simulation Engine */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-soft-blue text-[#1E3A8A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Thermometer className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-earth block mb-1">
              Module 2
            </span>
            <h3 className="text-lg font-bold text-forest font-sans">
              Transient Thermal Solver
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Execute high-precision 24-hour diurnal heat diffusion calculations. Diagnose dominant heat-loss pathways and critical night lows.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#F5F4EE]">
            <button
              onClick={() => setActivePage('simulation')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-forest hover:bg-teal-dark text-white font-semibold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span>Run Thermal Solver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hub 3: Material Comparison & Flywheel */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-solar/40 text-forest flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-earth block mb-1">
              Module 3
            </span>
            <h3 className="text-lg font-bold text-forest font-sans">
              Material Comparison
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Benchmark sustainable earth materials against conventional brick and concrete. Quantify embodied carbon and thermal lag deltas.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#F5F4EE]">
            <button
              onClick={() => setIsComparisonOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#FAF9F5] hover:bg-white text-forest border border-[#D5D3C5] font-semibold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <span>Compare Assemblies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ARCHITECTURAL MICROCLIMATE PHYSICS: ENVELOPE HEAT EXCHANGE */}
      <div>
        <EnvelopeHeatExchange />
      </div>

    </div>
  );
};
