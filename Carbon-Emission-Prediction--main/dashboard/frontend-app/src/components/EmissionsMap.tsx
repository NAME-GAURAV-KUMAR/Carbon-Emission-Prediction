import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TopState } from '../api';

interface EmissionsMapProps {
  data: TopState[];
}

const ABBR_TO_NAME: Record<string, string> = {
  'AL':'Alabama','AK':'Alaska','AZ':'Arizona','AR':'Arkansas','CA':'California',
  'CO':'Colorado','CT':'Connecticut','DE':'Delaware','FL':'Florida','GA':'Georgia',
  'HI':'Hawaii','ID':'Idaho','IL':'Illinois','IN':'Indiana','IA':'Iowa',
  'KS':'Kansas','KY':'Kentucky','LA':'Louisiana','ME':'Maine','MD':'Maryland',
  'MA':'Massachusetts','MI':'Michigan','MN':'Minnesota','MS':'Mississippi',
  'MO':'Missouri','MT':'Montana','NE':'Nebraska','NV':'Nevada','NH':'New Hampshire',
  'NJ':'New Jersey','NM':'New Mexico','NY':'New York','NC':'North Carolina',
  'ND':'North Dakota','OH':'Ohio','OK':'Oklahoma','OR':'Oregon','PA':'Pennsylvania',
  'RI':'Rhode Island','SC':'South Carolina','SD':'South Dakota','TN':'Tennessee',
  'TX':'Texas','UT':'Utah','VT':'Vermont','VA':'Virginia','WA':'Washington',
  'WV':'West Virginia','WI':'Wisconsin','WY':'Wyoming'
};


// Grid positions [col, row] in a 11x8 grid (0-indexed)
const STATE_GRID: Record<string, { col: number; row: number; abbr: string }> = {
  'Alaska':         { col: 0, row: 7, abbr: 'AK' },
  'Hawaii':         { col: 2, row: 7, abbr: 'HI' },
  'Washington':     { col: 1, row: 0, abbr: 'WA' },
  'Oregon':         { col: 1, row: 1, abbr: 'OR' },
  'California':     { col: 1, row: 2, abbr: 'CA' },
  'Nevada':         { col: 2, row: 2, abbr: 'NV' },
  'Idaho':          { col: 2, row: 1, abbr: 'ID' },
  'Montana':        { col: 3, row: 0, abbr: 'MT' },
  'Wyoming':        { col: 3, row: 1, abbr: 'WY' },
  'Utah':           { col: 3, row: 2, abbr: 'UT' },
  'Arizona':        { col: 3, row: 3, abbr: 'AZ' },
  'Colorado':       { col: 4, row: 2, abbr: 'CO' },
  'New Mexico':     { col: 4, row: 3, abbr: 'NM' },
  'North Dakota':   { col: 4, row: 0, abbr: 'ND' },
  'South Dakota':   { col: 4, row: 1, abbr: 'SD' },
  'Nebraska':       { col: 5, row: 2, abbr: 'NE' },
  'Kansas':         { col: 5, row: 3, abbr: 'KS' },
  'Oklahoma':       { col: 5, row: 4, abbr: 'OK' },
  'Texas':          { col: 5, row: 5, abbr: 'TX' },
  'Minnesota':      { col: 5, row: 1, abbr: 'MN' },
  'Iowa':           { col: 5, row: 0, abbr: 'IA' },
  'Missouri':       { col: 6, row: 3, abbr: 'MO' },
  'Arkansas':       { col: 6, row: 4, abbr: 'AR' },
  'Louisiana':      { col: 6, row: 5, abbr: 'LA' },
  'Wisconsin':      { col: 6, row: 1, abbr: 'WI' },
  'Illinois':       { col: 6, row: 2, abbr: 'IL' },
  'Michigan':       { col: 7, row: 1, abbr: 'MI' },
  'Indiana':        { col: 7, row: 2, abbr: 'IN' },
  'Ohio':           { col: 7, row: 3, abbr: 'OH' },
  'Kentucky':       { col: 7, row: 4, abbr: 'KY' },
  'Tennessee':      { col: 7, row: 5, abbr: 'TN' },
  'Mississippi':    { col: 7, row: 6, abbr: 'MS' },
  'Alabama':        { col: 8, row: 6, abbr: 'AL' },
  'Georgia':        { col: 8, row: 5, abbr: 'GA' },
  'Florida':        { col: 9, row: 6, abbr: 'FL' },
  'South Carolina': { col: 9, row: 5, abbr: 'SC' },
  'North Carolina': { col: 8, row: 4, abbr: 'NC' },
  'Virginia':       { col: 8, row: 3, abbr: 'VA' },
  'West Virginia':  { col: 8, row: 2, abbr: 'WV' },
  'Pennsylvania':   { col: 8, row: 1, abbr: 'PA' },
  'New York':       { col: 9, row: 0, abbr: 'NY' },
  'New Jersey':     { col: 9, row: 1, abbr: 'NJ' },
  'Delaware':       { col: 9, row: 2, abbr: 'DE' },
  'Maryland':       { col: 9, row: 3, abbr: 'MD' },
  'Connecticut':    { col: 10, row: 1, abbr: 'CT' },
  'Rhode Island':   { col: 10, row: 2, abbr: 'RI' },
  'Massachusetts':  { col: 10, row: 0, abbr: 'MA' },
  'Vermont':        { col: 9, row: 4, abbr: 'VT' },
  'New Hampshire':  { col: 10, row: 3, abbr: 'NH' },
  'Maine':          { col: 10, row: 4, abbr: 'ME' },
};

function interpolateColor(t: number): string {
  // Light blue (low) → deep blue (high)
  const r = Math.round(219 - t * (219 - 30));
  const g = Math.round(234 - t * (234 - 64));
  const b = Math.round(254 - t * (254 - 175));
  return `rgb(${r},${g},${b})`;
}

const TILE_SIZE = 42;
const GAP = 4;

export default function EmissionsMap({ data }: EmissionsMapProps) {
  const [tooltip, setTooltip] = useState<{ abbr: string; stateName: string; emissions: number | null; rank: number | null; x: number; y: number } | null>(null);


  // Build abbreviation-keyed lookups so we correctly match API full-state-names
  // to the abbreviation-labelled tiles (handles both directions)
  const emissionsMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.filter(d => d.state !== 'United States').forEach(s => {
      // Try direct abbreviation match first, then full-name→abbreviation reverse lookup
      if (ABBR_TO_NAME[s.state]) {
        map[s.state] = s.emissions;
      } else {
        const abbr = Object.entries(ABBR_TO_NAME).find(([, name]) => name === s.state)?.[0];
        if (abbr) map[abbr] = s.emissions;
      }
    });
    return map;
  }, [data]);

  // Build rank lookup keyed by abbreviation (index-based since API has no rank field)
  const rankMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.filter(d => d.state !== 'United States').forEach((s, index) => {
      if (ABBR_TO_NAME[s.state]) {
        map[s.state] = index + 1;
      } else {
        const abbr = Object.entries(ABBR_TO_NAME).find(([, name]) => name === s.state)?.[0];
        if (abbr) map[abbr] = index + 1;
      }
    });
    return map;
  }, [data]);

  const maxEmissions = useMemo(() => {
    const vals = Object.values(emissionsMap).filter(v => !isNaN(v));
    return vals.length ? Math.max(...vals, 1) : 1;
  }, [emissionsMap]);


  const COLS = 11;
  const ROWS = 8;
  const svgWidth = COLS * (TILE_SIZE + GAP) - GAP;
  const svgHeight = ROWS * (TILE_SIZE + GAP) - GAP;

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
            <span className="card-title-icon">🗺️</span>
            Emissions Intensity Map — 2021
          </div>
          <div className="section-subtitle">CO₂ output by state (MMT) — hover for details</div>
        </div>
      </div>

      <div className="card-content" style={{ position: 'relative' }}>
        <div style={{ overflowX: 'auto' }}>
          <svg
            width={svgWidth}
            height={svgHeight}
            style={{ display: 'block', margin: '0 auto' }}
          >
            {Object.entries(STATE_GRID).map(([stateName, { col, row, abbr }]) => {
              const emissions = emissionsMap[abbr] ?? null;
              const rank = rankMap[abbr] ?? null;
              const intensity = emissions !== null ? Math.min(emissions / maxEmissions, 1) : 0;
              const fill = emissions !== null ? interpolateColor(intensity) : 'var(--border)';
              const textColor = intensity > 0.5 ? '#fff' : '#1e3a8a';
              const x = col * (TILE_SIZE + GAP);
              const y = row * (TILE_SIZE + GAP);

              return (
                <motion.g
                  key={stateName}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (col + row) * 0.012, duration: 0.3 }}
                  style={{ transformOrigin: `${x + TILE_SIZE / 2}px ${y + TILE_SIZE / 2}px` }}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
                    setTooltip({ abbr, stateName, emissions, rank, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={TILE_SIZE}
                    height={TILE_SIZE}
                    rx={6}
                    fill={fill}
                    stroke={intensity > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(30,64,175,0.2)'}
                    strokeWidth={1}
                    style={{ cursor: 'pointer', transition: 'filter 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as SVGRectElement).style.filter = 'brightness(1.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as SVGRectElement).style.filter = ''; }}
                  />
                  <text
                    x={x + TILE_SIZE / 2}
                    y={y + TILE_SIZE / 2 + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fontFamily="JetBrains Mono, monospace"
                    fill={textColor}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {abbr}
                  </text>
                </motion.g>
              );
            })}

          </svg>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'fixed',
            left: tooltip.x + TILE_SIZE / 2,
            top: tooltip.y - 72,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {tooltip.stateName}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>
              {tooltip.emissions !== null
                ? `${tooltip.emissions.toFixed(1)} MMT CO₂`
                : 'Data not in top 10'}
            </div>
            {tooltip.rank !== null && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Rank #{tooltip.rank} emitter
              </div>
            )}
          </div>
        )}


        {/* Color Legend */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Low</span>
          <div style={{
            width: 180, height: 10, borderRadius: 5,
            background: 'linear-gradient(to right, rgb(219,234,254), rgb(30,64,175))',
            border: '1px solid var(--border)',
          }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>High</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
            {maxEmissions > 0 ? `Max: ${maxEmissions.toFixed(0)} MMT` : 'Top 10 states shown'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
