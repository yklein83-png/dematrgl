"""
Système de cache Redis avancé pour les requêtes fréquentes

Fonctionnalités:
- Décorateur de cache automatique
- Invalidation intelligente par pattern
- Cache par utilisateur (conseiller)
- Statistiques de cache
"""

import json
import hashlib
from functools import wraps
from typing import Optional, Any, Callable, TypeVar, Union
from datetime import datetime

from app.core.redis_client import get_redis, CACHE_PREFIX
from app.core.logging import get_logger

logger = get_logger(__name__)

# Type générique pour les fonctions décorées
F = TypeVar('F', bound=Callable[..., Any])


# ==========================================
# PRÉFIXES DE CACHE PAR DOMAINE
# ==========================================

class CacheKeys:
    """Préfixes de clés de cache par domaine métier"""

    # Dashboard et statistiques
    DASHBOARD = "dashboard:"
    STATS = "stats:"

    # Clients
    CLIENT = "client:"
    CLIENT_LIST = "client_list:"
    CLIENT_SEARCH = "client_search:"

    # Documents
    DOCUMENT = "document:"
    DOCUMENT_LIST = "document_list:"

    # Utilisateurs
    USER = "user:"
    USER_PERMISSIONS = "user_perms:"


# ==========================================
# TTL PAR TYPE DE DONNÉES
# ==========================================

class CacheTTL:
    """Durées de vie du cache en secondes"""

    # Courte durée - données qui changent souvent
    SHORT = 60  # 1 minute

    # Durée moyenne - listes, recherches
    MEDIUM = 300  # 5 minutes

    # Longue durée - données stables
    LONG = 3600  # 1 heure

    # Très longue durée - données quasi-statiques
    VERY_LONG = 86400  # 24 heures

    # Par défaut
    DEFAULT = MEDIUM


# ==========================================
# FONCTIONS DE CACHE DE BASE
# ==========================================

def _make_key(*args, **kwargs) -> str:
    """
    Génère une clé de cache unique à partir des arguments

    Returns:
        Hash MD5 des arguments sérialisés
    """
    # Sérialiser les arguments
    key_parts = []

    for arg in args:
        if hasattr(arg, 'id'):
            # Objets avec ID (User, Client, etc.)
            key_parts.append(f"{type(arg).__name__}:{arg.id}")
        elif hasattr(arg, '__dict__'):
            # Objets complexes
            key_parts.append(str(type(arg).__name__))
        else:
            key_parts.append(str(arg))

    for k, v in sorted(kwargs.items()):
        if v is not None:
            key_parts.append(f"{k}={v}")

    # Créer un hash pour les longues clés
    key_str = ":".join(key_parts)
    if len(key_str) > 100:
        key_str = hashlib.md5(key_str.encode()).hexdigest()

    return key_str


async def cache_get_json(key: str) -> Optional[Any]:
    """
    Récupère une valeur JSON du cache

    Args:
        key: Clé de cache complète

    Returns:
        Données désérialisées ou None
    """
    try:
        client = await get_redis()
        full_key = f"{CACHE_PREFIX}{key}"

        data = await client.get(full_key)
        if data:
            return json.loads(data)
        return None

    except json.JSONDecodeError as e:
        logger.warning(f"Cache JSON invalide pour {key}: {e}")
        return None
    except Exception as e:
        logger.error(f"Erreur cache_get_json: {e}")
        return None


async def cache_set_json(
    key: str,
    value: Any,
    ttl: int = CacheTTL.DEFAULT
) -> bool:
    """
    Stocke une valeur JSON dans le cache

    Args:
        key: Clé de cache
        value: Données à stocker (sérialisables en JSON)
        ttl: Durée de vie en secondes

    Returns:
        True si stocké avec succès
    """
    try:
        client = await get_redis()
        full_key = f"{CACHE_PREFIX}{key}"

        # Sérialiser avec support des dates
        data = json.dumps(value, default=str)
        await client.setex(full_key, ttl, data)

        logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
        return True

    except Exception as e:
        logger.error(f"Erreur cache_set_json: {e}")
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """
    Supprime toutes les clés correspondant à un pattern

    Args:
        pattern: Pattern de clé (ex: "client:*", "dashboard:user123:*")

    Returns:
        Nombre de clés supprimées
    """
    try:
        client = await get_redis()
        full_pattern = f"{CACHE_PREFIX}{pattern}"

        # Récupérer les clés correspondantes
        keys = await client.keys(full_pattern)

        if keys:
            deleted = await client.delete(*keys)
            logger.info(f"Cache invalidé: {pattern} ({deleted} clés)")
            return deleted

        return 0

    except Exception as e:
        logger.error(f"Erreur cache_delete_pattern: {e}")
        return 0


# ==========================================
# DÉCORATEUR DE CACHE
# ==========================================

def cached(
    prefix: str,
    ttl: int = CacheTTL.DEFAULT,
    key_builder: Optional[Callable[..., str]] = None,
    user_scoped: bool = False,
    skip_none: bool = True
):
    """
    Décorateur pour mettre en cache le résultat d'une fonction async

    Args:
        prefix: Préfixe de la clé de cache
        ttl: Durée de vie en secondes
        key_builder: Fonction personnalisée pour construire la clé
        user_scoped: Si True, inclut l'ID utilisateur dans la clé
        skip_none: Si True, ne cache pas les résultats None

    Usage:
        @cached(CacheKeys.DASHBOARD, ttl=CacheTTL.SHORT)
        async def get_dashboard_stats(user_id: str):
            ...

        @cached(CacheKeys.CLIENT, key_builder=lambda c: c.id)
        async def get_client(client_id: str):
            ...
    """
    def decorator(func: F) -> F:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Construire la clé de cache
            if key_builder:
                cache_key = f"{prefix}{key_builder(*args, **kwargs)}"
            else:
                cache_key = f"{prefix}{_make_key(*args, **kwargs)}"

            # Ajouter le scope utilisateur si demandé
            if user_scoped and 'current_user' in kwargs:
                user = kwargs['current_user']
                user_id = getattr(user, 'id', str(user))
                cache_key = f"{cache_key}:user:{user_id}"

            # Essayer de récupérer du cache
            cached_value = await cache_get_json(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return cached_value

            logger.debug(f"Cache MISS: {cache_key}")

            # Exécuter la fonction
            result = await func(*args, **kwargs)

            # Mettre en cache si résultat valide
            if result is not None or not skip_none:
                await cache_set_json(cache_key, result, ttl)

            return result

        # Ajouter une méthode pour invalider le cache de cette fonction
        wrapper.invalidate = lambda *args, **kwargs: cache_delete_pattern(
            f"{prefix}*"
        )

        return wrapper

    return decorator


# ==========================================
# INVALIDATION INTELLIGENTE
# ==========================================

class CacheInvalidator:
    """
    Gestionnaire d'invalidation de cache

    Invalide automatiquement les caches liés lors de modifications
    """

    @staticmethod
    async def on_client_change(client_id: str, conseiller_id: str):
        """
        Invalide les caches liés à un client

        Args:
            client_id: ID du client modifié
            conseiller_id: ID du conseiller propriétaire
        """
        patterns = [
            f"{CacheKeys.CLIENT}{client_id}*",
            f"{CacheKeys.CLIENT_LIST}*{conseiller_id}*",
            f"{CacheKeys.DASHBOARD}*{conseiller_id}*",
            f"{CacheKeys.STATS}*{conseiller_id}*",
        ]

        total = 0
        for pattern in patterns:
            total += await cache_delete_pattern(pattern)

        logger.info(f"Client {client_id} modifié: {total} caches invalidés")
        return total

    @staticmethod
    async def on_document_change(client_id: str, conseiller_id: str):
        """
        Invalide les caches liés à un document

        Args:
            client_id: ID du client concerné
            conseiller_id: ID du conseiller
        """
        patterns = [
            f"{CacheKeys.DOCUMENT}*{client_id}*",
            f"{CacheKeys.DOCUMENT_LIST}*{conseiller_id}*",
            f"{CacheKeys.CLIENT}{client_id}*",
        ]

        total = 0
        for pattern in patterns:
            total += await cache_delete_pattern(pattern)

        logger.info(f"Document modifié pour client {client_id}: {total} caches invalidés")
        return total

    @staticmethod
    async def on_user_change(user_id: str):
        """
        Invalide les caches liés à un utilisateur

        Args:
            user_id: ID de l'utilisateur modifié
        """
        patterns = [
            f"{CacheKeys.USER}{user_id}*",
            f"{CacheKeys.USER_PERMISSIONS}{user_id}*",
            f"{CacheKeys.DASHBOARD}*{user_id}*",
        ]

        total = 0
        for pattern in patterns:
            total += await cache_delete_pattern(pattern)

        logger.info(f"User {user_id} modifié: {total} caches invalidés")
        return total

    @staticmethod
    async def invalidate_all():
        """Invalide tout le cache (à utiliser avec précaution)"""
        count = await cache_delete_pattern("*")
        logger.warning(f"Cache complet invalidé: {count} clés supprimées")
        return count


# ==========================================
# STATISTIQUES DE CACHE
# ==========================================

async def get_cache_stats() -> dict:
    """
    Retourne les statistiques du cache Redis

    Returns:
        Dictionnaire avec les stats
    """
    try:
        client = await get_redis()

        # Compter les clés par préfixe
        stats = {
            "total_keys": 0,
            "by_prefix": {},
            "memory_used": None,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Compter par préfixe
        for prefix_name, prefix_value in vars(CacheKeys).items():
            if not prefix_name.startswith('_'):
                pattern = f"{CACHE_PREFIX}{prefix_value}*"
                keys = await client.keys(pattern)
                count = len(keys)
                if count > 0:
                    stats["by_prefix"][prefix_name] = count
                    stats["total_keys"] += count

        # Info mémoire Redis
        try:
            info = await client.info("memory")
            stats["memory_used"] = info.get("used_memory_human")
        except Exception:
            pass

        return stats

    except Exception as e:
        logger.error(f"Erreur get_cache_stats: {e}")
        return {"error": str(e)}


# ==========================================
# HELPERS POUR REQUÊTES FRÉQUENTES
# ==========================================

async def get_cached_client_count(conseiller_id: str) -> Optional[int]:
    """
    Récupère le nombre de clients d'un conseiller depuis le cache

    Args:
        conseiller_id: ID du conseiller

    Returns:
        Nombre de clients ou None si pas en cache
    """
    key = f"{CacheKeys.STATS}client_count:{conseiller_id}"
    return await cache_get_json(key)


async def set_cached_client_count(conseiller_id: str, count: int, ttl: int = CacheTTL.MEDIUM):
    """
    Met en cache le nombre de clients d'un conseiller

    Args:
        conseiller_id: ID du conseiller
        count: Nombre de clients
        ttl: Durée de vie
    """
    key = f"{CacheKeys.STATS}client_count:{conseiller_id}"
    await cache_set_json(key, count, ttl)


async def get_cached_dashboard(conseiller_id: str) -> Optional[dict]:
    """
    Récupère les données du dashboard depuis le cache

    Args:
        conseiller_id: ID du conseiller

    Returns:
        Données dashboard ou None
    """
    key = f"{CacheKeys.DASHBOARD}{conseiller_id}"
    return await cache_get_json(key)


async def set_cached_dashboard(conseiller_id: str, data: dict, ttl: int = CacheTTL.SHORT):
    """
    Met en cache les données du dashboard

    Args:
        conseiller_id: ID du conseiller
        data: Données du dashboard
        ttl: Durée de vie (défaut: 1 minute)
    """
    key = f"{CacheKeys.DASHBOARD}{conseiller_id}"
    await cache_set_json(key, data, ttl)
