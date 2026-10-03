import React from 'react';
import { Shield, BookOpen, Cpu } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Brand Hero */}
      <div className="border-b border-[#E2DFD2] pb-8 text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-mint text-forest border border-[#C8E6C9] text-xs font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-forest" />
          <span>SIH26051 • DRDO Problem Statement</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-forest font-sans">
          AASHRAY
        </h1>
        
        <p className="text-2xl font-serif text-earth italic">
          “Mitti Se Mausam Tak”
        </p>

        <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Design a shelter for its climate. Create your shelter, simulate its thermal performance, and understand how it responds to extreme heat and cold.
        </p>
      </div>

      {/* Brand Meaning & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-7 rounded-3xl border border-[#E2DFD2] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-mint flex items-center justify-center text-forest font-bold">
            आ
          </div>
          <h2 className="text-xl font-bold text-forest font-sans">The Philosophy of AASHRAY</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>AASHRAY</strong> signifies shelter and safety. In extreme climatic zones like the sub-zero high-altitude cold deserts of Ladakh or the scorching Thar desert of Jaisalmer, shelter is the frontline of human survival.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>“Mitti Se Mausam Tak”</strong> embodies connecting indigenous local earth materials (Adobe, Rammed Earth, Poplar thatch) with microclimatic physics to construct resilient, passive, zero-carbon shelters.
          </p>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-[#E2DFD2] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-soft-blue flex items-center justify-center text-[#1E3A8A] font-bold">
            DRDO
          </div>
          <h2 className="text-xl font-bold text-forest font-sans">SIH26051 Problem Context</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Title:</strong> Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Objective:</strong> Provide an intuitive, physics-accurate digital platform for shelter designers to assess thermal comfort, diagnose heat-loss pathways, and optimize envelope specifications before physical construction.
          </p>
        </div>
      </div>

      {/* Methodology -> Advanced Engineering Model (Equations & Physics) */}
      <div className="bg-white rounded-3xl p-8 border border-[#E2DFD2] shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-[#F0EFE6] pb-4">
          <BookOpen className="w-6 h-6 text-earth" />
          <div>
            <h2 className="text-2xl font-bold text-forest font-sans">
              Methodology & Advanced Engineering Model
            </h2>
            <p className="text-xs text-gray-500">Transient Thermal Physics Formulations</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-700">
          <div>
            <h3 className="font-bold text-forest text-base mb-2">
              1. 3D Transient Heat Diffusion Equation
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              The fundamental governing partial differential equation for time-dependent thermal storage and conduction through shelter walls and roofs:
            </p>
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8] text-center font-mono font-bold text-forest text-base shadow-inner">
              ρ · Cp · (∂T / ∂t) = ∇ · (k ∇T) + Q
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
              <div>• <strong>ρ</strong>: Density (kg/m³)</div>
              <div>• <strong>Cp</strong>: Specific Heat (J/kg·K)</div>
              <div>• <strong>k</strong>: Conductivity (W/m·K)</div>
              <div>• <strong>Q</strong>: Volumetric Heat Influx (W/m³)</div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-forest text-base mb-2">
              2. Envelope Heat Flux & Transmittance
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              For multi-layered building envelopes with convection boundary conditions:
            </p>
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8] text-center font-mono font-bold text-forest text-base shadow-inner">
              Q_envelope = U · A · (T_sol-air - T_indoor)
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
              <div>• <strong>U</strong>: Thermal Transmittance (W/m²K)</div>
              <div>• <strong>A</strong>: Surface Area (m²)</div>
              <div>• <strong>T_sol-air</strong>: Sol-Air Temperature with Solar Load</div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-forest text-base mb-2">
              3. Dynamic Thermal Mass Capacitance & Phase Lag
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              High thermal mass materials such as 300mm Adobe Mud or Rammed Earth absorb daytime solar energy and release it inwards with an 8 to 12-hour phase delay, effectively heating the shelter during freezing nights.
            </p>
          </div>
        </div>
      </div>

      {/* ANSYS Engine Integration Architecture */}
      <div className="bg-white rounded-3xl p-8 border border-[#E2DFD2] shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-[#F0EFE6] pb-4">
          <Cpu className="w-6 h-6 text-forest" />
          <div>
            <h2 className="text-2xl font-bold text-forest font-sans">
              ANSYS Bridge & Simulation Engine Architecture
            </h2>
            <p className="text-xs text-gray-500">Modular Pluggable Solver Pipeline</p>
          </div>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="p-6 bg-[#FAF9F5] rounded-2xl border border-[#E5E3D8] text-center font-sans">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-bold text-forest">
            <div className="bg-white p-3 rounded-xl border border-[#D5D3C5] shadow-xs w-full">
              Frontend (React / TS)
            </div>
            <span>↓</span>
            <div className="bg-white p-3 rounded-xl border border-[#D5D3C5] shadow-xs w-full">
              FastAPI Backend
            </div>
            <span>↓</span>
            <div className="bg-white p-3 rounded-xl border border-[#D5D3C5] shadow-xs w-full">
              Simulation Manager
            </div>
            <span>↓</span>
            <div className="bg-mint p-3 rounded-xl border border-[#A5D6A7] shadow-xs w-full text-forest">
              Reduced-Order / ANSYS Engine
            </div>
            <span>↓</span>
            <div className="bg-white p-3 rounded-xl border border-[#D5D3C5] shadow-xs w-full">
              Result Processing & Dashboard
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>
            AASHRAY implements a modular <strong>BaseSimulationEngine</strong> interface. In the current release, transient calculations are powered by our <strong>Reduced-Order Simulation Engine</strong>, providing immediate physical feedback.
          </p>
          <p>
            An <strong>ANSYSSimulationEngine</strong> adapter is built-in to export APDL scripts and bridge with PyMAPDL / PyFluent when connected to an active ANSYS workstation cluster.
          </p>
        </div>
      </div>

    </div>
  );
};
