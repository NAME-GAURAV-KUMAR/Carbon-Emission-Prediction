# Dashboard Directory

## Structure:
- **frontend/**: React application with TailwindCSS
- **backend/**: FastAPI server for predictions

## Setup:
### Frontend:
```bash
cd frontend
npm install
npm start
```

### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Features:
- Interactive filters (state, sector, fuel, year)
- Time series visualization with forecasts
- Model comparison charts
- Export functionality
