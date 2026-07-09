import { motion } from 'framer-motion';
import { useDashboardStore } from '../store';
import type { ModelSummary, TopState } from '../api';

const STATES = [
  'United States', 'Texas', 'California', 'Pennsylvania', 'Illinois',
  'Ohio', 'Indiana', 'Louisiana', 'Florida', 'New York',
];

const MODELS = [
  { key: 'ARIMA', label: 'ARIMA', color: '#3b82f6' },
  { key: 'Prophet', label: 'Prophet', color: '#8b5cf6' },
  { key: 'LSTM', label: 'LSTM', color: '#f59e0b' },
];

interface SidebarProps {
  modelSummary: ModelSummary | null;
  topStates: TopState[];
  onApply: () => void;
}

export default function Sidebar({ modelSummary, onApply }: SidebarProps) {
  const {
    selectedState, setSelectedState,
    selectedModel, setSelectedModel,
    yearStart, yearEnd, setYearRange,
    predictionHorizon, setPredictionHorizon,
  } = useDashboardStore();

  const models = modelSummary?.model_comparison;
  const bestModel = modelSummary?.best_model || 'ARIMA';

  const getModelMAPE = (m: string) => {
    if (!models?.[m]) return '—';
    return `${models[m].avg_mape.toFixed(2)}%`;
  };

  return (
    <aside className="sidebar">
      {/* State Filter */}
      <div className="sidebar-section">
        <div className="sidebar-label">📍 Location</div>
        <select
          className="filter-select"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-divider" />

      {/* Year Range */}
      <div className="sidebar-section">
        <div className="sidebar-label">📅 Historical Range</div>
        <div className="range-container">
          <div className="range-values">
            <span>{yearStart}</span>
            <span>{yearEnd}</span>
          </div>
          <div className="range-track">
            <input
              type="range"
              className="range-input"
              min={1970}
              max={2021}
              value={yearStart}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v < yearEnd - 5) setYearRange(v, yearEnd);
              }}
            />
          </div>
          <div className="range-track">
            <input
              type="range"
              className="range-input"
              min={1970}
              max={2021}
              value={yearEnd}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v > yearStart + 5) setYearRange(yearStart, v);
              }}
            />
          </div>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Prediction Horizon */}
      <div className="sidebar-section">
        <div className="sidebar-label">🔮 Forecast Horizon</div>
        <div className="range-container">
          <div className="range-values">
            <span>2022</span>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{predictionHorizon}</span>
          </div>
          <div className="range-track">
            <input
              type="range"
              className="range-input"
              min={2023}
              max={2030}
              value={predictionHorizon}
              onChange={(e) => setPredictionHorizon(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Model Selection */}
      <div className="sidebar-section">
        <div className="sidebar-label">🤖 Forecast Model</div>
        <div className="model-pills">
          {MODELS.map((m) => (
            <motion.button
              key={m.key}
              className={`model-pill ${selectedModel === m.key ? 'active' : ''}`}
              onClick={() => setSelectedModel(m.key)}
              whileTap={{ scale: 0.95 }}
              style={{
                '--pill-color': m.color,
              } as React.CSSProperties}
            >
              {m.key === bestModel && <span className="best-badge">★</span>}
              {m.label}
              {m.key === 'LSTM' && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#f59e0b', display: 'inline-block', marginLeft: 4,
                  flexShrink: 0,
                }} title="Limited forecast coverage" />
              )}
              <span className="model-mape">MAPE: {getModelMAPE(m.key)}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Apply Button */}
      <motion.button
        className="btn btn-primary"
        onClick={onApply}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        ⚡ Apply Filters
      </motion.button>

      {/* Quick Stats */}
      {models && (
        <div className="quick-stats">
          <div className="sidebar-label" style={{ marginBottom: 4 }}>📊 Best Model Stats</div>
          <div className="quick-stat-row">
            <span className="quick-stat-label">Best</span>
            <span className="quick-stat-value" style={{ color: 'var(--primary)' }}>{bestModel}</span>
          </div>
          <div className="quick-stat-row">
            <span className="quick-stat-label">Avg. MAPE</span>
            <span className="quick-stat-value">{models[bestModel]?.avg_mape.toFixed(2)}%</span>
          </div>
          <div className="quick-stat-row">
            <span className="quick-stat-label">Avg. MAE</span>
            <span className="quick-stat-value">{models[bestModel]?.avg_mae.toFixed(2)}</span>
          </div>
          <div className="quick-stat-row">
            <span className="quick-stat-label">Avg. RMSE</span>
            <span className="quick-stat-value">{models[bestModel]?.avg_rmse.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Data source note */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        📦 EIA US State CO₂ Emissions<br />
        Data: 1970–2021 · Forecast: 2022–2030
      </div>
    </aside>
  );
}
