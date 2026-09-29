"""
TriageMind FastAPI application.
"""
import logging
import sys
import os

# Ensure app is importable from project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import validate_required_settings, get_settings
from app.api import alerts, triage, feedback, learning, demo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TriageMind API",
    description="AI SOC Alert Triage with Hindsight memory",
    version="1.0.0",
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(alerts.router, prefix="/api")
app.include_router(triage.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(learning.router, prefix="/api")
app.include_router(demo.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    s = get_settings()
    logger.info("TriageMind starting up (env=%s, demo_mode=%s)", s.app_env, s.demo_mode)
    errors = validate_required_settings()
    if errors:
        logger.warning("Configuration issues detected:")
        for e in errors:
            logger.warning("  ⚠️  %s", e)
    else:
        logger.info("✅ All required configuration present")
        # Ensure bank exists on startup
        try:
            from app.services.hindsight_service import ensure_bank_exists
            ensure_bank_exists()
            logger.info("✅ Hindsight bank ready")
        except Exception as e:
            logger.error("Failed to initialize Hindsight bank: %s", e)


@app.get("/api/health")
async def health():
    from app.services.hindsight_service import health_check
    config_errors = validate_required_settings()
    hindsight = health_check()
    return {
        "status": "ok" if not config_errors and hindsight["status"] == "ok" else "degraded",
        "hindsight": hindsight,
        "config_errors": config_errors,
        "app_env": get_settings().app_env,
    }
