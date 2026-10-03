import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import { Home, Compass, Thermometer, BarChart2, Info, Sparkles, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activePage, setActivePage, setIsOnboardingOpen, hasSimulated } = useShelter();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'design', label: 'Design', icon: Compass },
    { id: 'simulation', label: 'Simulation', icon: Thermometer },
    { id: 'results', label: 'Results', icon: BarChart2, highlight: hasSimulated },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2DFD2] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Meaning */}
          <div 
            onClick={() => setActivePage('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center text-white shadow-md group-hover:bg-teal-dark transition-colors duration-200">
              <span className="text-2xl font-bold font-mono tracking-tighter">आ</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold tracking-tight text-forest group-hover:text-teal-dark font-sans transition-colors">
                  AASHRAY
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-mint text-forest border border-[#C8E6C9]">
                  SIH26051 • DRDO
                </span>
              </div>
              <p className="text-xs font-medium text-earth tracking-wide">
                Mitti Se Mausam Tak
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-forest text-white shadow-sm'
                      : 'text-[#3E504A] hover:bg-[#F0EFE6] hover:text-forest'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-solar' : 'text-[#718096]'}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-leaf animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-solar" />
              <span>Start Designing</span>
            </button>
          </div>

        </div>
      </div>
      
      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-[#E8E6DB] bg-[#FDFCFA] px-2 py-1 flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center py-1 px-2 text-xs font-medium rounded-md ${
                isActive ? 'text-forest font-bold' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-forest' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
