# Phase 1 — Mini Enterprise Collaboration & Workflow

This repo contains:

- `backend/`: FastAPI + SQLAlchemy + Alembic + JWT auth + RBAC + task management APIs
- `frontend/`: React (Vite) + Tailwind + Axios + React Router dashboard UI

## Quick start (SQLite default)

### Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

alembic upgrade head
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173`

## Environment

Backend reads env vars (optional):

- `DATABASE_URL` (default: `sqlite:///./app.db`)
- `JWT_SECRET_KEY` (default: `change-me-in-env`)
- `JWT_ALGORITHM` (default: `HS256`)
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (default: `60`)
- `CORS_ORIGINS` (default: `http://127.0.0.1:5173,http://localhost:5173`)

