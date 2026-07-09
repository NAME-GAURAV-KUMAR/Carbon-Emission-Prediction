# 🌍 CarbonIntel Dashboard — How to Run

## Step 1 — Start the Backend (FastAPI)

Open a **new terminal** and run:

```bash
cd "/Users/lex/Downloads/Epics Project "
source myenv/bin/activate
uvicorn dashboard.backend.main:app --reload --port 8000
```

| URL | Description |
|-----|-------------|
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | Swagger / Interactive API Docs |

---

## Step 2 — Start the Frontend (React + Vite)

Open a **second terminal** and run:

```bash
cd "/Users/lex/Downloads/Epics Project/dashboard/frontend-app"
npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Dashboard (main app) |

---

## ✅ Done!

Open **http://localhost:5173** in your browser.

> **Note:** Make sure the backend (Step 1) is running before opening the frontend, otherwise API calls will fail.
