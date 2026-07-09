import { motion } from 'framer-motion';
import type { ModelSummary } from '../api';

interface ModelDetailsProps {
  summary: ModelSummary | null;
}

const MODEL_INFO = {
  ARIMA: {
    icon: '📊',
    fullName: 'AutoRegressive Integrated Moving Average',
    description:
      'A classical time-series model that captures linear dependencies in emissions data through autoregression, differencing for stationarity, and moving average error correction. Achieved the lowest average MAPE (7.88%) across all 60 state-sector combinations — making it the most consistent performer for long-horizon CO₂ forecasting on this dataset.',
    strengths: ['Statistically interpretable', 'Works with small datasets', 'Fast training', 'Good for linear trends'],
    color: '#3b82f6',
  },
  Prophet: {
    icon: '🔮',
    fullName: 'Facebook Prophet',
    description:
      'A decomposable additive model from Meta Research designed for time series with strong seasonal effects and holiday anomalies. Handles yearly seasonality and trend changepoints robustly.',
    strengths: ['Handles missing data', 'Changepoint detection', 'Uncertainty intervals', 'Good for seasonality'],
    color: '#8b5cf6',
  },
  LSTM: {
    icon: '🧠',
    fullName: 'Long Short-Term Memory (Neural Network)',
    description:
      'A recurrent neural network that learns complex non-linear patterns across long time horizons. Trained on 30 state-sector combinations due to compute constraints. Achieves strong accuracy on stable series (best MAPE: 2.09%) but higher error on volatile series — making it a powerful tool for well-behaved emission trends.',
    strengths: ['Non-linear pattern learning', 'Long-term memory', 'Flexible architecture', 'Scalable to big data'],
    color: '#f59e0b',
  },
};

export default function ModelDetails({ summary }: ModelDetailsProps) {
  if (!summary) {
    return (
      <div className="card">
        <div className="loading-overlay"><div className="spinner" /><span>Loading model data...</span></div>
      </div>
    );
  }

  const models = summary.model_comparison;
  const bestModel = summary.best_model;



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Cards */}
      <div className="kpi-row">
        {(['ARIMA', 'Prophet', 'LSTM'] as const).map((m, i) => {
          const info = MODEL_INFO[m];
          const stats = models[m];
          const isBest = m === bestModel;
          return (
            <motion.div
              key={m}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                padding: 20,
                border: isBest ? `2px solid ${info.color}` : '1px solid var(--border)',
                position: 'relative',
              }}
            >
              {isBest && (
                <div style={{
                  position: 'absolute', top: -12, right: 16,
                  background: info.color, color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 20, letterSpacing: '0.5px',
                }}>
                  ★ BEST MODEL
                </div>
              )}
              <div style={{ fontSize: 24, marginBottom: 8 }}>{info.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: info.color, marginBottom: 4 }}>{m}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
                {info.fullName}
              </div>
              {stats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'MAPE', value: `${stats.avg_mape.toFixed(2)}%` },
                    { label: 'MAE', value: stats.avg_mae.toFixed(2) },
                    { label: 'RMSE', value: stats.avg_rmse.toFixed(2) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <motion.div
        className="card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="section-title"><span className="card-title-icon">📋</span>Performance Comparison</div>
            <div className="section-subtitle">Evaluation period: {summary.evaluation_period}</div>
          </div>
        </div>
        <div className="card-content">
          {(['ARIMA', 'Prophet', 'LSTM'] as const).map((m) => {
            const info = MODEL_INFO[m];
            const stats = models[m];
            const isBest = m === bestModel;
            if (!stats) return null;

            const accuracyScore = Math.max(0, Math.min(100, 100 - stats.avg_mape));

            return (
              <div key={m} className="model-row">
                <div className="model-row-header">
                  <div className="model-name">
                    <span style={{ fontSize: 18 }}>{info.icon}</span>
                    <span style={{ color: info.color }}>{m}</span>
                    {isBest && <span className="kpi-badge badge-success">✓ Best</span>}
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
                    style={{
                      background: info.color,
                      width: `${accuracyScore}%`,
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Accuracy score: {accuracyScore.toFixed(1)}% (higher = better)
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Model Descriptions */}
      <div className="grid-2">
        {(['ARIMA', 'Prophet', 'LSTM'] as const).map((m, i) => {
          const info = MODEL_INFO[m];
          return (
            <motion.div
              key={m}
              className="card"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div className="card-header">
                <div className="card-title">
                  {info.icon} {m} — {info.fullName}
                </div>
              </div>
              <div className="card-content">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                  {info.description}
                </p>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Strengths
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {info.strengths.map((s) => (
                    <span key={s} style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: `${info.color}15`,
                      color: info.color,
                      border: `1px solid ${info.color}30`,
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
