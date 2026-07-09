import { motion } from 'framer-motion';
import { useDashboardStore } from '../store';

interface HeaderProps {
  onExportCSV: () => void;
  onExportPNG: () => void;
}

export default function Header({ onExportCSV, onExportPNG }: HeaderProps) {
  const { darkMode, toggleDarkMode, activeSection, setActiveSection } = useDashboardStore();

  const navItems = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'model-details', label: '🧠 Model Details' },
    { key: 'about', label: 'ℹ️ About' },
  ] as const;

  return (
    <header className="header">
      <div className="header-left">
        <motion.div
          className="header-logo"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          🌍
        </motion.div>
        <div>
          <div className="header-title">CarbonIntel</div>
          <div className="header-subtitle">US Carbon Emission Intelligence Platform</div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
          {navItems.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className="chart-type-btn"
              style={{ fontSize: 12, padding: '5px 14px' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-active={activeSection === item.key}
            >
              <span className={activeSection === item.key ? '' : ''}>
                {activeSection === item.key ? <strong>{item.label}</strong> : item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="header-right">
        {/* Export buttons */}
        <motion.button
          className="btn-icon"
          onClick={onExportCSV}
          title="Export as CSV"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          📄
        </motion.button>
        <motion.button
          className="btn-icon"
          onClick={onExportPNG}
          title="Export chart as PNG"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          🖼️
        </motion.button>

        {/* Dark mode toggle */}
        <motion.button
          className="btn-icon"
          onClick={toggleDarkMode}
          title="Toggle dark mode"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: darkMode ? 180 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {darkMode ? '☀️' : '🌙'}
        </motion.button>

        {/* Status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 20,
          background: 'rgba(22,163,74,0.1)',
          border: '1px solid rgba(22,163,74,0.25)',
          fontSize: 11,
          fontWeight: 600,
          color: '#16a34a',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 6px rgba(22,163,74,0.6)',
            animation: 'spin 2s linear infinite',
            animationName: 'pulse-glow',
          }} />
          LIVE
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </header>
  );
}
