import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ShelterDesign,
  SimulationResult,
  ComparisonResponse,
  Climate,
  MaterialsDB
} from '../types';
import {
  DEFAULT_SHELTER,
  DEFAULT_CLIMATES,
  DEFAULT_MATERIALS,
  fetchClimates,
  fetchMaterials,
  runSimulationApi,
  fetchRecommendationApi
} from '../services/api';

interface ShelterContextType {
  currentDesign: ShelterDesign;
  setCurrentDesign: (design: ShelterDesign) => void;
  updateDesign: (patch: Partial<ShelterDesign>) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  simulationResult: SimulationResult | null;
  setSimulationResult: (res: SimulationResult | null) => void;
  comparisonResult: ComparisonResponse | null;
  setComparisonResult: (res: ComparisonResponse | null) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isComparisonOpen: boolean;
  setIsComparisonOpen: (open: boolean) => void;
  isReportOpen: boolean;
  setIsReportOpen: (open: boolean) => void;
  climates: Climate[];
  materials: MaterialsDB;
  isLoading: boolean;
  hasSimulated: boolean;
  runSimulation: (initialTemp?: number) => Promise<SimulationResult>;
  runComparison: () => Promise<ComparisonResponse>;
  applyRecommendedDesign: (recDesign: ShelterDesign) => void;
}

const ShelterContext = createContext<ShelterContextType | undefined>(undefined);

export const ShelterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDesign, setCurrentDesign] = useState<ShelterDesign>(DEFAULT_SHELTER);
  const [activePage, setActivePage] = useState<string>('home');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [climates, setClimates] = useState<Climate[]>(DEFAULT_CLIMATES);
  const [materials, setMaterials] = useState<MaterialsDB>(DEFAULT_MATERIALS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSimulated, setHasSimulated] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, m] = await Promise.all([fetchClimates(), fetchMaterials()]);
        setClimates(c);
        setMaterials(m);
      } catch (err) {
        console.warn("Could not load backend datasets, using defaults", err);
      }
    }
    loadData();
  }, []);

  const updateDesign = (patch: Partial<ShelterDesign>) => {
    setCurrentDesign(prev => ({
      ...prev,
      ...patch,
      advanced_settings: {
        ...prev.advanced_settings,
        ...(patch.advanced_settings || {})
      }
    }));
  };

  const runSimulation = async (initialTemp?: number): Promise<SimulationResult> => {
    setIsLoading(true);
    try {
      const res = await runSimulationApi(currentDesign, initialTemp);
      setSimulationResult(res);
      setHasSimulated(true);
      setIsLoading(false);
      return res;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const runComparison = async (): Promise<ComparisonResponse> => {
    setIsLoading(true);
    try {
      const comp = await fetchRecommendationApi(currentDesign);
      setComparisonResult(comp);
      setIsLoading(false);
      return comp;
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const applyRecommendedDesign = (recDesign: ShelterDesign) => {
    setCurrentDesign({
      ...recDesign,
      id: `shelter_${Date.now()}`,
      name: `${currentDesign.name} (Optimized)`
    });
    setSimulationResult(comparisonResult?.recommended_result || null);
    setIsComparisonOpen(false);
    setActivePage('results');
  };

  return (
    <ShelterContext.Provider
      value={{
        currentDesign,
        setCurrentDesign,
        updateDesign,
        activePage,
        setActivePage,
        simulationResult,
        setSimulationResult,
        comparisonResult,
        setComparisonResult,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isComparisonOpen,
        setIsComparisonOpen,
        isReportOpen,
        setIsReportOpen,
        climates,
        materials,
        isLoading,
        hasSimulated,
        runSimulation,
        runComparison,
        applyRecommendedDesign
      }}
    >
      {children}
    </ShelterContext.Provider>
  );
};

export function useShelter() {
  const context = useContext(ShelterContext);
  if (!context) {
    throw new Error('useShelter must be used within a ShelterProvider');
  }
  return context;
}
