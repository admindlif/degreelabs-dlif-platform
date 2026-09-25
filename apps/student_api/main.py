"""
DLIF Student API entrypoint.
Dedicated runtime for the Student Portal (port 8000).
"""

import sys
from pathlib import Path

# Ensure shared backend modules are importable
backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine
from app.api.router import api_router
from apps.student_api.routes import router as student_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Student-API] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DLIF Student API",
    description="Dedicated backend runtime for the DegreeLabs Student Portal.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: Restricted strictly to the Student Frontend (port 3000)
_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    settings.frontend_base_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount shared auth routes (login, activate, 2fa, /auth/me)
app.include_router(api_router)

# Mount student-portal-specific routes (/api/v1/student/me etc.)
app.include_router(student_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def root():
    return {
        "portal": "student",
        "service": "DLIF Student API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "portal": "student",
        "status": "healthy",
    }


@app.get("/health/db", tags=["Health"])
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "portal": "student",
        "status": "healthy",
        "database": "connected",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.student_api.main:app", host="0.0.0.0", port=8000, reload=True)
