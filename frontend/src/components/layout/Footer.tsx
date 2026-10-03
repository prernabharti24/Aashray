import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E2DFD2] bg-[#F3F2EA] text-[#4A5568] py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center text-white font-bold font-mono">
              आ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-forest text-base font-sans">AASHRAY</span>
                <span className="text-xs text-earth font-medium">• Mitti Se Mausam Tak</span>
              </div>
              <p className="text-xs text-gray-500">
                Design a shelter for its climate.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-white px-3.5 py-1.5 rounded-full border border-[#DCDAD0] shadow-2xs text-[#4A5568]">
            <Shield className="w-3.5 h-3.5 text-forest" />
            <span className="font-semibold text-forest">SIH26051:</span>
            <span>Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance (DRDO)</span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-earth" />
              <span>Physics Engine: Reduced-Order Transient Model</span>
            </div>
          </div>

        </div>
        
        <div className="mt-6 pt-4 border-t border-[#E8E6DB] text-center text-[11px] text-gray-400">
          Built for Architects & Shelter Designers • Simulation results depend on input climate data, material properties, and boundary-condition assumptions.
        </div>
      </div>
    </footer>
  );
};
