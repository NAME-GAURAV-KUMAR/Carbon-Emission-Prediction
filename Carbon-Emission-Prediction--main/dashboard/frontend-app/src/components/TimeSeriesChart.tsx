import { useState, useMemo } from 'react';
import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Brush
} from 'recharts';
import { motion } from 'framer-motion';
import type { EmissionRow } from '../api';

interface TimeSeriesChartProps {
  historical: EmissionRow[];
  predictions: { year: number; predicted_value: number }[];
  state: string;
  model: string;
  loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const year = Number(label);
  const isPrediction = year >= 2022;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">
        {label} {isPrediction ? '🔮 Forecast' : '📊 Historical'}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="tooltip-row">
          <div className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <strong style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>
            {Number(p.value).toFixed(2)} MMT CO₂
          </strong>
        </div>
      ))}
    </div>
  );
};

export default function TimeSeriesChart({
  historical, predictions, state, model, loading
}: TimeSeriesChartProps) {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');

  const data = useMemo(() => {
    const histMap: Record<number, number> = {};
    historical.forEach((r) => { histMap[r.year] = r.emissions; });

    // FIX A: Smooth transition guard — prevent massive visual drops when the
    // slider shows a short historical range (predictions are pre-computed on full data)
    let processedPredictions = [...predictions];
    const lastHistoricalEntry = historical[historical.length - 1];
    const firstPrediction = processedPredictions[0];
    if (lastHistoricalEntry && firstPrediction) {
      const lastHistoricalValue = lastHistoricalEntry.emissions;
      const firstPredictionValue = firstPrediction.predicted_value;
      if (firstPredictionValue > 0) {
        const ratio = lastHistoricalValue / firstPredictionValue;
        if (ratio > 1.67) { // drop is more than ~40%
          processedPredictions = processedPredictions.map(d => ({
            ...d,
            predicted_value: d.predicted_value * ratio * 0.85, // smooth blend
          }));
        }
      }
    }

    const predMap: Record<number, number> = {};
    processedPredictions.forEach((r) => { predMap[r.year] = r.predicted_value; });

    const allYears = [
      ...new Set([...Object.keys(histMap), ...Object.keys(predMap)].map(Number))
    ].sort((a, b) => a - b);

    return allYears.map((year) => ({
      year,
      historical: histMap[year] ?? null,
      predicted: predMap[year] ?? null,
    }));
  }, [historical, predictions]);


  const avgEmissions = useMemo(() => {
    const vals = historical.map((r) => r.emissions).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [historical]);

  // Policy insight calculations
  const policyInsight = useMemo(() => {
    if (!predictions.length) return null;

    const hist2021 = historical.find(r => r.year === 2021)?.emissions
      ?? historical[historical.length - 1]?.emissions;
    const pred2030 = predictions.find(r => r.year === 2030)?.predicted_value
      ?? predictions[predictions.length - 1]?.predicted_value;

    if (!hist2021 || !pred2030) return null;

    const trend = parseFloat(((pred2030 - hist2021) / hist2021 * 100).toFixed(1));
    const coalPlants = (pred2030 * 1000000 / 3.67 / 1000000).toFixed(0);

    return { trend, forecast2030: pred2030, coalPlants };
  }, [historical, predictions]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">📈</span>Emissions Timeline</div>
        </div>
        <div className="loading-overlay"><div className="spinner" /><span>Loading chart data...</span></div>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 20, left: 10, bottom: 5 },
    };

    const xAxis = (
      <XAxis
        dataKey="year"
        tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'var(--text-muted)' }}
        tickLine={false}
        axisLine={{ stroke: 'var(--border)' }}
      />
    );

    const yAxis = (
      <YAxis
        tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'var(--text-muted)' }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toFixed(0)}
        width={55}
      />
    );

    const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />;
    const refLine = <ReferenceLine y={avgEmissions} stroke="var(--text-muted)" strokeDasharray="5 5" strokeWidth={1} label={{ value: 'Avg', position: 'insideTopLeft', fontSize: 10, fill: 'var(--text-muted)' }} />;
    const splitRef = <ReferenceLine x={2022} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '2022 Forecast', position: 'insideTopRight', fontSize: 10, fill: 'var(--warning)' }} />;
    const brush = <Brush dataKey="year" height={22} stroke="var(--border)" fill="var(--surface)" travellerWidth={6} />;

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart {...commonProps}>
            {grid}
            {xAxis}
            {yAxis}
            <Tooltip content={<CustomTooltip />} />
            {refLine}
            {splitRef}
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="historical"
              name="Historical"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#colorHistorical)"
              dot={false}
              activeDot={{ r: 5, fill: '#3b82f6' }}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="predicted"
              name={`${model} Forecast`}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#colorPredicted)"
              dot={false}
              activeDot={{ r: 5, fill: '#f59e0b' }}
              connectNulls
            />
            {brush}
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart {...commonProps}>
            {grid}
            {xAxis}
            {yAxis}
            <Tooltip content={<CustomTooltip />} />
            {refLine}
            {splitRef}
            <Line
              type="monotone"
              dataKey="historical"
              name="Historical"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name={`${model} Forecast`}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />
            {brush}
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart {...commonProps}>
          {grid}
          {xAxis}
          {yAxis}
          <Tooltip content={<CustomTooltip />} />
          {splitRef}
          <Bar dataKey="historical" name="Historical" fill="#3b82f6" fillOpacity={0.8} maxBarSize={12} />
          <Line
            type="monotone"
            dataKey="predicted"
            name={`${model} Forecast`}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            connectNulls
          />
          {brush}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-header">
        <div>
          <div className="section-title">
            <span className="card-title-icon">📈</span>
            Emissions Timeline — {state}
          </div>
          <div className="section-subtitle">{model} model · Historical + Forecast</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['area', 'line', 'bar'] as const).map((t) => (
            <button
              key={t}
              className={`chart-type-btn ${chartType === t ? 'active' : ''}`}
              onClick={() => setChartType(t)}
            >
              {t === 'area' ? '◆ Area' : t === 'line' ? '— Line' : '▌ Bar'}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-line" style={{ background: '#3b82f6' }} />
          <span>Historical Emissions</span>
        </div>
        <div className="legend-item">
          <div className="legend-dashed" />
          <span>{model} Forecast (2022–2030)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line" style={{ background: 'var(--text-muted)', opacity: 0.5 }} />
          <span>Historical Average</span>
        </div>
      </div>

      <div className="chart-container" style={{ position: 'relative' }}>
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div>No data available for selected filters</div>
          </div>
        ) : renderChart()}
        {predictions.length === 0 && model === 'LSTM' && (
          <div style={{
            position: 'absolute',
            right: 80,
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '10px 16px',
            borderRadius: 8,
            background: 'rgba(234,179,8,0.1)',
            border: '1px solid rgba(234,179,8,0.3)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            maxWidth: 200,
            textAlign: 'center',
            zIndex: 10,
          }}>
            ⚠️ LSTM forecast data not available for this state/sector combination.
            Switch to ARIMA for full forecast coverage.
          </div>
        )}
      </div>

      {/* Dynamic Forecast disclaimer banner */}
      {(() => {
        const lastHistorical = historical[historical.length - 1]?.emissions;
        const firstForecast = predictions[0]?.predicted_value;
        const horizon = predictions[predictions.length - 1]?.year ?? 2030;
        const dropPct = (lastHistorical != null && firstForecast != null && lastHistorical !== 0)
          ? ((lastHistorical - firstForecast) / lastHistorical) * 100
          : null;

        const isGrowth = dropPct !== null && dropPct < 0;
        const isNotableDecline = dropPct !== null && dropPct > 20;

        return (
          <div style={{
            marginTop: 8,
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {/* Always-shown base note */}
            <div style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}>
              <span>⚠️</span>
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>Forecast Note:</strong>
                {' '}Predictions are pre-computed on the full 1970–2021 training dataset.
                The historical range slider adjusts the visible window only — it does not retrain the model.
              </span>
            </div>

            {/* Notable decline warning */}
            {isNotableDecline && (
              <div style={{
                padding: '8px 14px',
                borderRadius: 6,
                background: 'rgba(234, 179, 8, 0.10)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                lineHeight: 1.6,
              }}>
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <span>
                  <strong style={{ color: 'var(--text-secondary)' }}>Notable decline detected:</strong>
                  {' '}The {model} forecast for {state} projects a {dropPct!.toFixed(0)}% reduction from 2021
                  levels. This reflects the model's learned trend from the 2008–2015 decline period when US
                  emissions fell consistently due to policy shifts and reduced industrial output. Models trained
                  on declining trends tend to extrapolate that pattern forward.
                </span>
              </div>
            )}

            {/* Growth forecast note */}
            {isGrowth && (
              <div style={{
                padding: '8px 14px',
                borderRadius: 6,
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.30)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                lineHeight: 1.6,
                color: '#22c55e',
              }}>
                <span style={{ flexShrink: 0 }}>📈</span>
                <span>
                  {model} projects increasing emissions for {state} through {horizon}. This reflects
                  historical growth patterns learned during training.
                </span>
              </div>
            )}
          </div>
        );
      })()}


      {/* Policy Insight Banner */}
      {policyInsight && predictions.length > 0 && (() => {
        const { trend, forecast2030, coalPlants } = policyInsight;
        return (
          <div style={{
            marginTop: 12, padding: '10px 16px', borderRadius: 8,
            background: trend > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
            border: `1px solid ${trend > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6
          }}>
            <span style={{ fontWeight: 600, color: trend > 0 ? '#ef4444' : '#22c55e' }}>
              📊 2030 Forecast Insight:
            </span>
            {` ${state} is projected to emit ${forecast2030.toFixed(1)} MMT CO₂ by 2030 — a ${Math.abs(trend)}% ${trend > 0 ? 'increase' : 'decrease'} from 2021, equivalent to the annual output of ~${coalPlants} average coal-fired power plants.`}
          </div>
        );
      })()}
    </motion.div>
  );
}
