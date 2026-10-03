import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  Compass,
  Thermometer,
  ArrowRight,
  Sparkles,
  MapPin,
  Layers,
  Clock,
  BarChart2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    currentDesign,
    setActivePage,
    setIsOnboardingOpen,
    hasSimulated,
    climates
  } = useShelter();

  const activeClimate = climates.find(c => c.id === currentDesign.location_id) || climates[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Workspace Header */}
      <div className="border-b border-[#E2DFD2] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-earth uppercase tracking-widest">
                AASHRAY Workspace
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">SIH26051 DRDO</span>
            </div>
            <h1 className="text-3xl font-extrabold text-forest mt-1 font-sans">
              Your Shelter Design Workspace
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Follow the simple 3-step workflow to design, simulate, and improve shelter thermal resilience.
            </p>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-forest border border-[#D5D3C5] font-semibold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-earth" />
            <span>New Design Wizard</span>
          </button>
        </div>

        {/* 1-2-3 Simple Workflow Banner */}
        <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl">
          <div className="flex items-center space-x-2 bg-mint/50 border border-[#C8E6C9] px-3 py-2 rounded-xl text-xs font-bold text-forest">
            <span className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center text-[10px]">1</span>
            <span>DESIGN</span>
          </div>
          <div className={`flex items-center space-x-2 border px-3 py-2 rounded-xl text-xs font-bold ${
            hasSimulated
              ? 'bg-mint/50 border-[#C8E6C9] text-forest'
              : 'bg-white border-[#E2DFD2] text-[#4A5568]'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              hasSimulated ? 'bg-forest text-white' : 'bg-gray-200 text-gray-700'
            }`}>2</span>
            <span>SIMULATE</span>
          </div>
          <div className={`flex items-center space-x-2 border px-3 py-2 rounded-xl text-xs font-bold ${
            hasSimulated
              ? 'bg-solar/30 border-[#FFE082] text-forest'
              : 'bg-white border-[#E2DFD2] text-[#4A5568]'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              hasSimulated ? 'bg-forest text-white' : 'bg-gray-200 text-gray-700'
            }`}>3</span>
            <span>UNDERSTAND</span>
          </div>
        </div>
      </div>

      {/* TWO MAIN FEATURE CARDS (Responsive: 2 columns on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: DESIGN YOUR SHELTER */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-[#E2DFD2] hover:border-forest/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center text-3xl mb-5 shadow-inner">
              🏠
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-forest/70 block mb-1">
              Step 1
            </span>
            <h2 className="text-2xl font-bold text-forest font-sans group-hover:text-teal-dark transition-colors">
              DESIGN YOUR SHELTER
            </h2>
            <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">
              Create your shelter by choosing its location, size, orientation, window openings and local earth materials.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#F0EFE6]">
            <button
              onClick={() => setActivePage('design')}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-forest hover:bg-teal-dark text-white font-bold text-sm shadow-md transition-all active:scale-95 group-hover:shadow-lg"
            >
              <Compass className="w-4 h-4 text-solar" />
              <span>Design Shelter</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: CHECK THERMAL PERFORMANCE */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-[#E2DFD2] hover:border-forest/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-soft-blue flex items-center justify-center text-3xl mb-5 shadow-inner">
              🌡️
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-forest/70 block mb-1">
              Step 2 & 3
            </span>
            <h2 className="text-2xl font-bold text-forest font-sans group-hover:text-teal-dark transition-colors">
              CHECK THERMAL PERFORMANCE
            </h2>
            <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">
              Simulate your shelter and see how its temperature changes throughout the 24-hour day and night cycle.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#F0EFE6]">
            <button
              onClick={() => setActivePage('simulation')}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-forest hover:bg-teal-dark text-white font-bold text-sm shadow-md transition-all active:scale-95 group-hover:shadow-lg"
            >
              <Thermometer className="w-4 h-4 text-solar" />
              <span>Run Simulation</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* CURRENT PROJECT CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E0DED3] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-earth">
                Active Project
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{currentDesign.shelter_type}</span>
            </div>
            <h3 className="text-xl font-bold text-forest font-sans">
              {currentDesign.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>Location: <strong>{activeClimate.name.split(' (')[0]}</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-earth" />
                <span>Dimensions: <strong>{currentDesign.length_m}m × {currentDesign.width_m}m × {currentDesign.height_m}m</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Status: </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  hasSimulated ? 'bg-mint text-forest' : 'bg-solar/50 text-forest'
                }`}>
                  {hasSimulated ? 'Simulated (Results Ready)' : 'Ready for Simulation'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {hasSimulated ? (
              <button
                onClick={() => setActivePage('results')}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-xs shadow-md transition-all"
              >
                <BarChart2 className="w-4 h-4 text-solar" />
                <span>View Results</span>
              </button>
            ) : null}
            
            <button
              onClick={() => setActivePage('design')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-white text-forest border border-[#D5D3C5] font-bold text-xs shadow-2xs transition-all"
            >
              <span>Continue Design</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
