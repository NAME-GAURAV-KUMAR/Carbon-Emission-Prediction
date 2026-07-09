import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { motion } from 'framer-motion';
import type { TopState } from '../api';

// 2021 US Census estimates
const STATE_POPULATION: Record<string, number> = {
  'Texas': 29527941, 'California': 39237836, 'Florida': 21781128,
  'Pennsylvania': 13011844, 'Ohio': 11799448, 'Louisiana': 4624047,
  'Illinois': 12671821, 'Indiana': 6805985, 'New York': 20201249,
  'West Virginia': 1793716, 'Kentucky': 4509394, 'Michigan': 10077331,
  'Georgia': 10799566, 'North Carolina': 10551162, 'Virginia': 8642274,
  'Tennessee': 6975218, 'Alabama': 5039877, 'Missouri': 6154913,
  'Wyoming': 576851, 'North Dakota': 779094
};

interface TopStatesChartProps {
  data: TopState[];
  loading: boolean;
}

const COLORS = [
  '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
  '#bfdbfe', '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6',
];

export default function TopStatesChart({ data, loading }: TopStatesChartProps) {
  const [perCapita, setPerCapita] = useState(false);

  if (loading) {
    return (
      <div className="card">
        <div className="section-header">
          <div className="section-title"><span className="card-title-icon">🏆</span>Top Emitting States</div>
        </div>
        <div className="loading-overlay"><div className="spinner" /></div>
      </div>
    );
  }

  const chartData = data.filter(d => d.state !== 'United States').slice(0, 10);

  const displayData = chartData.map((d, i) => ({
    ...d,
    _rank: i + 1,
    display_value: perCapita && STATE_POPULATION[d.state]
      ? (d.emissions * 1e6) / STATE_POPULATION[d.state]
      : d.emissions
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">
          #{d._rank} {d.state}
        </div>
        <div className="tooltip-row">
          <strong style={{ fontFamily: 'JetBrains Mono' }}>
            {perCapita
              ? `${d.display_value.toFixed(2)} t/person`
              : `${d.emissions.toFixed(1)} MMT CO₂`}
          </strong>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="section-header">
        <div>
          <div className="section-title">
            <span className="card-title-icon">🏆</span>
            Top Emitting States
          </div>
          <div className="section-subtitle">
            {perCapita ? 'Metric tons CO₂ per person' : 'Top 10 US states by CO₂ output (MMT) — 2021'}
          </div>
        </div>
        <button
          onClick={() => setPerCapita(p => !p)}
          style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 20,
            border: '1px solid var(--border)', background: perCapita ? 'var(--primary)' : 'transparent',
            color: perCapita ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono'
          }}
        >
          {perCapita ? 'Per Capita' : 'Total'}
        </button>
      </div>

      <div className="chart-container" style={{ paddingTop: 12 }}>
        {displayData.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📊</div><div>No data</div></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={displayData}
              layout="vertical"
              margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => perCapita ? `${v.toFixed(1)}` : `${v.toFixed(0)}`}
              />
              <YAxis
                type="category"
                dataKey="state"
                width={80}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
              <Bar dataKey="display_value" name={perCapita ? 'Per Capita' : 'Total Emissions'} radius={[0, 4, 4, 0]}>
                {displayData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
                <LabelList
                  dataKey="display_value"
                  position="right"
                  style={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--text-muted)' }}
                  formatter={(v: any) => perCapita ? `${Number(v).toFixed(2)} t/p` : `${Number(v).toFixed(0)} MMT`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
