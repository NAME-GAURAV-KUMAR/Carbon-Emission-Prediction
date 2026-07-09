import { create } from 'zustand';

interface DashboardState {
  // Filters
  selectedState: string;
  selectedModel: string;
  yearStart: number;
  yearEnd: number;
  predictionHorizon: number;

  // UI
  darkMode: boolean;
  activeSection: 'dashboard' | 'model-details' | 'about';
  isLoading: boolean;

  // Actions
  setSelectedState: (state: string) => void;
  setSelectedModel: (model: string) => void;
  setYearRange: (start: number, end: number) => void;
  setPredictionHorizon: (year: number) => void;
  toggleDarkMode: () => void;
  setActiveSection: (section: 'dashboard' | 'model-details' | 'about') => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedState: 'United States',
  selectedModel: 'ARIMA',
  yearStart: 1990,
  yearEnd: 2021,
  predictionHorizon: 2030,

  darkMode: false,
  activeSection: 'dashboard',
  isLoading: false,

  setSelectedState: (state) => set({ selectedState: state }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setYearRange: (start, end) => set({ yearStart: start, yearEnd: end }),
  setPredictionHorizon: (year) => set({ predictionHorizon: year }),
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
      return { darkMode: next };
    }),
  setActiveSection: (section) => set({ activeSection: section }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
