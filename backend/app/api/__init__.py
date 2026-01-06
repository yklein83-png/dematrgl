"""
Package API - Routes de l'application
Configuration centralisée des routers
"""

from fastapi import APIRouter

from app.api import auth, users, clients, documents, exports, stats, entreprise

# Router principal de l'API
api_router = APIRouter()

# Inclure les sous-routers
api_router.include_router(
    auth.router,
    prefix="",
    tags=["Authentication"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)

api_router.include_router(
    clients.router,
    prefix="/clients",
    tags=["Clients"]
)

api_router.include_router(
    documents.router,
    prefix="/documents",
    tags=["Documents"]
)

api_router.include_router(
    exports.router,
    prefix="/exports",
    tags=["Exports"]
)

api_router.include_router(
    stats.router,
    prefix="/stats",
    tags=["Statistics"]
)

api_router.include_router(
    entreprise.router,
    prefix="",
    tags=["Entreprise"]
)