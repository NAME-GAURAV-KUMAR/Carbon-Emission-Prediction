# 🌍 CarbonIntel Dashboard — Complete Project Brief
> **Purpose of this document:** A complete, Claude-ready brief describing every aspect of the project — idea, architecture, data, ML pipeline, frontend, backend, known limitations — to enable precise, well-informed improvement suggestions.

---

## 1. Project Idea & Goal

**CarbonIntel** is a full-stack, AI-powered carbon emissions **forecasting and analysis dashboard** built as a college exhibition project (2026). The platform visualises 52 years of historical US state-level CO₂ emissions (1970–2021) and forecasts them up to 2030 using three time-series machine learning models.

### Core Objectives
- Let users interactively explore CO₂ emission trends by **state**, **sector**, and **fuel type**
- Compare three different forecasting algorithms (**ARIMA, Prophet, LSTM**) side-by-side
- Provide a clean, production-quality **React dashboard** backed by a **FastAPI REST API**
- Export data as **CSV** and snapshot the dashboard as **PNG**
- Serve as a showcase of end-to-end ML engineering: data → preprocessing → training → API → UI

### Target Audience
College exhibition judges, sustainability researchers, policy analysts, and data science peers.

---

## 2. Dataset

| Property | Value |
|---|---|
| **Source** | U.S. Energy Information Administration (EIA) |
| **File** | `data/raw/emissions.csv` (~4.4 MB) |
| **Records** | ~59,901 rows |
| **Coverage** | All 50 US States + National total |
| **Time Span** | 1970 – 2021 (52 years) |
| **Sectors** | Commercial, Residential, Industrial, Transportation, Electric Power |
| **Fuels** | All Fuels, Natural Gas, Coal, Petroleum |
| **Unit** | Million Metric Tons CO₂ (MMT CO₂) |

### Key Data Facts (from EDA)
- **2021 total US emissions:** 19,644 MMT CO₂
- **1970 total US emissions:** 17,014 MMT CO₂ → overall change: **+15.46%**
- **Peak year:** 2007 at 23,989 MMT CO₂
- **Top emitter 2021:** Texas (1,327 MMT)
- **Biggest sector 2021:** Transportation (3,630 MMT)
- **Biggest fuel 2021:** Petroleum (8,991 MMT)

---

## 3. Full Directory Structure

```
Epics ki ma ka /                          ← Project root
│
├── data/
│   ├── raw/
│   │   └── emissions.csv                 ← Original EIA dataset (4.4 MB)
│   ├── interim/                          ← (empty – intermediate files)
│   ├── processed/
│   │   ├── emissions_processed.csv       ← 10.7 MB cleaned + feature-engineered
│   │   ├── train_data.csv                ← 1970–2015 training split (9.5 MB)
│   │   ├── test_data.csv                 ← 2016–2021 evaluation split (1.2 MB)
│   │   └── preprocessing_metadata.json  ← Stats about the preprocessing run
│   └── dashboard/
│       ├── historical_emissions.json     ← Aggregated historical data for API (152 KB)
│       ├── future_predictions.json       ← All model predictions 2022–2030 (155 KB)
│       ├── model_summary.json            ← MAPE/MAE/RMSE for all 3 models
│       ├── top_states.json               ← Top 10 emitting states ranking
│       ├── dashboard_config.json         ← State list, sectors, fuels, config
│       ├── arima_predictions_2022_2030.csv
│       └── prophet_predictions_2022_2030.csv
│
├── notebooks/
│   ├── 01_eda.ipynb                      ← Exploratory Data Analysis (56 KB)
│   ├── 02_preprocessing.ipynb            ← Data cleaning & feature engineering (37 KB)
│   ├── 03_arima_model.ipynb              ← ARIMA training & evaluation (17 KB)
│   ├── 04_prophet_model.ipynb            ← Prophet training & evaluation (40 KB)
│   ├── 05_lstm_model_training.ipynb      ← LSTM training with PyTorch (18 KB)
│   └── 06_model_comparison (1).ipynb     ← Side-by-side model comparison (16 KB)
│
├── models/
│   ├── arima/
│   │   ├── arima_summary.json            ← Aggregate stats for ARIMA
│   │   └── [State_Sector_Fuel].pkl × 20 ← Trained ARIMA model per series (~177 KB each)
│   ├── prophet/
│   │   ├── prophet_summary.json          ← Aggregate stats for Prophet
│   │   └── [State_Sector_Fuel].pkl × 20 ← Trained Prophet models (~15 KB each)
│   ├── lstm/
│   │   ├── lstm_summary.json             ← Aggregate stats for LSTM
│   │   ├── [State_Sector_Fuel].pth × 31 ← PyTorch model weights (~22 KB each)
│   │   └── [State_Sector_Fuel]_scaler.pkl × 31 ← MinMaxScaler per series
│   └── ensemble/                         ← (reserved, empty)
│
├── scripts/
│   ├── preprocessing/                    ← (empty – work done in notebooks)
│   ├── training/                         ← (empty – work done in notebooks)
│   ├── evaluation/                       ← (empty)
│   └── export/                           ← (empty)
│
├── dashboard/
│   ├── backend/
│   │   └── main.py                       ← Single-file FastAPI app (243 lines)
│   ├── frontend/                         ← (legacy/unused folder)
│   └── frontend-app/                     ← Active Vite + React app
│       ├── index.html
│       ├── vite.config.ts                ← Vite dev server on port 3000, proxy → :8000
│       ├── package.json
│       └── src/
│           ├── main.tsx                  ← React entry point
│           ├── App.tsx                   ← Root component, API orchestration (321 lines)
│           ├── api.ts                    ← All API calls, TypeScript interfaces (93 lines)
│           ├── store.ts                  ← Zustand global state store (50 lines)
│           ├── index.css                 ← Full design system in vanilla CSS (19 KB)
│           ├── App.css                   ← App-level overrides (606 bytes)
│           └── components/
│               ├── Header.tsx            ← Top nav bar, export buttons
│               ├── Sidebar.tsx           ← Filters: state, year range, model, horizon
│               ├── KPICards.tsx          ← 3 animated KPI summary cards
│               ├── TimeSeriesChart.tsx   ← Historical + forecast chart (Recharts, 273 lines)
│               ├── TopStatesChart.tsx    ← Horizontal bar chart: top 10 states
│               ├── SectorChart.tsx       ← Sector breakdown pie/donut chart
│               ├── ModelDetails.tsx      ← Full model comparison view (217 lines)
│               └── AboutSection.tsx      ← Project info, methodology, team (170 lines)
│
├── reports/
│   ├── FINAL_SUMMARY.txt                 ← Training completion summary
│   ├── eda_insights.json                 ← Key EDA numbers
│   ├── figures/
│   │   ├── 01_total_emissions_over_time.html  ← Plotly interactive charts × 15
│   │   ├── 02_yoy_change.html
│   │   ├── 03_top_states_2021.html
│   │   ├── 04_top5_states_trends.html
│   │   ├── 05_sector_breakdown_2021.html
│   │   ├── 06_sector_trends.html
│   │   ├── 07_fuel_breakdown_2021.html
│   │   ├── 08_fuel_trends_stacked.html
│   │   ├── 09_fuel_market_share.html
│   │   ├── 10_fuel_correlation.html
│   │   ├── 11_emissions_distribution.html
│   │   ├── 12_boxplot_by_fuel.html
│   │   ├── 13_outlier_detection_example.html
│   │   ├── 14_state_year_heatmap.html
│   │   └── 15_sunburst_sector_fuel.html
│   ├── model_comparison/
│   │   ├── arima_results.csv
│   │   ├── prophet_results.csv
│   │   ├── lstm_results.csv
│   │   └── performance_comparison.html   ← Plotly model comparison chart
│   ├── outlier_analysis/                 ← EDA outlier reports
│   └── tables/                           ← Summary tables
│
├── deployment/
│   ├── docker/                           ← (reserved)
│   └── scripts/                          ← (reserved)
│
├── docs/
│   ├── api/                              ← (empty)
│   ├── architecture/                     ← (empty)
│   └── user_guide/                       ← (empty)
│
├── outputs/                              ← Final deliverables (empty currently)
├── tests/                                ← (empty – no tests written)
│
├── requirements.txt                      ← Python dependencies
├── README.md                             ← High-level readme
├── RUN.md                                ← How to run the project
└── .env.template                         ← Environment variable template
```

---

## 4. Technology Stack

### Backend (Python)
| Library | Version | Purpose |
|---|---|---|
| `fastapi` | ≥0.100 | REST API framework |
| `uvicorn[standard]` | ≥0.23 | ASGI server |
| `pydantic` | ≥2.0 | Data validation |
| `pandas` | ≥2.0 | Data manipulation |
| `numpy` | ≥1.24 | Numerical operations |
| `statsmodels` | ≥0.14 | ARIMA base models |
| `pmdarima` | ≥2.0 | Auto-ARIMA parameter selection |
| `prophet` | ≥1.1 | Facebook Prophet model |
| `torch` (PyTorch) | ≥2.0 | LSTM neural network |
| `tensorflow` | ≥2.13 | (installed but unused in final pipeline) |
| `scikit-learn` | ≥1.3 | MinMaxScaler, metrics |
| `plotly` | ≥5.14 | EDA charts in notebooks |
| `matplotlib` / `seaborn` | ≥3.7 / ≥0.12 | Static plots |
| `joblib` | ≥1.3 | Model serialisation (`.pkl`) |
| `python-dotenv` | ≥1.0 | `.env` config loading |
| `tqdm` | ≥4.65 | Progress bars |

### Frontend (TypeScript / React)
| Library | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool / dev server (port 3000) |
| Recharts | Interactive charts (ComposedChart, Area, Bar, Line) |
| Framer Motion | Animations (page transitions, card springanimations) |
| Zustand | Lightweight global state management |
| html2canvas | PNG export of the dashboard |

### Infrastructure
| Component | Detail |
|---|---|
| Backend port | `8000` (uvicorn `--reload`) |
| Frontend port | `3000` (Vite dev server) |
| API proxy | Vite proxies `/api/*` → `http://localhost:8000` |
| Python env | `myenv/` virtualenv |
| Data format | Pre-exported JSON files (no live model inference) |

---

## 5. Data Pipeline (Notebook Order)

### Notebook 01 — EDA (`01_eda.ipynb`)
- Loaded raw `emissions.csv` 
- Generated **15 interactive Plotly charts** (saved as HTML ~4.8 MB each)
- Computed national totals, YoY changes, sector & fuel breakdowns
- Identified peak emission year (2007), top states, outliers
- Saved insights to `reports/eda_insights.json`

### Notebook 02 — Preprocessing (`02_preprocessing.ipynb`)
- Cleaned raw dataset: removed nulls, filtered valid series
- **Outlier removal:** 5,711 data points removed using IQR-based detection
- **Feature engineering:** lag features (lag_1, lag_2, lag_3), rolling means (3-yr, 5-yr), rolling std, YoY change, decade encoding
- **Train/test split:** 1970–2015 (train) | 2016–2021 (test) — 53,391 / 6,510 records
- **Stationarity check:** 118 stationary series, 1,069 non-stationary
- Saved `emissions_processed.csv`, `train_data.csv`, `test_data.csv`, `preprocessing_metadata.json`

### Notebook 03 — ARIMA (`03_arima_model.ipynb`)
- Used `pmdarima.auto_arima()` for automatic (p,d,q) selection per series
- Trained **60 ARIMA models** across state × sector combinations
- Saved each model as `.pkl` in `models/arima/`
- **Results:** Avg MAPE: **7.88%**, Avg MAE: 14.91, Avg RMSE: 18.72
- Best MAPE: 1.94%, Worst MAPE: 33.04%

### Notebook 04 — Prophet (`04_prophet_model.ipynb`)
- Used Facebook Prophet with yearly seasonality, additive mode
- Trained **60 Prophet models**
- Saved each model as `.pkl` in `models/prophet/`
- **Results:** Avg MAPE: **15.07%**, Avg MAE: 19.08, Avg RMSE: 21.64
- Best MAPE: 3.12%

### Notebook 05 — LSTM (`05_lstm_model_training.ipynb`)
- Architecture: Lightweight LSTM (32 units), PyTorch
- Mentioned in AboutSection as "2-layer, 50 units, 50 epochs, ADAM optimizer" (slight discrepancy with summary JSON)
- Trained **30 LSTM models** (fewer than ARIMA/Prophet due to compute constraints)
- Saved as `.pth` + `_scaler.pkl` pairs in `models/lstm/`
- **Results:** Avg MAPE: **13.65%**, Avg MAE: 46.07, Avg RMSE: 46.07

### Notebook 06 — Model Comparison (`06_model_comparison.ipynb`)
- Side-by-side comparison of all 3 models
- Selected **ARIMA as best model** (lowest avg MAPE: 7.88%)
- Total models trained: **150**
- Exported dashboard-ready JSON files to `data/dashboard/`

---

## 6. Backend API — `dashboard/backend/main.py`

Single-file FastAPI app. Data is loaded **once at startup** from pre-exported JSON files into an in-memory `DATA` dict — **no live model inference**.

### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/config` | Dashboard config (states, sectors, fuels, time ranges) |
| `GET` | `/api/models/summary` | MAPE/MAE/RMSE comparison for all 3 models |
| `GET` | `/api/states/top?n=10` | Top N emitting states |
| `GET` | `/api/emissions?state&year_start&year_end` | Historical emissions (filtered) |
| `GET` | `/api/emissions/timeseries?state&year_start&year_end` | Yearly totals per state |
| `GET` | `/api/emissions/kpi?state` | KPI stats (latest, peak, YoY, sparkline) |
| `GET` | `/api/predictions?state&sector&model&horizon` | Raw predictions |
| `GET` | `/api/predictions/timeseries?state&sector&model&horizon` | Aggregated yearly predictions |
| `GET` | `/api/sectors?state&year` | Sector breakdown (historical) |
| `GET` | `/api/sector-breakdown?state&model` | Sector breakdown from predictions |

### CORS Configuration
Allows: `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:5173`

### Data Files Loaded at Startup
```
data/dashboard/
├── historical_emissions.json   → DATA["historical"]
├── future_predictions.json     → DATA["predictions"]
├── model_summary.json          → DATA["model_summary"]
├── top_states.json             → DATA["top_states"]
└── dashboard_config.json       → DATA["config"]
```

---

## 7. Frontend Architecture — `dashboard/frontend-app/`

### State Management (`src/store.ts` — Zustand)
```typescript
{
  selectedState: 'United States',   // Filter: which US state
  selectedModel: 'ARIMA',           // Filter: which ML model
  yearStart: 1990,                  // Filter: historical range start
  yearEnd: 2021,                    // Filter: historical range end
  predictionHorizon: 2030,          // Filter: forecast end year
  darkMode: false,                  // UI: dark/light toggle
  activeSection: 'dashboard',       // Navigation: 'dashboard' | 'model-details' | 'about'
  isLoading: boolean,               // Global loading flag (unused in practice)
}
```

### Data Fetching (`src/App.tsx` — `useApiData` hook)
All 6 API calls are fired in **parallel** via `Promise.all` on initial load and when "Apply Filters" is clicked:
1. `getKPI(state)` → KPI cards
2. `getTimeseries(state, yearStart, yearEnd)` → main chart historical
3. `getPredictionsTimeseries(state, sector, model, horizon)` → main chart forecast
4. `getModelSummary()` → model performance table
5. `getTopStates(10)` → top states bar chart
6. `getSectorBreakdown(state, model)` → sector pie chart

**Note:** Filters are **applied only on explicit button click** ("Apply Filters"), not reactively.

### Components
| Component | Role |
|---|---|
| `Header.tsx` | Top navigation bar, dark mode toggle, CSV/PNG export buttons |
| `Sidebar.tsx` | All filter controls: state dropdown, dual year sliders, model pills, forecast horizon slider, Apply button, quick stats |
| `KPICards.tsx` | 3 animated cards: Latest Emissions, Peak Year, Change vs Peak. Spring animations with Framer Motion |
| `TimeSeriesChart.tsx` | Main chart. Supports 3 view modes (Area / Line / Bar). Uses Recharts `ComposedChart`. Has brush for zooming. Average reference line. Forecast split reference at 2022 |
| `TopStatesChart.tsx` | Horizontal bar chart of top 10 emitting states |
| `SectorChart.tsx` | Pie/donut chart of sector emission breakdown from predictions |
| `ModelDetails.tsx` | Full-page model comparison: cards per model, animated MAPE progress bars, model descriptions, strengths |
| `AboutSection.tsx` | Project hero banner, stats grid, methodology, data source info |

### Sections (Navigation)
1. **Dashboard** — KPIs + TimeSeriesChart + TopStates + SectorPie + Model Performance summary
2. **Model Details** — Deep dive into ARIMA vs Prophet vs LSTM
3. **About** — Project overview, team, methodology

### Exports
- **CSV:** Combines historical + prediction rows → triggers browser download
- **PNG:** Uses `html2canvas` (lazy loaded) to screenshot the dashboard div at 2× scale

---

## 8. Model Performance Summary

| Model | Avg MAPE | Avg MAE | Avg RMSE | # Models | Best MAPE |
|---|---|---|---|---|---|
| **ARIMA** ⭐ | **7.88%** | 14.91 | 18.72 | 60 | 1.94% |
| LSTM | 13.65% | 46.07 | 46.07 | 30 | 2.09% |
| Prophet | 15.07% | 19.08 | 21.64 | 60 | 3.12% |

- **Winner:** ARIMA (lowest avg MAPE, best generalisation across all state-sector combinations)
- **Note:** LSTM's MAE/RMSE are significantly higher than Prophet's despite a similar MAPE, suggesting high error on large-value series
- Evaluation period: 2016–2021 (test set)
- Total models trained: 150

---

## 9. Known Issues & Limitations

### Critical Bugs (Already Fixed)
- ~~`api.ts` pointed to `localhost:8080` instead of `localhost:8000`~~ → **Fixed**: now uses `/api` proxy
- ~~`vite.config.ts` proxy target was `8080`~~ → **Fixed**: now `8000`

### Current Limitations

#### Backend
1. **No live inference** — All predictions are pre-computed. Changing the model selection on the frontend filters which JSON rows are returned; no model is ever loaded or called at runtime
2. **No router structure** — Everything is in a single `main.py` file (243 lines). No `APIRouter` used despite having `routers/` directory
3. **No pagination** — `historical_emissions.json` (152 KB) is loaded into memory and filtered in Python on every request, no pagination or caching
4. **No authentication** — API is fully open
5. **No tests** — `tests/` directory is empty
6. **No request validation** — No Pydantic request models; parameters accepted as raw query strings
7. **CORS is hardcoded** — Only allows localhost; no env-based config
8. **Startup error handling** — If any JSON file is missing, the entire app crashes on startup with `raise`

#### Frontend
1. **Sidebar state list is hardcoded** — Only 10 states in the dropdown despite `dashboard_config.json` having all 50 states
2. **Filters are not reactive** — Changing state/model doesn't auto-refresh; user must click "Apply Filters"
3. **No URL state** — Changing filters doesn't update the URL; can't share a link to a specific state/model view
4. **Sector filter not exposed in UI** — The API supports sector filtering but the frontend always sends `'Total carbon dioxide emissions from all sectors'` hardcoded in `App.tsx`
5. **Fuel filter missing entirely** — The dashboard_config defines 4 fuel types; no UI control exists for it
6. **Dark mode is toggle-only** — Doesn't persist to `localStorage`; resets on page reload
7. **No error boundary** — If one API call fails, the whole `Promise.all` fails and shows a generic error banner
8. **html2canvas issues** — The PNG export may fail silently (caught in a try/catch with only `console.error`)
9. **TypeScript `any` usage** — `CustomTooltip` props typed as `any` in `TimeSeriesChart.tsx`

#### Data / ML
1. **LSTM trained on only 30 models** vs 60 for ARIMA/Prophet — incomplete coverage
2. **No confidence intervals** — Forecasts are point estimates only; no uncertainty quantification displayed
3. **tensorflow listed in requirements but unused** — Adds ~500 MB overhead unnecessarily
4. **No ensemble model** — `models/ensemble/` directory exists but is empty
5. **Model files not used at runtime** — The `.pkl/.pth` files are never loaded by the backend; only pre-exported JSONs are used
6. **Predictions only go to 2030** — Hardcoded in dashboard config; cannot be extended without retraining

#### Infrastructure
1. **No Docker** — `deployment/docker/` exists but is empty; no containerisation
2. **No CI/CD** — No GitHub Actions or similar
3. **No `.env` usage** — `.env.template` exists but backend doesn't read any env vars
4. **`requirements.txt` has no pinned versions** — Uses `>=` ranges which can cause reproducibility issues
5. **No production build** — Running in `--reload` dev mode; no `npm run build` workflow
6. **`docs/` directory is empty** — All subfolders (api, architecture, user_guide) are empty
7. **`outputs/` directory is empty** — Nothing exported as a final deliverable

---

## 10. How to Run

### Prerequisites
- Python 3.10+ with `myenv` virtualenv
- Node.js 18+ with npm

### Step 1 — Backend
```bash
cd "/Users/lex/Desktop/Epics ki ma ka"
source myenv/bin/activate
uvicorn dashboard.backend.main:app --reload --port 8000
# → http://localhost:8000
# → API docs: http://localhost:8000/docs
```

### Step 2 — Frontend
```bash
cd "/Users/lex/Desktop/Epics ki ma ka/dashboard/frontend-app"
npm run dev
# → http://localhost:3000
```

---

## 11. Suggested Improvement Areas (Summary)

This section is a quick list for Claude to pick from when suggesting improvements:

### 🔴 High Priority
- Load all 50 states from `/api/config` into the sidebar dropdown instead of the hardcoded 10
- Add reactive data fetching (auto-refresh when filters change, debounced)
- Add sector and fuel dropdowns in the sidebar (data already exists in the API)
- Display **confidence intervals / prediction bands** on the time series chart
- Persist dark mode preference in `localStorage`
- Split backend into multiple routers and add Pydantic response models

### 🟡 Medium Priority
- Add URL-based state (e.g., `?state=Texas&model=LSTM`) so users can share views
- Add individual error handling per API call instead of one global `Promise.all`
- Add a **map visualisation** (choropleth) of US states coloured by emission level
- Add a **data comparison mode** to overlay two states on one chart
- Replace hardcoded `'Total carbon dioxide emissions from all sectors'` sector with a user-selectable dropdown
- Add loading skeletons for all charts (currently only KPI cards have them)
- Implement proper response caching on the backend (e.g., `functools.lru_cache`)

### 🟢 Nice to Have
- Containerise with Docker + `docker-compose` for easy distribution
- Write backend unit tests (pytest) and frontend tests (Vitest)
- Add export to PDF using `jsPDF` or server-side PDF generation
- Add an **outlier annotation layer** on the time series chart
- Pin dependency versions in `requirements.txt` for reproducibility
- Ensemble model: average ARIMA + Prophet predictions and serve as a 4th model option
- Remove `tensorflow` from `requirements.txt` if it's not used
- Add a real `/health` endpoint with uptime and data stats
- Add README badges (Python version, license, etc.)
