# backend/app/main.py

"""Application entry point.

Creates the FastAPI app, includes routers, and sets up CORS middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routers import auth, users, tasks, approvals, dashboard

app = FastAPI(title="Mini Enterprise Collaboration", version="0.1.0")

# CORS (allow all for development; adjust for production)
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(approvals.router)
app.include_router(dashboard.router)
