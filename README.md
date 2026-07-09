# Carbon Emission Prediction Platform 🌍

AI-Powered Carbon Forecasting for a Sustainable Future

## 📋 Project Overview

This project predicts carbon emissions across US states using multiple time series forecasting models (ARIMA, Prophet, LSTM) and provides an interactive dashboard for visualization and analysis.

### Features:
- ✅ Comprehensive EDA with 20+ visualizations
- ✅ Three ML models (ARIMA, Prophet, LSTM)
- ✅ Interactive React dashboard
- ✅ FastAPI backend for predictions
- ✅ Model comparison and evaluation
- ✅ Export functionality (CSV, PDF)

## 🗂️ Project Structure

```
carbon-emission-prediction/
├── data/                   # All data files
├── notebooks/              # Jupyter notebooks for analysis
├── models/                 # Trained ML models
├── scripts/                # Python scripts
├── dashboard/              # Web application
├── reports/                # Generated reports and figures
├── docs/                   # Documentation
└── outputs/                # Final deliverables
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Place Data
```bash
# Copy emissions.csv to data/raw/
cp path/to/emissions.csv data/raw/
```

### 3. Run Notebooks
```bash
jupyter notebook
# Execute notebooks in order: 01, 02, 03, 04, 05, 06
```

### 4. Start Dashboard
```bash
# Backend
cd dashboard/backend
uvicorn main:app --reload

# Frontend (new terminal)
cd dashboard/frontend
npm install
npm start
```

## 📊 Models

| Model | MAPE | Use Case |
|-------|------|----------|
| ARIMA | ~18% | Stationary series baseline |
| Prophet | ~12% | Trend + seasonality |
| LSTM | ~9% | Complex patterns |

## 🎯 Commercialization

This platform can be commercialized as:
- **SaaS Product**: Subscription-based emission forecasting
- **API Service**: Pay-per-prediction model
- **Consulting**: Custom implementations for enterprises



## 📄 License

This project is for educational purposes (College Exhibition 2026)

## 🙏 Acknowledgments

- Dataset: US Energy Information Administration
- Libraries: scikit-learn, PyTorch, React, FastAPI
