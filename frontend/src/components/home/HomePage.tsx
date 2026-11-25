import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import heroBg from '../../assets/hero-bg.png';
import { EnvelopeHeatExchange } from './EnvelopeHeatExchange';
import {
  Sparkles,
  ArrowRight,
  Layers,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setIsOnboardingOpen } = useShelter();

  return (
    <div className="pb-20">
      
      {/* Hero Section with Illustrated Architectural Landscape Background */}
      <section className="relative pt-12 pb-24 md:pt-16 md:pb-36 overflow-hidden">
        {/* Transparent Architectural Landscape Layer seamlessly integrated with page */}
        <div 
          className="absolute inset-0 bg-cover bg-[position:center_top] bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: `url(${heroBg})`,
            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Subtle top badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#E2ECE4]/90 border border-[#BEDEC6] shadow-2xs mb-5 animate-fade-in backdrop-blur-[2px]">
            <span className="text-[11px] sm:text-xs font-bold text-forest uppercase tracking-widest">
              Shelter Architecture
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-forest tracking-tight max-w-4xl mx-auto font-sans leading-[1.15]">
            Design a shelter for its climate.
          </h1>

          <p className="mt-3 text-xl sm:text-2xl font-serif text-earth italic max-w-2xl mx-auto">
            “Mitti Se Mausam Tak”
          </p>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2D3E39] max-w-2xl mx-auto font-normal leading-relaxed">
            A physics-based platform for designing area-specific shelters and understanding their thermal performance. 
            Connect local earth materials with extreme high-altitude and desert microclimates.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center space-x-3 active:scale-95 group cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-solar group-hover:rotate-12 transition-transform" />
              <span>Start Your First Design</span>
              <ArrowRight className="w-5 h-5 text-solar/80 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* Architectural Illustration Section: Envelope Heat Exchange */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-14 sm:-mt-20 md:-mt-24 relative z-20">
        <EnvelopeHeatExchange />
      </section>

      {/* Core Principles for Architects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
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
      {/* <section className="max-w-5xl mx-auto px-4 sm:px-6">
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
      </section> */}

    </div>
  );
};
