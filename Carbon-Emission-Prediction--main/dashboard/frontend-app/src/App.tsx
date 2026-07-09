import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDashboardStore } from './store';
import { api, type KPIData, type EmissionRow, type ModelSummary, type TopState } from './api';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import TimeSeriesChart from './components/TimeSeriesChart';
import TopStatesChart from './components/TopStatesChart';
import SectorPieChart from './components/SectorChart';
import ModelDetails from './components/ModelDetails';
import AboutSection from './components/AboutSection';
import EmissionsMap from './components/EmissionsMap';

import { useEffect } from 'react';

function useApiData() {
  const { selectedState, selectedModel, yearStart, yearEnd, predictionHorizon } = useDashboardStore();

  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [historical, setHistorical] = useState<EmissionRow[]>([]);
  const [predictions, setPredictions] = useState<{ year: number; predicted_value: number }[]>([]);
  const [modelSummary, setModelSummary] = useState<ModelSummary | null>(null);
  const [topStates, setTopStates] = useState<TopState[]>([]);
  const [sectorData, setSectorData] = useState<{ sector: string; value: number }[]>([]);

  const [loading, setLoading] = useState({
    kpi: true,
    chart: true,
    modelSummary: true,
    topStates: true,
    sector: true,
  });

  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading({ kpi: true, chart: true, modelSummary: true, topStates: true, sector: true });
    setError(null);

    try {
      // Fetch predictions separately to allow LSTM lowercase fallback
      let predData = await api.getPredictionsTimeseries(
        selectedState,
        'Total carbon dioxide emissions from all sectors',
        selectedModel,
        predictionHorizon
      );
      // FIX A: If LSTM returns empty, retry with lowercase key
      if (predData.length === 0 && selectedModel === 'LSTM') {
        predData = await api.getPredictionsTimeseries(
          selectedState,
          'Total carbon dioxide emissions from all sectors',
          'lstm',
          predictionHorizon
        );
      }

      const [kpiData, histData, summaryData, topData, sectorD] = await Promise.all([
        api.getKPI(selectedState),
        api.getTimeseries(selectedState, yearStart, yearEnd),
        api.getModelSummary(),
        api.getTopStates(10),
        api.getSectorBreakdown(selectedState, selectedModel),
      ]);

      setKpi(kpiData);
      setHistorical(histData);
      setPredictions(predData);
      setModelSummary(summaryData);
      setTopStates(topData);
      setSectorData(sectorD);

      setLoading({ kpi: false, chart: false, modelSummary: false, topStates: false, sector: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect to backend API. Please start the FastAPI server.\n${msg}`);
      setLoading({ kpi: false, chart: false, modelSummary: false, topStates: false, sector: false });
    }
  }, [selectedState, selectedModel, yearStart, yearEnd, predictionHorizon]);

  useEffect(() => {
    fetchAll();
  }, []); // initial load

  return {
    kpi, historical, predictions, modelSummary, topStates, sectorData,
    loading, error, refetch: fetchAll,
  };
}



export default function App() {
  const { activeSection, selectedState, selectedModel } = useDashboardStore();

  const {
    kpi, historical, predictions, modelSummary, topStates, sectorData,
    loading, error, refetch,
  } = useApiData();

  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = useCallback(() => {
    if (!historical.length) return;
    const rows = [
      ['Year', 'State', 'Emissions (MMT CO₂)'],
      ...historical.map((r) => [r.year, r.state, r.emissions.toFixed(3)]),
      [],
      ['Year', 'State', 'Predicted (MMT CO₂)', 'Model'],
      ...predictions.map((r) => [r.year, selectedState, r.predicted_value.toFixed(3), selectedModel]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon_emissions_${selectedState.replace(/\s+/g, '_')}_${selectedModel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [historical, predictions, selectedState, selectedModel]);

  const handleExportPNG = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = dashboardRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `carbon_dashboard_${selectedState.replace(/\s+/g, '_')}.png`;
      a.click();
    } catch (e) {
      console.error('Export PNG failed:', e);
    }
  }, [selectedState]);

  return (
    <div className="app-container">
      <Header onExportCSV={handleExportCSV} onExportPNG={handleExportPNG} />

      <div className="main-layout">
        <Sidebar
          modelSummary={modelSummary}
          topStates={topStates}
          onApply={refetch}
        />

        <main className="content">
          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius)',
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: 'var(--accent)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>⚠️</span>
              <div>
                <strong>Backend Connection Error</strong>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                  Start the FastAPI server: <code style={{ fontFamily: 'JetBrains Mono', background: 'rgba(0,0,0,0.1)', padding: '1px 6px', borderRadius: 4 }}>uvicorn backend.main:app --reload</code>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeSection === 'dashboard' && (
              <motion.div
                key="dashboard"
                ref={dashboardRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                {/* KPI Row */}
                <KPICards
                  kpi={kpi}
                  loading={loading.kpi}
                  state={selectedState}
                />

                {/* Main Time Series */}
                <TimeSeriesChart
                  historical={historical}
                  predictions={predictions}
                  state={selectedState}
                  model={selectedModel}
                  loading={loading.chart}
                />

                {/* Emissions Map */}
                <EmissionsMap data={topStates} />

                {/* Bottom Row: Top States + Sector Pie */}
                <div className="grid-2">
                  <TopStatesChart data={topStates} loading={loading.topStates} />
                  <SectorPieChart
                    data={sectorData}
                    loading={loading.sector}
                    state={selectedState}
                  />
                </div>

                {/* Model Performance Summary */}
                {modelSummary && (
                  <motion.div
                    className="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="section-header">
                      <div>
                        <div className="section-title"><span className="card-title-icon">🤖</span>Model Performance Overview</div>
                        <div className="section-subtitle">MAPE comparison · Lower is better</div>
                      </div>
                      <button
                        className="btn btn-ghost"
                        style={{ width: 'auto', padding: '8px 16px', fontSize: 12 }}
                        onClick={() => useDashboardStore.getState().setActiveSection('model-details')}
                      >
                        View Full Details →
                      </button>
                    </div>
                    <div className="card-content">
                      {Object.entries(modelSummary.model_comparison).map(([name, stats]) => {
                        const isBest = name === modelSummary.best_model;
                        const colors: Record<string, string> = {
                          ARIMA: '#3b82f6', Prophet: '#8b5cf6', LSTM: '#f59e0b',
                        };
                        const barWidth = Math.max(0, 100 - stats.avg_mape);
                        return (
                          <div key={name} className="model-row">
                            <div className="model-row-header">
                              <div className="model-name">
                                <span style={{ color: colors[name] || 'var(--primary)' }}>{name}</span>
                                {isBest && <span className="kpi-badge badge-success">★ Best</span>}
                              </div>
                              <div className="model-metrics">
                                <div className="model-metric">
                                  <div className="model-metric-label">MAPE</div>
                                  <div className="model-metric-value">{stats.avg_mape.toFixed(2)}%</div>
                                </div>
                                <div className="model-metric">
                                  <div className="model-metric-label">MAE</div>
                                  <div className="model-metric-value">{stats.avg_mae.toFixed(1)}</div>
                                </div>
                                <div className="model-metric">
                                  <div className="model-metric-label">RMSE</div>
                                  <div className="model-metric-value">{stats.avg_rmse.toFixed(1)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="progress-bar-wrap">
                              <div
                                className="progress-bar-fill"
                                style={{ background: colors[name] || 'var(--primary)', width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeSection === 'model-details' && (
              <motion.div
                key="model-details"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <ModelDetails summary={modelSummary} />
              </motion.div>
            )}

            {activeSection === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <AboutSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div>
          CarbonIntel Platform · Data: EIA US State CO₂ Emissions (1970–2021) · Forecast: 2022–2030
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {modelSummary && (
            <span>Best Model: <strong style={{ color: 'var(--primary)' }}>{modelSummary.best_model}</strong></span>
          )}
          <span>Built with React + FastAPI</span>
        </div>
      </footer>
    </div>
  );
}
