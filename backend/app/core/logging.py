"""
Configuration du logging structuré (JSON)
Pour une meilleure intégration avec les outils de monitoring (ELK, Datadog, etc.)
"""

import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict, Optional
from functools import wraps
import time
import traceback

from pydantic import BaseModel


class LogRecord(BaseModel):
    """Structure d'un log JSON"""
    timestamp: str
    level: str
    logger: str
    message: str
    module: Optional[str] = None
    function: Optional[str] = None
    line: Optional[int] = None
    request_id: Optional[str] = None
    user_id: Optional[str] = None
    client_id: Optional[str] = None
    duration_ms: Optional[float] = None
    error: Optional[str] = None
    traceback: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None


class JSONFormatter(logging.Formatter):
    """Formateur JSON pour les logs"""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Ajouter les attributs personnalisés
        for attr in ["request_id", "user_id", "client_id", "duration_ms"]:
            if hasattr(record, attr):
                log_data[attr] = getattr(record, attr)

        # Ajouter les extra data
        if hasattr(record, "extra_data") and record.extra_data:
            log_data["extra"] = record.extra_data

        # Ajouter l'exception si présente
        if record.exc_info:
            log_data["error"] = str(record.exc_info[1])
            log_data["traceback"] = "".join(traceback.format_exception(*record.exc_info))

        return json.dumps(log_data, ensure_ascii=False, default=str)


class StructuredLogger:
    """Logger avec support pour les données structurées"""

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self._context: Dict[str, Any] = {}

    def _log(self, level: int, message: str, **kwargs):
        """Log avec données structurées"""
        extra = {
            **self._context,
            "extra_data": kwargs.get("extra"),
        }

        # Ajouter les champs connus au record
        for key in ["request_id", "user_id", "client_id", "duration_ms"]:
            if key in kwargs:
                extra[key] = kwargs[key]

        self.logger.log(level, message, extra=extra, exc_info=kwargs.get("exc_info"))

    def debug(self, message: str, **kwargs):
        self._log(logging.DEBUG, message, **kwargs)

    def info(self, message: str, **kwargs):
        self._log(logging.INFO, message, **kwargs)

    def warning(self, message: str, **kwargs):
        self._log(logging.WARNING, message, **kwargs)

    def error(self, message: str, **kwargs):
        self._log(logging.ERROR, message, **kwargs)

    def critical(self, message: str, **kwargs):
        self._log(logging.CRITICAL, message, **kwargs)

    def exception(self, message: str, **kwargs):
        self._log(logging.ERROR, message, exc_info=True, **kwargs)

    def bind(self, **kwargs) -> "StructuredLogger":
        """Créer un nouveau logger avec contexte additionnel"""
        new_logger = StructuredLogger(self.logger.name)
        new_logger._context = {**self._context, **kwargs}
        return new_logger


def setup_logging(
    level: str = "INFO",
    json_format: bool = True,
    log_file: Optional[str] = None
) -> None:
    """
    Configure le logging pour l'application

    Args:
        level: Niveau de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_format: Si True, utilise le format JSON
        log_file: Chemin vers un fichier de log (optionnel)
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))

    # Supprimer les handlers existants
    root_logger.handlers.clear()

    # Créer le formatter
    if json_format:
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )

    # Handler console
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Handler fichier (optionnel)
    if log_file:
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    # Réduire le bruit des loggers tiers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> StructuredLogger:
    """Obtenir un logger structuré"""
    return StructuredLogger(name)


# Décorateur pour logger les appels de fonction avec timing
def log_execution(logger: Optional[StructuredLogger] = None):
    """
    Décorateur pour logger l'exécution d'une fonction avec son temps d'exécution

    Usage:
        @log_execution()
        async def my_function():
            ...
    """
    def decorator(func):
        nonlocal logger
        if logger is None:
            logger = get_logger(func.__module__)

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                duration = (time.perf_counter() - start) * 1000
                logger.info(
                    f"{func.__name__} completed",
                    duration_ms=round(duration, 2),
                    extra={"args_count": len(args), "kwargs_keys": list(kwargs.keys())}
                )
                return result
            except Exception as e:
                duration = (time.perf_counter() - start) * 1000
                logger.exception(
                    f"{func.__name__} failed: {str(e)}",
                    duration_ms=round(duration, 2)
                )
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                duration = (time.perf_counter() - start) * 1000
                logger.info(
                    f"{func.__name__} completed",
                    duration_ms=round(duration, 2)
                )
                return result
            except Exception as e:
                duration = (time.perf_counter() - start) * 1000
                logger.exception(
                    f"{func.__name__} failed: {str(e)}",
                    duration_ms=round(duration, 2)
                )
                raise

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# Logger par défaut pour l'application
app_logger = get_logger("fare_epargne")
