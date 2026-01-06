"""
Endpoints de health check pour le monitoring
Vérifie la santé de tous les composants du système
"""

from fastapi import APIRouter, Response
from pydantic import BaseModel
from typing import Dict, Optional, List
from datetime import datetime
import asyncio

from app.core.logging import get_logger
from app.core.metrics import get_metrics, get_metrics_content_type

logger = get_logger(__name__)

router = APIRouter(tags=["Health"])


class ComponentHealth(BaseModel):
    """État de santé d'un composant"""
    name: str
    status: str  # "healthy", "unhealthy", "degraded"
    latency_ms: Optional[float] = None
    message: Optional[str] = None
    last_check: str


class HealthResponse(BaseModel):
    """Réponse complète du health check"""
    status: str  # "healthy", "unhealthy", "degraded"
    timestamp: str
    version: str
    environment: str
    uptime_seconds: float
    components: List[ComponentHealth]


# Timestamp de démarrage pour calculer l'uptime
_start_time = datetime.utcnow()


async def check_database() -> ComponentHealth:
    """Vérifie la connexion à PostgreSQL"""
    start = datetime.utcnow()
    try:
        from app.database import get_db_session
        from sqlalchemy import text

        async for db in get_db_session():
            result = await db.execute(text("SELECT 1"))
            result.scalar()
            break

        latency = (datetime.utcnow() - start).total_seconds() * 1000
        return ComponentHealth(
            name="database",
            status="healthy",
            latency_ms=round(latency, 2),
            message="PostgreSQL connection OK",
            last_check=datetime.utcnow().isoformat()
        )
    except Exception as e:
        latency = (datetime.utcnow() - start).total_seconds() * 1000
        logger.error(f"Database health check failed: {e}")
        return ComponentHealth(
            name="database",
            status="unhealthy",
            latency_ms=round(latency, 2),
            message=str(e),
            last_check=datetime.utcnow().isoformat()
        )


async def check_redis() -> ComponentHealth:
    """Vérifie la connexion à Redis"""
    start = datetime.utcnow()
    try:
        from app.core.redis_client import get_redis_client

        redis = await get_redis_client()
        if redis:
            await redis.ping()
            latency = (datetime.utcnow() - start).total_seconds() * 1000
            return ComponentHealth(
                name="redis",
                status="healthy",
                latency_ms=round(latency, 2),
                message="Redis connection OK",
                last_check=datetime.utcnow().isoformat()
            )
        else:
            return ComponentHealth(
                name="redis",
                status="degraded",
                message="Redis client not initialized",
                last_check=datetime.utcnow().isoformat()
            )
    except Exception as e:
        latency = (datetime.utcnow() - start).total_seconds() * 1000
        logger.error(f"Redis health check failed: {e}")
        return ComponentHealth(
            name="redis",
            status="unhealthy",
            latency_ms=round(latency, 2),
            message=str(e),
            last_check=datetime.utcnow().isoformat()
        )


async def check_disk_space() -> ComponentHealth:
    """Vérifie l'espace disque disponible"""
    try:
        import shutil
        import os

        # Vérifier l'espace sur le répertoire de données
        data_path = os.environ.get("DATA_PATH", "/app/data")
        if not os.path.exists(data_path):
            data_path = "/"

        total, used, free = shutil.disk_usage(data_path)
        free_percent = (free / total) * 100

        status = "healthy"
        message = f"Free: {free_percent:.1f}% ({free // (1024**3)} GB)"

        if free_percent < 10:
            status = "unhealthy"
            message = f"CRITICAL: Only {free_percent:.1f}% free space"
        elif free_percent < 20:
            status = "degraded"
            message = f"WARNING: Only {free_percent:.1f}% free space"

        return ComponentHealth(
            name="disk",
            status=status,
            message=message,
            last_check=datetime.utcnow().isoformat()
        )
    except Exception as e:
        logger.error(f"Disk health check failed: {e}")
        return ComponentHealth(
            name="disk",
            status="unhealthy",
            message=str(e),
            last_check=datetime.utcnow().isoformat()
        )


async def check_templates() -> ComponentHealth:
    """Vérifie que les templates DOCX sont accessibles"""
    try:
        import os

        templates_path = os.environ.get("TEMPLATES_PATH", "/app/templates")

        if not os.path.exists(templates_path):
            return ComponentHealth(
                name="templates",
                status="degraded",
                message=f"Templates directory not found: {templates_path}",
                last_check=datetime.utcnow().isoformat()
            )

        # Compter les templates .docx
        docx_files = [f for f in os.listdir(templates_path) if f.endswith('.docx')]

        if len(docx_files) == 0:
            return ComponentHealth(
                name="templates",
                status="degraded",
                message="No DOCX templates found",
                last_check=datetime.utcnow().isoformat()
            )

        return ComponentHealth(
            name="templates",
            status="healthy",
            message=f"{len(docx_files)} template(s) available",
            last_check=datetime.utcnow().isoformat()
        )
    except Exception as e:
        logger.error(f"Templates health check failed: {e}")
        return ComponentHealth(
            name="templates",
            status="unhealthy",
            message=str(e),
            last_check=datetime.utcnow().isoformat()
        )


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check complet du système

    Vérifie:
    - Base de données PostgreSQL
    - Cache Redis
    - Espace disque
    - Templates DOCX

    Returns:
        HealthResponse avec le statut de chaque composant
    """
    from app.config import settings

    # Exécuter tous les checks en parallèle
    checks = await asyncio.gather(
        check_database(),
        check_redis(),
        check_disk_space(),
        check_templates(),
        return_exceptions=True
    )

    # Convertir les exceptions en ComponentHealth
    components = []
    for check in checks:
        if isinstance(check, Exception):
            components.append(ComponentHealth(
                name="unknown",
                status="unhealthy",
                message=str(check),
                last_check=datetime.utcnow().isoformat()
            ))
        else:
            components.append(check)

    # Déterminer le statut global
    statuses = [c.status for c in components]
    if "unhealthy" in statuses:
        overall_status = "unhealthy"
    elif "degraded" in statuses:
        overall_status = "degraded"
    else:
        overall_status = "healthy"

    # Calculer l'uptime
    uptime = (datetime.utcnow() - _start_time).total_seconds()

    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow().isoformat(),
        version=getattr(settings, "VERSION", "1.0.0"),
        environment=getattr(settings, "ENVIRONMENT", "development"),
        uptime_seconds=round(uptime, 2),
        components=components
    )


@router.get("/health/live")
async def liveness_probe():
    """
    Liveness probe pour Kubernetes

    Retourne 200 si l'application est vivante (processus actif)
    Utilisé par K8s pour redémarrer le pod si nécessaire
    """
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness_probe():
    """
    Readiness probe pour Kubernetes

    Retourne 200 si l'application est prête à recevoir du trafic
    Vérifie que la DB et Redis sont accessibles
    """
    db_health = await check_database()
    redis_health = await check_redis()

    if db_health.status == "unhealthy":
        return Response(
            content='{"status": "not ready", "reason": "database unavailable"}',
            status_code=503,
            media_type="application/json"
        )

    if redis_health.status == "unhealthy":
        return Response(
            content='{"status": "not ready", "reason": "redis unavailable"}',
            status_code=503,
            media_type="application/json"
        )

    return {"status": "ready"}


@router.get("/metrics")
async def prometheus_metrics():
    """
    Endpoint pour les métriques Prometheus

    Expose les métriques au format Prometheus pour scraping
    """
    return Response(
        content=get_metrics(),
        media_type=get_metrics_content_type()
    )
