"""
Métriques Prometheus pour le monitoring de l'application
"""

from typing import Callable, Optional
from functools import wraps
import time

# Note: prometheus_client doit être ajouté aux requirements.txt
# pip install prometheus-client

try:
    from prometheus_client import Counter, Histogram, Gauge, Info, generate_latest, CONTENT_TYPE_LATEST
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    # Stubs si prometheus_client n'est pas installé
    class DummyMetric:
        def labels(self, *args, **kwargs): return self
        def inc(self, *args, **kwargs): pass
        def dec(self, *args, **kwargs): pass
        def set(self, *args, **kwargs): pass
        def observe(self, *args, **kwargs): pass
        def info(self, *args, **kwargs): pass

    Counter = Histogram = Gauge = Info = lambda *args, **kwargs: DummyMetric()
    generate_latest = lambda: b""
    CONTENT_TYPE_LATEST = "text/plain"


# ==========================================
# MÉTRIQUES HTTP
# ==========================================

http_requests_total = Counter(
    "http_requests_total",
    "Total des requêtes HTTP",
    ["method", "endpoint", "status"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "Durée des requêtes HTTP en secondes",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

http_requests_in_progress = Gauge(
    "http_requests_in_progress",
    "Nombre de requêtes HTTP en cours",
    ["method", "endpoint"]
)


# ==========================================
# MÉTRIQUES BASE DE DONNÉES
# ==========================================

db_query_duration_seconds = Histogram(
    "db_query_duration_seconds",
    "Durée des requêtes SQL en secondes",
    ["operation", "table"],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]
)

db_connections_active = Gauge(
    "db_connections_active",
    "Nombre de connexions DB actives"
)

db_connections_pool_size = Gauge(
    "db_connections_pool_size",
    "Taille du pool de connexions DB"
)


# ==========================================
# MÉTRIQUES REDIS
# ==========================================

redis_operations_total = Counter(
    "redis_operations_total",
    "Total des opérations Redis",
    ["operation", "status"]
)

redis_operation_duration_seconds = Histogram(
    "redis_operation_duration_seconds",
    "Durée des opérations Redis en secondes",
    ["operation"],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1]
)


# ==========================================
# MÉTRIQUES MÉTIER
# ==========================================

clients_total = Gauge(
    "clients_total",
    "Nombre total de clients",
    ["statut"]
)

documents_generated_total = Counter(
    "documents_generated_total",
    "Total des documents générés",
    ["type_document", "status"]
)

document_generation_duration_seconds = Histogram(
    "document_generation_duration_seconds",
    "Durée de génération des documents en secondes",
    ["type_document"],
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]
)

auth_attempts_total = Counter(
    "auth_attempts_total",
    "Total des tentatives d'authentification",
    ["status", "reason"]
)

active_users = Gauge(
    "active_users",
    "Nombre d'utilisateurs actifs (sessions)"
)


# ==========================================
# MÉTRIQUES SYSTÈME
# ==========================================

app_info = Info(
    "app",
    "Informations sur l'application"
)


# ==========================================
# HELPERS ET DÉCORATEURS
# ==========================================

def track_request_metrics(method: str, endpoint: str):
    """
    Décorateur pour tracker les métriques d'une requête HTTP

    Usage:
        @track_request_metrics("GET", "/api/clients")
        async def get_clients():
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            http_requests_in_progress.labels(method=method, endpoint=endpoint).inc()
            start_time = time.perf_counter()

            try:
                result = await func(*args, **kwargs)
                status = "2xx"
                return result
            except Exception as e:
                status = "5xx"
                raise
            finally:
                duration = time.perf_counter() - start_time
                http_requests_total.labels(method=method, endpoint=endpoint, status=status).inc()
                http_request_duration_seconds.labels(method=method, endpoint=endpoint).observe(duration)
                http_requests_in_progress.labels(method=method, endpoint=endpoint).dec()

        return wrapper
    return decorator


def track_db_query(operation: str, table: str):
    """
    Context manager pour tracker les requêtes DB

    Usage:
        with track_db_query("SELECT", "clients"):
            result = await db.execute(query)
    """
    class DBQueryTracker:
        def __init__(self):
            self.start_time = None

        def __enter__(self):
            self.start_time = time.perf_counter()
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            duration = time.perf_counter() - self.start_time
            db_query_duration_seconds.labels(operation=operation, table=table).observe(duration)

    return DBQueryTracker()


def track_redis_operation(operation: str):
    """
    Context manager pour tracker les opérations Redis

    Usage:
        with track_redis_operation("GET"):
            result = await redis.get(key)
    """
    class RedisOperationTracker:
        def __init__(self):
            self.start_time = None

        def __enter__(self):
            self.start_time = time.perf_counter()
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            duration = time.perf_counter() - self.start_time
            status = "error" if exc_type else "success"
            redis_operations_total.labels(operation=operation, status=status).inc()
            redis_operation_duration_seconds.labels(operation=operation).observe(duration)

    return RedisOperationTracker()


def set_app_info(version: str, environment: str, commit_sha: Optional[str] = None):
    """Définir les informations de l'application"""
    info_dict = {
        "version": version,
        "environment": environment,
    }
    if commit_sha:
        info_dict["commit_sha"] = commit_sha

    app_info.info(info_dict)


def get_metrics() -> bytes:
    """Retourner les métriques au format Prometheus"""
    if not PROMETHEUS_AVAILABLE:
        return b"# prometheus_client not installed\n"
    return generate_latest()


def get_metrics_content_type() -> str:
    """Retourner le content-type pour les métriques"""
    return CONTENT_TYPE_LATEST
