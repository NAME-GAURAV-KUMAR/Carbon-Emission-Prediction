from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json
from pathlib import Path

app = FastAPI(title="Carbon Emission Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage
DATA = {}
DATA_PATH = Path(__file__).parent.parent.parent / "data" / "dashboard"

@app.on_event("startup")
async def load_data():
    global DATA
    try:
        with open(DATA_PATH / "historical_emissions.json") as f:
            DATA["historical"] = json.load(f)
        with open(DATA_PATH / "future_predictions.json") as f:
            DATA["predictions"] = json.load(f)
        with open(DATA_PATH / "model_summary.json") as f:
            DATA["model_summary"] = json.load(f)
        with open(DATA_PATH / "top_states.json") as f:
            DATA["top_states"] = json.load(f)
        with open(DATA_PATH / "dashboard_config.json") as f:
            DATA["config"] = json.load(f)
        print("✅ All data loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        raise

@app.get("/")
async def root():
    return {"message": "Carbon Emission Intelligence API", "status": "running", "version": "1.0.0"}

@app.get("/api/config")
async def get_config():
    return DATA["config"]

@app.get("/api/models/summary")
async def get_model_summary():
    raw = DATA["model_summary"]
    # Normalize into consistent frontend-friendly structure
    model_comparison = {}
    overall = raw.get("overall_comparison", [])
    for entry in overall:
        name = entry["Model"]
        model_comparison[name] = {
            "avg_mape": entry.get("Avg MAPE", 0),
            "avg_mae": entry.get("Avg MAE", 0),
            "avg_rmse": entry.get("Avg RMSE", 0),
            "n_models": entry.get("N Models", 0),
        }
    return {
        "model_comparison": model_comparison,
        "best_model": raw.get("best_model", "ARIMA"),
        "evaluation_period": "2019–2021",
        "total_models": raw.get("total_models_trained", len(model_comparison)),
    }

@app.get("/api/states/top")
async def get_top_states(n: int = 10):
    states = DATA["top_states"]["top_10_states"]
    # Filter out "United States" for the top states chart
    filtered = [s for s in states if s["state"] != "United States"]
    return filtered[:n]

@app.get("/api/emissions")
async def get_emissions(
    state: Optional[str] = None,
    year_start: int = 1970,
    year_end: int = 2021
):
    """Get historical emissions filtered by state and year range."""
    data = DATA["historical"]
    
    filtered = [
        row for row in data
        if (not state or row["state"] == state)
        and year_start <= row["year"] <= year_end
    ]
    
    return filtered

@app.get("/api/emissions/timeseries")
async def get_timeseries(
    state: str = "United States",
    year_start: int = 1970,
    year_end: int = 2021
):
    """Get yearly total emissions for a state, aggregated by year."""
    data = DATA["historical"]
    
    filtered = [
        row for row in data
        if row["state"] == state
        and year_start <= row["year"] <= year_end
    ]
    
    # Sort by year
    filtered.sort(key=lambda x: x["year"])
    return filtered

@app.get("/api/emissions/kpi")
async def get_kpi(state: str = "United States"):
    """Get KPI stats for a specific state."""
    data = DATA["historical"]
    state_data = [row for row in data if row["state"] == state]
    
    if not state_data:
        return {}
    
    state_data.sort(key=lambda x: x["year"])
    
    latest = state_data[-1]
    prev = state_data[-2] if len(state_data) > 1 else None
    
    yoy_change = None
    yoy_pct = None
    if prev and prev["emissions"] > 0:
        yoy_change = latest["emissions"] - prev["emissions"]
        yoy_pct = (yoy_change / prev["emissions"]) * 100
    
    # Find peak year
    peak = max(state_data, key=lambda x: x["emissions"])
    
    # Sparkline (last 10 years)
    sparkline = [{"year": r["year"], "emissions": r["emissions"]} for r in state_data[-10:]]
    
    return {
        "state": state,
        "latest_year": latest["year"],
        "latest_emissions": latest["emissions"],
        "yoy_change": yoy_change,
        "yoy_pct": yoy_pct,
        "peak_year": peak["year"],
        "peak_emissions": peak["emissions"],
        "sparkline": sparkline,
        "first_year": state_data[0]["year"],
        "first_emissions": state_data[0]["emissions"],
    }

@app.get("/api/predictions")
async def get_predictions(
    state: Optional[str] = None,
    sector: Optional[str] = None,
    model: str = "ARIMA",
    horizon: int = 2030
):
    """Get future predictions filtered by state, sector, model, and horizon."""
    data = DATA["predictions"]
    
    filtered = [
        row for row in data
        if (not state or row["state"] == state)
        and (not sector or row["sector"] == sector)
        and row["model"] == model
        and row["year"] <= horizon
    ]
    
    filtered.sort(key=lambda x: x["year"])
    return filtered

@app.get("/api/predictions/timeseries")
async def get_predictions_timeseries(
    state: str = "United States",
    sector: str = "Total carbon dioxide emissions from all sectors",
    model: str = "ARIMA",
    horizon: int = 2030
):
    """Get yearly total predictions for a state."""
    data = DATA["predictions"]
    
    # Get unique years for this combo
    filtered = [
        row for row in data
        if row["state"] == state
        and row["sector"] == sector
        and row["model"] == model
        and row["year"] <= horizon
    ]
    
    if not filtered:
        # Try without sector filter - aggregate by year
        filtered = [
            row for row in data
            if row["state"] == state
            and row["model"] == model
            and row["year"] <= horizon
        ]
        
        # Aggregate by year
        from collections import defaultdict
        year_totals = defaultdict(float)
        for row in filtered:
            year_totals[row["year"]] += row["predicted_value"]
        
        result = [{"year": y, "predicted_value": v} for y, v in sorted(year_totals.items())]
        return result
    
    filtered.sort(key=lambda x: x["year"])
    return filtered

@app.get("/api/sectors")
async def get_sector_breakdown(state: str = "United States", year: int = 2021):
    """Get emissions breakdown by sector for a given state and year."""
    data = DATA["historical"]
    
    # For historical we only have total, so use prediction data for sector breakdown from state data
    # Instead we'll compute from historical, which only has total emissions
    # Returns total emissions for the state in that year
    result = [row for row in data if row["state"] == state and row["year"] == year]
    return result

@app.get("/api/sector-breakdown")
async def get_sector_breakdown_from_predictions(
    state: str = "United States",
    model: str = "ARIMA"
):
    """Get latest sector breakdown from predictions."""
    data = DATA["predictions"]
    
    # Get the first year's predictions for each sector
    sectors = {}
    for row in data:
        if row["state"] == state and row["model"] == model and row["year"] == 2022:
            sector = row["sector"]
            if "Total" not in sector:
                sectors[sector] = sectors.get(sector, 0) + row["predicted_value"]
    
    # Also check historical 2021 data by building sector proportions
    # For now return based on predictions
    result = [{"sector": k, "value": v} for k, v in sectors.items()]
    return result
