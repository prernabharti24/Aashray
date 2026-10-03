import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  Sparkles,
  ArrowRight,
  Sun,
  Wind,
  Flame,
  Snowflake,
  Layers,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setIsOnboardingOpen, setActivePage } = useShelter();

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Subtle top badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-mint border border-[#C8E6C9] shadow-2xs mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-leaf animate-ping" />
            <span className="text-xs font-bold text-forest uppercase tracking-wider">
              SIH26051 • DRDO Shelter Architecture
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-forest tracking-tight max-w-4xl mx-auto font-sans leading-tight">
            Design a shelter for its climate.
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-serif text-earth italic max-w-2xl mx-auto">
            “Mitti Se Mausam Tak”
          </p>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed">
            A physics-based platform for designing area-specific shelters and understanding their thermal performance. 
            Connect local earth materials with extreme high-altitude and desert microclimates.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-forest hover:bg-teal-dark text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center space-x-3 active:scale-95 group"
            >
              <Sparkles className="w-5 h-5 text-solar group-hover:rotate-12 transition-transform" />
              <span>Start Your First Design</span>
              <ArrowRight className="w-5 h-5 text-solar/80 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#F3F2EA] text-forest font-semibold text-base border border-[#D5D3C5] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Open Workspace</span>
            </button>
          </div>

        </div>
      </section>

      {/* Architectural Illustration Section (Sun, Wind, Shelter, Heat Entering, Heat Leaving) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E0DED3] shadow-lg relative overflow-hidden">
          
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-earth">Architectural Microclimate Physics</span>
            <h3 className="text-xl font-bold text-forest mt-1">How AASHRAY Simulates Envelope Heat Exchange</h3>
          </div>

          {/* Conceptual 2D Architectural Cross-Section Schematic */}
          <div className="relative w-full h-80 sm:h-96 bg-linear-to-b from-[#EDF5FF] via-[#FAF9F3] to-[#EBE9DE] rounded-2xl border border-[#DCDAD0] p-4 flex items-center justify-center overflow-hidden">
            
            {/* Sun in Sky */}
            <div className="absolute top-4 right-8 sm:right-16 flex flex-col items-center animate-pulse duration-1000">
              <div className="w-16 h-16 rounded-full bg-solar border-2 border-[#E5C158] flex items-center justify-center shadow-lg">
                <Sun className="w-9 h-9 text-[#D97706]" />
              </div>
              <span className="text-xs font-bold text-[#B45309] mt-1 bg-white/80 px-2 py-0.5 rounded-full border border-solar">
                Direct Solar Irradiance
              </span>
            </div>

            {/* Wind Vector */}
            <div className="absolute top-12 left-6 sm:left-12 flex items-center space-x-2 bg-white/85 px-3 py-1.5 rounded-full border border-soft-blue shadow-xs">
              <Wind className="w-5 h-5 text-[#3B82F6] animate-bounce" />
              <div className="text-xs">
                <span className="font-bold text-[#1E40AF] block">Cold Mountain Wind</span>
                <span className="text-[10px] text-gray-500">Convective envelope cooling</span>
              </div>
            </div>

            {/* Heat Influx Arrows from Sun */}
            <div className="absolute top-24 right-28 sm:right-40 flex items-center space-x-1 text-[#EA580C] bg-white/90 px-2.5 py-1 rounded-full border border-[#FDBA74] text-xs font-bold shadow-xs">
              <Flame className="w-4 h-4 text-[#EA580C]" />
              <span>Heat Entering (Solar Gain)</span>
            </div>

            {/* Main Shelter Structure Illustration */}
            <div className="relative w-64 sm:w-80 h-44 sm:h-52 bg-white rounded-t-xl border-4 border-forest shadow-2xl flex flex-col justify-between p-4 z-10">
              
              {/* Sloping / Flat Insulated Roof */}
              <div className="absolute -top-6 -left-3 -right-3 h-8 bg-[#8B4513] rounded-t-lg border-2 border-[#5C2E0B] flex items-center justify-between px-3 text-white text-[10px] font-bold shadow-md">
                <span>🌱 Earth / Timber Roof</span>
                <span className="bg-solar text-forest px-1.5 py-0.2 rounded text-[9px]">U = 1.4 W/m²K</span>
              </div>

              {/* Interior Zone */}
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-forest bg-mint px-2.5 py-1 rounded-full border border-[#C8E6C9] inline-block mb-1">
                  Shelter Interior Comfort Zone
                </span>
                <p className="text-[11px] text-gray-500">
                  Thermal Mass Flywheel: <strong>Adobe & Rammed Earth</strong>
                </p>
              </div>

              {/* Windows & Doors */}
              <div className="flex items-end justify-between px-2">
                <div className="w-12 h-14 bg-soft-blue border-2 border-forest rounded-sm flex flex-col items-center justify-center text-[9px] font-bold text-forest shadow-inner">
                  <span>Double</span>
                  <span>Glass</span>
                </div>
                
                <div className="w-14 h-20 bg-[#D7CCC8] border-2 border-forest rounded-t-sm flex items-center justify-center text-[10px] font-bold text-forest">
                  Door
                </div>

                <div className="w-12 h-14 bg-soft-blue border-2 border-forest rounded-sm flex flex-col items-center justify-center text-[9px] font-bold text-forest shadow-inner">
                  <span>Double</span>
                  <span>Glass</span>
                </div>
              </div>

              {/* Heat Loss Vectors Leaving Roof & Walls */}
              <div className="absolute -bottom-3 -right-16 sm:-right-24 flex items-center space-x-1 text-[#2563EB] bg-white/95 px-2.5 py-1 rounded-full border border-soft-blue text-xs font-bold shadow-xs">
                <Snowflake className="w-4 h-4 text-[#2563EB]" />
                <span>Heat Leaving (Night Loss)</span>
              </div>
            </div>

            {/* Ground line */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-[#D2B48C] border-t-4 border-[#8B5A2B] flex items-center justify-center text-xs font-bold text-[#5C3A16]">
              Ground Plane (Earth Contact Coupling)
            </div>

          </div>

          {/* Workflow Banner: CLIMATE -> SHELTER DESIGN -> THERMAL SIMULATION -> BETTER DESIGN */}
          <div className="mt-8 pt-6 border-t border-[#E5E3D8]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3D8] flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-soft-blue text-[#1E3A8A] flex items-center justify-center font-bold text-sm mb-2">
                  1
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest">Climate</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Ladakh, Desert, Dras, Plains</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3D8] flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-mint text-forest flex items-center justify-center font-bold text-sm mb-2">
                  2
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest">Shelter Design</span>
                <p className="text-[11px] text-gray-500 mt-0.5">Size, orientation, earth materials</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3D8] flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-solar text-forest flex items-center justify-center font-bold text-sm mb-2">
                  3
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest">Thermal Simulation</span>
                <p className="text-[11px] text-gray-500 mt-0.5">24h transient physics solver</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest text-white flex flex-col items-center shadow-md">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-solar flex items-center justify-center font-bold text-sm mb-2">
                  4
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-solar">Better Design</span>
                <p className="text-[11px] text-white/80 mt-0.5">Calculated energy improvements</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Core Principles for Architects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-earth">Architect-Friendly Engineering</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-forest mt-1">
            Built for Architects, Grounded in Physics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-[#E2DFD2] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-forest mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest mb-2">Local Earth Materials</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Prioritizes Adobe mud, Rammed Earth, Poplar twig decks, and strawboard insulation. Evaluates thermal mass flywheels that store daytime warmth for cold nights.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E2DFD2] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-soft-blue flex items-center justify-center text-[#1E3A8A] mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest mb-2">Diurnal Transient Analysis</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Clear 24-hour indoor vs outdoor temperature curves highlighting critical 2 AM minimums, sunset heat retention, and dominant heat-loss pathways.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E2DFD2] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-solar/40 flex items-center justify-center text-forest mb-4">
              <CheckCircle2 className="w-6 h-6 text-forest" />
            </div>
            <h3 className="text-lg font-bold text-forest mb-2">Calculated Recommendations</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              No guesswork or arbitrary scores. Real transient thermal deltas (e.g. +6.4°C higher 2 AM temperature) explain exactly why a recommended modification works.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-r from-forest to-teal-dark rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-bold font-sans">
            Ready to design your climate-responsive shelter?
          </h3>
          <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Take 60 seconds to configure dimensions and materials, and simulate thermal comfort.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-solar hover:bg-[#FFE875] text-forest font-extrabold text-sm shadow-lg transition-all active:scale-95 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Designing Now</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
