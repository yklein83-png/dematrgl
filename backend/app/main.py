"""
Backend FastAPI - Le Fare de l'Épargne
Application principale de gestion patrimoniale
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv
import logging

# Configurer le logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configuration et Database
from app.config import get_settings
from app.database import check_db_connection

# Routeur principal API
from app.api import api_router

# Charger les variables d'environnement
load_dotenv()
settings = get_settings()


# --- Gestion du cycle de vie de l'application ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestion du démarrage et arrêt de l'application
    """
    print("🚀 API FastAPI - Démarrage de l'application...")
    print(f"📌 Environnement: {settings.ENVIRONMENT}")
    print(f"📌 Version: {settings.APP_VERSION}")

    # Vérification connexion base de données
    db_connected = await check_db_connection()
    if db_connected:
        print("✅ Base de données PostgreSQL connectée")
    else:
        print("⚠️  Base de données non accessible au démarrage")

    yield

    print("🛑 API FastAPI - Arrêt de l'application...")


# --- Initialisation de l'application FastAPI ---
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
)


# --- Configuration CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
    expose_headers=["Content-Disposition"],  # Permettre au frontend de lire le nom de fichier
)


# --- Handler pour les erreurs de validation ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log detailed validation errors"""
    errors = exc.errors()
    logger.error("=" * 50)
    logger.error("VALIDATION ERROR DETAILS:")
    for error in errors:
        logger.error(f"  Field: {error.get('loc')}")
        logger.error(f"  Message: {error.get('msg')}")
        logger.error(f"  Type: {error.get('type')}")
        logger.error(f"  Input: {error.get('input')}")
        logger.error("-" * 30)
    logger.error("=" * 50)

    return JSONResponse(
        status_code=422,
        content={"detail": errors}
    )


# --- Inclusion du routeur principal ---
app.include_router(api_router, prefix=settings.API_PREFIX)


# --- Routes de santé et statut ---
@app.get("/", tags=["Health"])
async def root():
    """Route racine - Health check"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check pour monitoring"""
    db_status = await check_db_connection()

    return {
        "status": "healthy" if db_status else "degraded",
        "database": "connected" if db_status else "disconnected",
        "version": settings.APP_VERSION
    }