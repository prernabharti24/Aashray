import React, { useState } from 'react';
import { useShelter } from '../../context/ShelterContext';
import houseCutawayImg from '../../assets/house-cutaway.png';
import {
  Sun,
  Moon,
  Wind,
  Flame,
  ShieldCheck,
  Leaf,
  Home,
  Grid,
  Layers,
  ArrowDown
} from 'lucide-react';

export const EnvelopeHeatExchange: React.FC = () => {
  const { setActivePage, setIsOnboardingOpen } = useShelter();
  const [mode, setMode] = useState<'day' | 'night'>('day');

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-[#E0DED3] shadow-xl relative overflow-hidden">
      
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-earth block">
          Architectural Microclimate Physics
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-forest mt-1 font-sans">
          How AASHRAY Simulates Envelope Heat Exchange
        </h3>
      </div>

      {/* Main Simulation Stage & Conditions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left / Center: Interactive Architectural 3D Cutaway Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-[#DCDAD0] overflow-hidden relative shadow-sm">
          
          {/* Day / Night Toggle Pill */}
          <div className="absolute top-3.5 right-3.5 z-30 flex items-center bg-white/95 backdrop-blur-sm border border-[#D5D3C5] rounded-full p-1 shadow-sm">
            <button
              onClick={() => setMode('day')}
              className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'day'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-gray-600 hover:text-forest'
              }`}
            >
              <Sun className={`w-3.5 h-3.5 ${mode === 'day' ? 'text-solar' : 'text-amber-500'}`} />
              <span>Day</span>
            </button>
            <button
              onClick={() => setMode('night')}
              className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'night'
                  ? 'bg-[#16243A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-forest'
              }`}
            >
              <Moon className={`w-3.5 h-3.5 ${mode === 'night' ? 'text-soft-blue' : 'text-indigo-400'}`} />
              <span>Night</span>
            </button>
          </div>

          {/* Interactive Visual Canvas */}
          <div className={`relative w-full min-h-[420px] sm:min-h-[480px] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-500 overflow-hidden ${
            mode === 'day'
              ? 'bg-gradient-to-b from-[#EAF3FF] via-[#F6F9FF] to-[#FAF8F2]'
              : 'bg-gradient-to-b from-[#0E1726] via-[#1A2637] to-[#141F30]'
          }`}>
            
            {/* Top Vectors Row: Sun / Wind */}
            <div className="relative z-20 flex items-start justify-between w-full max-w-lg mx-auto pt-1">
              
              {/* Cold Mountain Wind (Left) */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border shadow-xs transition-colors backdrop-blur-xs ${
                mode === 'day'
                  ? 'bg-white/95 border-soft-blue text-blue-900'
                  : 'bg-[#182B3E]/95 border-soft-blue/30 text-blue-200'
              }`}>
                <Wind className="w-4 h-4 text-blue-500 animate-pulse" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold block">Cold Mountain Wind</span>
                  <span className="text-[9px] opacity-75">Convective envelope cooling</span>
                </div>
              </div>

              {/* Sun / Moon Celestial Vector (Center-Right) */}
              {mode === 'day' ? (
                <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-solar shadow-xs">
                  <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-[#A3521E] block">Solar Radiation</span>
                    <span className="text-[9px] text-gray-500">Heat gain through roof & windows</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-[#1A2E44]/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-soft-blue/40 shadow-xs">
                  <Moon className="w-4 h-4 text-soft-blue" />
                  <div className="text-[11px] leading-tight text-white">
                    <span className="font-bold text-soft-blue block">Radiative Night Loss</span>
                    <span className="text-[9px] text-gray-300">Thermal emission to clear sky</span>
                  </div>
                </div>
              )}

            </div>

            {/* Central Stage: Pure Transparent 3D House Cutaway with Precision Floating Callouts */}
            <div className="relative w-full flex-1 flex items-center justify-center my-2">
              
              {/* House Cutaway Image from public folder */}
              <div className="relative w-full max-w-[540px] flex items-center justify-center">
                <img
                  src={houseCutawayImg}
                  alt="Traditional Sustainable Earth Shelter 3D Cutaway"
                  className={`w-full max-h-[300px] sm:max-h-[340px] object-contain drop-shadow-md transition-all duration-500 ${
                    mode === 'night'
                      ? 'brightness-75 contrast-110 hue-rotate-190'
                      : 'brightness-100'
                  }`}
                />

                {/* Night Cozy Interior Comfort Glow */}
                {mode === 'night' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-40 h-28 rounded-full bg-amber-400/25 blur-xl animate-pulse" />
                  </div>
                )}

                {/* CALLOUT 1: Timber Roof (Top-Left of House) */}
                <div className="absolute -top-3 left-4 sm:left-12 z-20 hidden sm:flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D5D3C5] shadow-md hover:scale-105 transition-transform">
                  <div className="w-6 h-6 rounded-lg bg-mint text-forest flex items-center justify-center shrink-0">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[10px] leading-tight text-left">
                    <span className="font-bold text-forest block">Timber Roof</span>
                    <span className="text-gray-500 block">U-value: 1.6 W/m²K</span>
                    <span className="text-[9px] text-emerald-700">Good insulation & solar protection</span>
                  </div>
                </div>

                {/* CALLOUT 2: Double Glass Window (Left of House) */}
                <div className="absolute top-28 -left-2 sm:-left-6 z-20 hidden sm:flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D5D3C5] shadow-md hover:scale-105 transition-transform">
                  <div className="w-6 h-6 rounded-lg bg-soft-blue text-[#1E3A8A] flex items-center justify-center shrink-0">
                    <Grid className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[10px] leading-tight text-left">
                    <span className="font-bold text-forest block">Double Glass Window</span>
                    <span className="text-gray-500 block">U-value: 1.8 W/m²K</span>
                    <span className="text-[9px] text-blue-700">Reduces heat gain / loss</span>
                  </div>
                </div>

                {/* CALLOUT 3: Earth / Adobe Wall (Right of House) */}
                <div className="absolute top-12 -right-2 sm:-right-6 z-20 hidden sm:flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D5D3C5] shadow-md hover:scale-105 transition-transform">
                  <div className="w-6 h-6 rounded-lg bg-solar/40 text-earth flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[10px] leading-tight text-left">
                    <span className="font-bold text-forest block">Earth / Adobe Wall</span>
                    <span className="text-gray-500 block">U-value: 1.4 W/m²K</span>
                    <span className="text-[9px] text-earth">High thermal mass, regulates temp</span>
                  </div>
                </div>

                {/* CALLOUT 4: Earth Contact Floor (Bottom-Center of House) */}
                <div className="absolute -bottom-2 right-12 sm:right-24 z-20 hidden sm:flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D5D3C5] shadow-md hover:scale-105 transition-transform">
                  <div className="w-6 h-6 rounded-lg bg-[#EADCC8] text-[#5C3A16] flex items-center justify-center shrink-0">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[10px] leading-tight text-left">
                    <span className="font-bold text-forest block">Earth Contact Floor</span>
                    <span className="text-gray-500 block">U-value: 0.8 W/m²K</span>
                    <span className="text-[9px] text-[#7A4B1A]">Stores coolness, releases heat slowly</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Convection Cooling Vector (Bottom-Right) */}
            <div className="relative z-20 flex justify-end w-full">
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border shadow-2xs backdrop-blur-xs ${
                mode === 'day'
                  ? 'bg-white/95 border-soft-blue text-blue-900'
                  : 'bg-[#182B3E]/95 border-soft-blue/30 text-blue-200'
              }`}>
                <Wind className="w-3.5 h-3.5 text-blue-500" />
                <div className="text-[10px] leading-tight">
                  <span className="font-bold block">Convection Cooling</span>
                  <span className="text-[8px] opacity-75">Wind flow around structure</span>
                </div>
              </div>
            </div>

            {/* Mobile Callout Summary Row (visible on small mobile where overlay callouts hide) */}
            <div className="sm:hidden grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-black/10 relative z-20 text-[10px]">
              <div className="bg-white/90 p-1.5 rounded-lg border border-[#E0DED3]">
                <span className="font-bold text-forest block">Timber Roof</span>
                <span className="text-gray-500 text-[9px]">U: 1.6 W/m²K</span>
              </div>
              <div className="bg-white/90 p-1.5 rounded-lg border border-[#E0DED3]">
                <span className="font-bold text-forest block">Adobe Wall</span>
                <span className="text-gray-500 text-[9px]">U: 1.4 W/m²K</span>
              </div>
              <div className="bg-white/90 p-1.5 rounded-lg border border-[#E0DED3]">
                <span className="font-bold text-forest block">Double Glass</span>
                <span className="text-gray-500 text-[9px]">U: 1.8 W/m²K</span>
              </div>
              <div className="bg-white/90 p-1.5 rounded-lg border border-[#E0DED3]">
                <span className="font-bold text-forest block">Earth Floor</span>
                <span className="text-gray-500 text-[9px]">U: 0.8 W/m²K</span>
              </div>
            </div>

          </div>

          {/* Ground Plane Bar spanning the bottom of the canvas */}
          <div className="w-full bg-[#D4B996] border-t-2 border-[#A88053] py-2 px-4 text-center">
            <span className="text-xs sm:text-sm font-bold text-[#4E3114] tracking-wide">
              Ground Plane (Earth Contact Coupling)
            </span>
          </div>

        </div>

        {/* Right: Current Conditions Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-white rounded-2xl border border-[#E0DED3] p-5 shadow-xs">
          
          <div>
            <div className="flex items-center justify-between border-b border-[#F0EFE6] pb-3 mb-4">
              <span className="text-sm font-bold text-forest">
                Current Conditions ({mode === 'day' ? 'Day' : 'Night'})
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                mode === 'day' ? 'bg-solar/60 text-[#8C430E]' : 'bg-[#1E293B] text-soft-blue'
              }`}>
                {mode === 'day' ? '☀️ 12:00 PM Peak' : '🌙 02:00 AM Low'}
              </span>
            </div>

            {/* Conditions Meters */}
            <div className="space-y-4 text-xs">
              
              {/* Solar Gain Meter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 text-gray-700">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold">Solar Gain</span>
                  </div>
                  <span className={`font-bold ${mode === 'day' ? 'text-amber-600' : 'text-gray-400'}`}>
                    {mode === 'day' ? 'High' : 'None (0 W/m²)'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 rounded-full"
                    style={{ width: mode === 'day' ? '85%' : '0%' }}
                  />
                </div>
              </div>

              {/* Wind Cooling Meter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 text-gray-700">
                    <Wind className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold">Wind Cooling</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {mode === 'day' ? 'Moderate' : 'Active (4.2 m/s)'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: mode === 'day' ? '45%' : '78%' }}
                  />
                </div>
              </div>

              {/* Indoor Temperature Estimate */}
              <div className="flex items-center justify-between py-1.5 border-t border-b border-[#F5F4EE]">
                <div className="flex items-center space-x-1.5 text-gray-700">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-semibold">Indoor Temp (est.)</span>
                </div>
                <span className="font-bold text-forest font-mono text-sm">
                  {mode === 'day' ? '24–28°C' : '19–22°C'}
                </span>
              </div>

              {/* Thermal Comfort Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-gray-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">Thermal Comfort</span>
                </div>
                <span className="bg-mint text-forest font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-[#C8E6C9]">
                  {mode === 'day' ? 'Good' : 'Protected'}
                </span>
              </div>

            </div>
          </div>

          {/* Eco / Physics Callout Note */}
          <div className="mt-5 p-3.5 rounded-xl bg-mint/50 border border-[#D0E8D4] text-[11px] text-forest/90 flex items-start space-x-2">
            <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              {mode === 'day'
                ? 'This design uses local materials and natural processes to maintain thermal comfort with minimal energy use.'
                : 'Thermal mass flywheel: 300mm Adobe and Rammed Earth slowly releases stored daytime heat inwards through cold nights.'}
            </p>
          </div>

        </div>

      </div>

      {/* Workflow Banner: 1 CLIMATE -> 2 SHELTER DESIGN -> 3 THERMAL SIMULATION -> 4 BETTER DESIGN */}
      <div className="mt-8 pt-6 border-t border-[#E5E3D8]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-center">
          
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="p-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-white border border-[#E5E3D8] hover:border-forest/30 transition-all flex flex-col items-center group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-soft-blue text-[#1E3A8A] flex items-center justify-center font-bold text-xs mb-1.5 group-hover:scale-105 transition-transform">
              1
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Climate</span>
            <p className="text-[11px] text-gray-500 mt-0.5">Location, Temperature, Wind, etc.</p>
          </button>

          <button
            onClick={() => setActivePage('design')}
            className="p-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-white border border-[#E5E3D8] hover:border-forest/30 transition-all flex flex-col items-center group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-mint text-forest flex items-center justify-center font-bold text-xs mb-1.5 group-hover:scale-105 transition-transform">
              2
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Shelter Design</span>
            <p className="text-[11px] text-gray-500 mt-0.5">Size, orientation, materials</p>
          </button>

          <button
            onClick={() => setActivePage('simulation')}
            className="p-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-white border border-[#E5E3D8] hover:border-forest/30 transition-all flex flex-col items-center group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-solar text-forest flex items-center justify-center font-bold text-xs mb-1.5 group-hover:scale-105 transition-transform">
              3
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Thermal Simulation</span>
            <p className="text-[11px] text-gray-500 mt-0.5">24h transient physics solver</p>
          </button>

          <button
            onClick={() => setActivePage('results')}
            className="p-3.5 rounded-2xl bg-forest hover:bg-teal-dark text-white shadow-md hover:shadow-lg transition-all flex flex-col items-center group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 text-solar flex items-center justify-center font-bold text-xs mb-1.5 group-hover:scale-105 transition-transform">
              4
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-solar">Better Design</span>
            <p className="text-[11px] text-white/80 mt-0.5">Calculated energy improvements</p>
          </button>

        </div>
      </div>

    </div>
  );
};
