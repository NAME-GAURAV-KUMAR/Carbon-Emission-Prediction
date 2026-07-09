import { motion } from 'framer-motion';

export default function AboutSection() {
  const feasibility = [
    {
      name: 'Technical Feasibility',
      desc: '3 ML models (ARIMA, Prophet, LSTM) trained on 52 years of EIA data. FastAPI backend with React dashboard. 150 models trained, best MAPE: 7.88%.',
      emoji: '🔧',
    },
    {
      name: 'Economic Feasibility',
      desc: 'Carbon emissions carry a $51/ton social cost (US EPA). CarbonIntel quantifies this, enabling cost-benefit analysis for state-level energy policy decisions.',
      emoji: '💰',
    },
    {
      name: 'Societal Feasibility',
      desc: 'Emissions directly affect public health, energy access, and quality of life. Interactive forecasts empower citizens, journalists, and NGOs with accessible data.',
      emoji: '🌍',
    },
    {
      name: 'Environmental Feasibility',
      desc: 'Tracks CO₂ across 5 sectors and 4 fuel types. Identifies peak emission years and declining trends to support decarbonisation planning and net-zero targets.',
      emoji: '🌿',
    },
    {
      name: 'Political Feasibility',
      desc: 'State-level granularity enables comparison across political jurisdictions. Supports evidence-based policy advocacy and regulatory impact assessment.',
      emoji: '🏛️',
    },
    {
      name: 'Demographic Feasibility',
      desc: 'Population-normalised per-capita metrics reveal inequality in emissions burden. High-emission states with smaller populations show disproportionate environmental impact.',
      emoji: '👥',
    },
  ];

  const stats = [
    { label: 'Data Points', value: '100K+', icon: '📦' },
    { label: 'States Covered', value: '50+', icon: '📍' },
    { label: 'Years of Data', value: '52', icon: '📅' },
    { label: 'Forecast Years', value: '9', icon: '🔮' },
    { label: 'Models Trained', value: '150', icon: '🤖' },
    { label: 'Sectors Tracked', value: '5', icon: '🏭' },
    { label: 'Social Cost of Carbon (EPA)', value: '$51/ton', icon: '💵' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero */}
      <motion.div
        className="card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #8b5cf6 100%)',
          border: 'none',
          color: 'white',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
          CarbonIntel Dashboard
        </h1>
        <p style={{ fontSize: 15, opacity: 0.85, maxWidth: 680, margin: '0 auto', lineHeight: 1.7 }}>
          An AI-powered platform for forecasting US state-level CO₂ emissions —
          bridging environmental data science with economic, societal, and policy impact analysis.
        </p>
        <div style={{
          marginTop: 20,
          display: 'inline-flex',
          gap: 10,
          flexWrap: 'wrap' as const,
          justifyContent: 'center',
        }}>
          {['React 18', 'TypeScript', 'FastAPI', 'Recharts', 'ARIMA', 'Prophet', 'LSTM'].map((tag) => (
            <span key={tag} style={{
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ padding: 20, textAlign: 'center' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Feasibility Framework */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="section-header">
          <div className="section-title"><span className="card-title-icon">🏗️</span>Feasibility Framework</div>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {feasibility.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Data Source + Real-World Impact */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="section-header">
          <div className="section-title"><span className="card-title-icon">📦</span>Data Sources &amp; Methodology</div>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>📊 Dataset</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Source: U.S. Energy Information Administration (EIA)',
                  'Coverage: All 50 US States + National Total',
                  'Time Span: 1970 – 2021 (52 years)',
                  'Sectors: Commercial, Residential, Industrial, Transportation, Electric Power',
                  'Fuels: All fuel types (Natural Gas, Coal, Petroleum, etc.)',
                ].map((item) => (
                  <li key={item} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--primary)' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🔬 Methodology</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Train/test split at 2016, evaluated on 2016–2021',
                  'ARIMA: Auto-ARIMA for optimal (p,d,q) selection',
                  'Prophet: Yearly seasonality, additive mode',
                  'LSTM: 2-layer, 50 units, 50 epochs, ADAM optimizer',
                  'Best MAPE achieved: 7.88% on held-out test data',
                ].map((item) => (
                  <li key={item} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--primary)' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🌐 Real-World Impact</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Findings can inform state energy legislation',
                  'Per-capita analysis reveals demographic inequities in pollution burden',
                  'Economic cost modelling bridges environmental science and policy economics',
                  'State comparisons support cross-jurisdictional policy evaluation',
                  '2030 forecasts highlight intervention urgency for high-emission states',
                ].map((item) => (
                  <li key={item} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#f59e0b' }}>★</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
