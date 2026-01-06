"""
Configuration Sentry pour le tracking des erreurs
"""

import os
from typing import Optional, Dict, Any

from app.core.logging import get_logger

logger = get_logger(__name__)

# Flag pour vérifier si Sentry est disponible
SENTRY_AVAILABLE = False

try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    logger.warning("sentry-sdk not installed. Error tracking disabled.")


def init_sentry(
    dsn: Optional[str] = None,
    environment: str = "development",
    release: Optional[str] = None,
    traces_sample_rate: float = 0.1,
    profiles_sample_rate: float = 0.1,
) -> bool:
    """
    Initialise Sentry pour le tracking des erreurs

    Args:
        dsn: Sentry DSN (Data Source Name). Si None, utilise SENTRY_DSN env var
        environment: Environnement (development, staging, production)
        release: Version de l'application
        traces_sample_rate: Taux d'échantillonnage des traces (0.0 à 1.0)
        profiles_sample_rate: Taux d'échantillonnage des profils (0.0 à 1.0)

    Returns:
        True si Sentry a été initialisé avec succès, False sinon
    """
    if not SENTRY_AVAILABLE:
        logger.info("Sentry SDK not available, skipping initialization")
        return False

    # Récupérer le DSN depuis les variables d'environnement si non fourni
    sentry_dsn = dsn or os.environ.get("SENTRY_DSN")

    if not sentry_dsn:
        logger.info("No Sentry DSN configured, error tracking disabled")
        return False

    try:
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=environment,
            release=release,
            traces_sample_rate=traces_sample_rate,
            profiles_sample_rate=profiles_sample_rate,

            # Intégrations
            integrations=[
                FastApiIntegration(
                    transaction_style="endpoint"
                ),
                SqlalchemyIntegration(),
                RedisIntegration(),
                LoggingIntegration(
                    level=None,  # Ne pas capturer les logs comme breadcrumbs
                    event_level=None  # Ne pas créer d'events pour les logs
                ),
            ],

            # Configuration additionnelle
            send_default_pii=False,  # Ne pas envoyer de données personnelles
            attach_stacktrace=True,
            max_breadcrumbs=50,

            # Filtrer les erreurs non importantes
            before_send=filter_events,

            # Filtrer les transactions (performance)
            before_send_transaction=filter_transactions,
        )

        logger.info(f"Sentry initialized for environment: {environment}")
        return True

    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")
        return False


def filter_events(event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Filtre les événements avant envoi à Sentry

    Permet d'exclure certaines erreurs ou de modifier les événements
    """
    # Récupérer l'exception si disponible
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]

        # Ignorer certaines erreurs communes non critiques
        ignored_exceptions = [
            "ConnectionResetError",
            "BrokenPipeError",
            "asyncio.CancelledError",
        ]

        if exc_type.__name__ in ignored_exceptions:
            return None

        # Ignorer les erreurs 404
        if hasattr(exc_value, "status_code") and exc_value.status_code == 404:
            return None

    # Supprimer les données sensibles
    if "request" in event:
        request = event["request"]

        # Supprimer les headers sensibles
        if "headers" in request:
            sensitive_headers = ["authorization", "cookie", "x-api-key"]
            request["headers"] = {
                k: "[FILTERED]" if k.lower() in sensitive_headers else v
                for k, v in request["headers"].items()
            }

        # Supprimer les données de formulaire sensibles
        if "data" in request and isinstance(request["data"], dict):
            sensitive_fields = ["password", "mot_de_passe", "token", "secret"]
            request["data"] = {
                k: "[FILTERED]" if any(s in k.lower() for s in sensitive_fields) else v
                for k, v in request["data"].items()
            }

    return event


def filter_transactions(event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Filtre les transactions de performance avant envoi à Sentry

    Permet d'exclure certains endpoints du monitoring de performance
    """
    # Ignorer les endpoints de health check et metrics
    transaction_name = event.get("transaction", "")
    ignored_endpoints = [
        "/health",
        "/health/live",
        "/health/ready",
        "/metrics",
        "/docs",
        "/redoc",
        "/openapi.json",
    ]

    for endpoint in ignored_endpoints:
        if transaction_name.endswith(endpoint):
            return None

    return event


def capture_exception(exception: Exception, **kwargs) -> Optional[str]:
    """
    Capture une exception et l'envoie à Sentry

    Args:
        exception: L'exception à capturer
        **kwargs: Données additionnelles (tags, extra, etc.)

    Returns:
        L'ID de l'événement Sentry ou None si non disponible
    """
    if not SENTRY_AVAILABLE:
        return None

    try:
        with sentry_sdk.push_scope() as scope:
            # Ajouter les tags
            if "tags" in kwargs:
                for key, value in kwargs["tags"].items():
                    scope.set_tag(key, value)

            # Ajouter les données extra
            if "extra" in kwargs:
                for key, value in kwargs["extra"].items():
                    scope.set_extra(key, value)

            # Ajouter le contexte utilisateur
            if "user" in kwargs:
                scope.set_user(kwargs["user"])

            return sentry_sdk.capture_exception(exception)
    except Exception as e:
        logger.error(f"Failed to capture exception in Sentry: {e}")
        return None


def capture_message(message: str, level: str = "info", **kwargs) -> Optional[str]:
    """
    Capture un message et l'envoie à Sentry

    Args:
        message: Le message à capturer
        level: Niveau du message (debug, info, warning, error, fatal)
        **kwargs: Données additionnelles

    Returns:
        L'ID de l'événement Sentry ou None si non disponible
    """
    if not SENTRY_AVAILABLE:
        return None

    try:
        with sentry_sdk.push_scope() as scope:
            if "tags" in kwargs:
                for key, value in kwargs["tags"].items():
                    scope.set_tag(key, value)

            if "extra" in kwargs:
                for key, value in kwargs["extra"].items():
                    scope.set_extra(key, value)

            return sentry_sdk.capture_message(message, level=level)
    except Exception as e:
        logger.error(f"Failed to capture message in Sentry: {e}")
        return None


def set_user_context(user_id: str, email: Optional[str] = None, role: Optional[str] = None):
    """
    Définit le contexte utilisateur pour les événements Sentry

    Args:
        user_id: ID de l'utilisateur
        email: Email de l'utilisateur (optionnel)
        role: Rôle de l'utilisateur (optionnel)
    """
    if not SENTRY_AVAILABLE:
        return

    try:
        sentry_sdk.set_user({
            "id": user_id,
            "email": email,
            "role": role,
        })
    except Exception as e:
        logger.error(f"Failed to set user context in Sentry: {e}")


def clear_user_context():
    """Efface le contexte utilisateur"""
    if not SENTRY_AVAILABLE:
        return

    try:
        sentry_sdk.set_user(None)
    except Exception as e:
        logger.error(f"Failed to clear user context in Sentry: {e}")
