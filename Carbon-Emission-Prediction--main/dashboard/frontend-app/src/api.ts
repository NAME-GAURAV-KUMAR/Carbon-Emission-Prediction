const BASE = '/api';

export interface EmissionRow {
  year: number;
  state: string;
  emissions: number;
}

export interface PredictionRow {
  year: number;
  state: string;
  sector: string;
  fuel: string;
  predicted_value: number;
  model: string;
}

export interface ModelSummary {
  model_comparison: {
    [model: string]: {
      avg_mape: number;
      avg_mae: number;
      avg_rmse: number;
    };
  };
  best_model: string;
  evaluation_period: string;
}

export interface KPIData {
  state: string;
  latest_year: number;
  latest_emissions: number;
  yoy_change: number | null;
  yoy_pct: number | null;
  peak_year: number;
  peak_emissions: number;
  sparkline: { year: number; emissions: number }[];
  first_year: number;
  first_emissions: number;
}

export interface TopState {
  state: string;
  emissions: number;
  rank?: number;
}

async function get<T>(url: string, params?: Record<string, string | number>): Promise<T> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => searchParams.set(k, String(v)));
  }
  const fullUrl = `${BASE}${url}?${searchParams.toString()}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  getConfig: () => get<Record<string, unknown>>('/config'),

  getModelSummary: () => get<ModelSummary>('/models/summary'),

  getTopStates: (n = 10) => get<TopState[]>('/states/top', { n }),

  getKPI: (state = 'United States') =>
    get<KPIData>('/emissions/kpi', { state }),

  getTimeseries: (state = 'United States', yearStart = 1970, yearEnd = 2021) =>
    get<EmissionRow[]>('/emissions/timeseries', {
      state,
      year_start: yearStart,
      year_end: yearEnd,
    }),

  getPredictionsTimeseries: (
    state = 'United States',
    sector = 'Total carbon dioxide emissions from all sectors',
    model = 'ARIMA',
    horizon = 2030
  ) =>
    get<{ year: number; predicted_value: number }[]>('/predictions/timeseries', {
      state,
      sector,
      model,
      horizon,
    }),

  getSectorBreakdown: (state = 'United States', model = 'ARIMA') =>
    get<{ sector: string; value: number }[]>('/sector-breakdown', { state, model }),
};
