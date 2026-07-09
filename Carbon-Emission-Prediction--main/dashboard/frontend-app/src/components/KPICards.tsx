import { motion } from 'framer-motion';
import type { KPIData } from '../api';

interface KPICardsProps {
  kpi: KPIData | null;
  loading: boolean;
  state: string;
}

function formatEmissions(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}K`;
  return v.toFixed(1);
}

function formatEconomicCost(emissionsMmt: number): string {
  const dollars = emissionsMmt * 1_000_000 * 51;
  if (dollars >= 1e12) return `$${(dollars / 1e12).toFixed(1)} Trillion`;
  if (dollars >= 1e9) return `$${(dollars / 1e9).toFixed(1)} Billion`;
  return `$${(dollars / 1e6).toFixed(1)} Million`;
}

export default function KPICards({ kpi, loading, state }: KPICardsProps) {
  if (loading) {
    return (
      <div className="kpi-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card blue" style={{ opacity: 0.6 }}>
            <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 40, width: 120, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 10, width: 60 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!kpi) return null;

  const isUS = state === 'United States';
  const unit = isUS ? 'Million Metric Tons CO₂' : 'MMT CO₂';
  const shortUnit = 'MMT CO₂';

  const pctChange = kpi.first_emissions > 0
    ? ((kpi.latest_emissions - kpi.first_emissions) / kpi.first_emissions) * 100
    : 0;

  const cards = [
    {
      color: 'blue',
      icon: '📈',
      label: `Latest Emissions (${kpi.latest_year})`,
      value: formatEmissions(kpi.latest_emissions),
      unit,
      badge: kpi.yoy_pct !== null ? {
        text: `${kpi.yoy_pct > 0 ? '↑' : '↓'} ${Math.abs(kpi.yoy_pct).toFixed(1)}% YoY`,
        type: kpi.yoy_pct > 0 ? 'danger' : 'success',
      } : null,
      sub: `vs ${kpi.first_year}: ${pctChange > 0 ? '+' : ''}${pctChange.toFixed(0)}%`,
      extraNote: null,
    },
    {
      color: 'red',
      icon: '🏔️',
      label: 'Peak Emissions Year',
      value: kpi.peak_year.toString(),
      unit: `${formatEmissions(kpi.peak_emissions)} ${shortUnit}`,
      badge: null,
      sub: `Max recorded emission value`,
      extraNote: null,
    },
    {
      color: 'green',
      icon: '📉',
      label: 'Change vs Peak',
      value: `${(((kpi.latest_emissions - kpi.peak_emissions) / kpi.peak_emissions) * 100).toFixed(1)}%`,
      unit: `from peak of ${formatEmissions(kpi.peak_emissions)} MMT`,
      badge: {
        text: kpi.latest_emissions < kpi.peak_emissions ? '✓ Declining' : '⚠ Elevated',
        type: kpi.latest_emissions < kpi.peak_emissions ? 'success' : 'danger',
      },
      sub: `Trend since ${kpi.peak_year}`,
      extraNote: null,
    },
    {
      color: 'orange',
      icon: '💰',
      label: 'Economic Impact',
      value: formatEconomicCost(kpi.latest_emissions),
      unit: `Est. annual cost @ $51/ton CO₂ (US EPA)`,
      badge: {
        text: '⚠ High Urgency',
        type: 'danger',
      },
      sub: `Social Cost of Carbon methodology`,
      extraNote: null,
    },
  ];

  return (
    <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className={`kpi-card ${card.color}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, type: 'spring', stiffness: 120 }}
          whileHover={{ y: -4 }}
          style={card.color === 'orange' ? {
            borderColor: 'rgba(239,68,68,0.3)',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(251,146,60,0.06) 100%)',
          } : undefined}
        >
          <div className="kpi-label">{card.icon} {card.label}</div>
          <div className={`kpi-value ${card.value.length <= 10 ? 'big' : ''}`}
            style={card.color === 'orange' ? { color: '#ef4444', fontSize: card.value.length > 12 ? 18 : undefined } : undefined}
          >
            {card.value}
          </div>
          <div className="kpi-unit">{card.unit}</div>
          <div className="kpi-change">
            {card.badge && (
              <span className={`kpi-badge badge-${card.badge.type}`}>
                {card.badge.text}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{card.sub}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
