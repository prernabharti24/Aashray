import React from 'react';
import { useShelter } from './context/ShelterContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { DesignPage } from './components/design/DesignPage';
import { SimulationPage } from './components/simulation/SimulationPage';
import { ResultsPage } from './components/results/ResultsPage';
import { AboutPage } from './components/about/AboutPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { ComparisonModal } from './components/comparison/ComparisonModal';
import { ReportModal } from './components/report/ReportModal';

export const AppContent: React.FC = () => {
  const { activePage } = useShelter();

  return (
    <div className="min-h-screen flex flex-col bg-cream text-[#1A2E2B] selection:bg-mint selection:text-forest">
      <Navbar />

      <main className="flex-1">
        {activePage === 'home' && <HomePage />}
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'design' && <DesignPage />}
        {activePage === 'simulation' && <SimulationPage />}
        {activePage === 'results' && <ResultsPage />}
        {activePage === 'about' && <AboutPage />}
      </main>

      <Footer />

      {/* Global Modals & Wizards */}
      <OnboardingWizard />
      <ComparisonModal />
      <ReportModal />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
