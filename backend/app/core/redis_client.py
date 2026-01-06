"""
Client Redis pour la gestion du cache et de la blacklist des tokens
"""

import redis.asyncio as redis
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Instance Redis globale (initialisée au démarrage)
_redis_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """
    Retourne le client Redis singleton

    Returns:
        Client Redis connecté
    """
    global _redis_client

    if _redis_client is None:
        _redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )

    return _redis_client


async def close_redis() -> None:
    """Ferme la connexion Redis"""
    global _redis_client

    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None


# ==========================================
# TOKEN BLACKLIST
# ==========================================

# Préfixe pour les clés de blacklist
BLACKLIST_PREFIX = "token_blacklist:"


async def blacklist_token(token: str, expires_in: int) -> bool:
    """
    Ajoute un token à la blacklist Redis

    Args:
        token: Token JWT à blacklister
        expires_in: Durée de vie en secondes (doit correspondre à l'expiration du token)

    Returns:
        True si ajouté avec succès
    """
    try:
        client = await get_redis()
        key = f"{BLACKLIST_PREFIX}{token}"

        # Stocker le token avec expiration automatique
        await client.setex(key, expires_in, "blacklisted")

        logger.info(f"Token blacklisté pour {expires_in}s")
        return True

    except Exception as e:
        logger.error(f"Erreur lors du blacklist du token: {e}")
        return False


async def is_token_blacklisted(token: str) -> bool:
    """
    Vérifie si un token est dans la blacklist

    Args:
        token: Token JWT à vérifier

    Returns:
        True si le token est blacklisté
    """
    try:
        client = await get_redis()
        key = f"{BLACKLIST_PREFIX}{token}"

        result = await client.exists(key)
        return result > 0

    except Exception as e:
        logger.error(f"Erreur lors de la vérification blacklist: {e}")
        # En cas d'erreur Redis, on refuse le token par sécurité
        return True


async def get_blacklist_count() -> int:
    """
    Compte le nombre de tokens dans la blacklist

    Returns:
        Nombre de tokens blacklistés
    """
    try:
        client = await get_redis()
        keys = await client.keys(f"{BLACKLIST_PREFIX}*")
        return len(keys)

    except Exception as e:
        logger.error(f"Erreur lors du comptage blacklist: {e}")
        return 0


# ==========================================
# CACHE GENERAL
# ==========================================

CACHE_PREFIX = "cache:"


async def cache_set(key: str, value: str, expires_in: int = None) -> bool:
    """
    Stocke une valeur dans le cache

    Args:
        key: Clé de cache
        value: Valeur à stocker
        expires_in: Durée de vie en secondes (défaut: REDIS_TTL_SECONDS)

    Returns:
        True si stocké avec succès
    """
    try:
        client = await get_redis()
        full_key = f"{CACHE_PREFIX}{key}"

        if expires_in is None:
            expires_in = settings.REDIS_TTL_SECONDS

        await client.setex(full_key, expires_in, value)
        return True

    except Exception as e:
        logger.error(f"Erreur cache_set: {e}")
        return False


async def cache_get(key: str) -> Optional[str]:
    """
    Récupère une valeur du cache

    Args:
        key: Clé de cache

    Returns:
        Valeur ou None si non trouvée
    """
    try:
        client = await get_redis()
        full_key = f"{CACHE_PREFIX}{key}"

        return await client.get(full_key)

    except Exception as e:
        logger.error(f"Erreur cache_get: {e}")
        return None


async def cache_delete(key: str) -> bool:
    """
    Supprime une valeur du cache

    Args:
        key: Clé de cache

    Returns:
        True si supprimée
    """
    try:
        client = await get_redis()
        full_key = f"{CACHE_PREFIX}{key}"

        await client.delete(full_key)
        return True

    except Exception as e:
        logger.error(f"Erreur cache_delete: {e}")
        return False


# ==========================================
# RATE LIMITING (backup côté application)
# ==========================================

RATE_LIMIT_PREFIX = "rate_limit:"


async def check_rate_limit(identifier: str, max_requests: int, window_seconds: int) -> tuple[bool, int]:
    """
    Vérifie et incrémente le compteur de rate limiting

    Args:
        identifier: Identifiant unique (IP, user_id, etc.)
        max_requests: Nombre max de requêtes autorisées
        window_seconds: Fenêtre de temps en secondes

    Returns:
        (autorisé, requêtes_restantes)
    """
    try:
        client = await get_redis()
        key = f"{RATE_LIMIT_PREFIX}{identifier}"

        # Incrémenter le compteur
        current = await client.incr(key)

        # Si c'est la première requête, définir l'expiration
        if current == 1:
            await client.expire(key, window_seconds)

        # Vérifier si la limite est atteinte
        remaining = max(0, max_requests - current)
        allowed = current <= max_requests

        return allowed, remaining

    except Exception as e:
        logger.error(f"Erreur rate_limit: {e}")
        # En cas d'erreur, on autorise mais log
        return True, max_requests
