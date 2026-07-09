import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface SectorData {
  sector: string;
  value: number;
}

interface SectorPieChartProps {
  data: SectorData[];
  loading: boolean;
  state: string;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

const SECTOR_LABELS: Record<string, string> = {
  'Commercial carbon dioxide emissions': 'Commercial',
  'Electric Power carbon dioxide emissions': 'Electric Power',
  'Industrial carbon dioxide emissions': 'Industrial',
  'Residential carbon dioxide emissions': 'Residential',
  'Transportation carbon dioxide emissions': 'Transportation',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const shortName = SECTOR_LABELS[d.name] || d.name;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{shortName}</div>
      <div className="tooltip-row">
        <strong style={{ fontFamily: 'JetBrains Mono' }}>
          {d.value.toFixed(2)} MMT CO₂
        </strong>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {(d.value / d.total * 100).toFixed(1)}% of total
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  if (!payload) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 8px' }}>
      {payload.map((entry: any, i: number) => {
        const label = SECTOR_LABELS[entry.value] || entry.value;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function SectorPieChart({ data, loading, state }: SectorPieChartProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="section-header">
          <div className="section-title"><span className="card-title-icon">🥧</span>Sector Breakdown</div>
        </div>
        <div className="loading-overlay"><div className="spinner" /></div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const enriched = data.map((d) => ({ ...d, total }));

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="section-header">
        <div>
          <div className="section-title">
            <span className="card-title-icon">🥧</span>
            Sector Breakdown
          </div>
          <div className="section-subtitle">{state} · 2022 Forecast</div>
        </div>
      </div>

      <div className="chart-container" style={{ paddingTop: 12 }}>
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div>No sector data</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={enriched}
                dataKey="value"
                nameKey="sector"
                cx="45%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                strokeWidth={2}
                stroke="var(--surface)"
              >
                {enriched.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.88}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                content={<CustomLegend />}
                formatter={(value) => SECTOR_LABELS[value] || value}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Total */}
      {total > 0 && (
        <div style={{
          padding: '0 20px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border)',
          paddingTop: 12,
          marginTop: 4,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total (2022 Forecast)
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {total.toFixed(1)} MMT CO₂
          </span>
        </div>
      )}
    </motion.div>
  );
}
