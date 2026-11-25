import React from 'react';
import { useShelter } from '../../context/ShelterContext';

export const Footer: React.FC = () => {
  const { activePage } = useShelter();

  // Sleek, minimal workspace status bar on Dashboard to eliminate clutter
  if (activePage === 'dashboard') {
    return (
      <footer className="border-t border-[#E8E6DB] bg-white/70 backdrop-blur-xs py-3.5 text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-forest">AASHRAY Workspace Engine Active</span>
            <span className="text-gray-300">•</span>
            <span>Local Earth Material Database Connected</span>
          </div>
          <div className="text-gray-400 text-[11px]">
            © 2026 AASHRAY • Climate-Responsive Shelter Architecture
          </div>
        </div>
      </footer>
    );
  }

  // Clean, professional footer for other pages
  return (
    <footer className="border-t border-[#E2DFD2] bg-[#F5F4EC] text-[#4A5568] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-white font-bold font-mono text-sm">
              आ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-forest text-sm font-sans">AASHRAY</span>
                <span className="text-xs text-earth font-medium">• Mitti Se Mausam Tak</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Physics-based climate-responsive shelter architecture platform.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Built for Architects & Engineers</span>
            <span className="text-gray-300">•</span>
            <span>24h Diurnal Heat Transfer Model</span>
          </div>

        </div>
        
        <div className="mt-5 pt-3 border-t border-[#E8E6DB] text-center text-[11px] text-gray-400">
          Simulation results depend on microclimate weather data, envelope thermophysical properties, and boundary-condition assumptions.
        </div>
      </div>
    </footer>
  );
};
