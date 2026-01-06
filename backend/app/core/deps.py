"""
Dépendances FastAPI - Injection de dépendances pour l'API
Gestion de l'authentification et des permissions
"""

from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError
import uuid

from app.database import get_db
from app.core.security import decode_token
from app.core.redis_client import is_token_blacklisted
from app.models.user import User
from app.models.audit_log import AuditLog, AuditAction


# ==========================================
# SECURITY SCHEME
# ==========================================

# Bearer token pour l'authentification
security = HTTPBearer()


# ==========================================
# DATABASE DEPENDENCY
# ==========================================

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Fournit une session de base de données
    Alias pour get_db pour clarté
    """
    async for session in get_db():
        yield session


# ==========================================
# AUTHENTICATION DEPENDENCIES
# ==========================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_session)
) -> User:
    """
    Récupère l'utilisateur actuel depuis le token JWT
    
    Args:
        credentials: Token Bearer depuis le header Authorization
        db: Session de base de données
        
    Returns:
        User authentifié
        
    Raises:
        HTTPException 401 si token invalide
        HTTPException 403 si utilisateur inactif
    """
    # Extraire le token
    token = credentials.credentials

    # Vérifier si le token est dans la blacklist
    if await is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token révoqué - veuillez vous reconnecter",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Décoder le token
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier le type de token
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Type de token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Récupérer l'ID utilisateur
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convertir en UUID
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID utilisateur invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Récupérer l'utilisateur depuis la BDD
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier que le compte est actif
    if not user.actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur désactivé"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Vérifie que l'utilisateur est actif
    
    Args:
        current_user: Utilisateur authentifié
        
    Returns:
        User actif
        
    Raises:
        HTTPException 403 si compte inactif
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur inactif"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Vérifie que l'utilisateur est un administrateur
    
    Args:
        current_user: Utilisateur authentifié et actif
        
    Returns:
        User admin
        
    Raises:
        HTTPException 403 si pas admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privilèges administrateur requis"
        )
    return current_user


# ==========================================
# AUDIT LOGGING DEPENDENCY
# ==========================================

async def log_audit_action(
    request: Request,
    user: User,
    action: str,
    entity_type: str,
    entity_id: Optional[uuid.UUID] = None,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
    db: AsyncSession = Depends(get_session)
) -> None:
    """
    Enregistre une action dans l'audit log
    
    Args:
        request: Request FastAPI pour IP et user agent
        user: Utilisateur effectuant l'action
        action: Type d'action (CREATE, UPDATE, DELETE, etc.)
        entity_type: Type d'entité concernée
        entity_id: ID de l'entité
        old_values: Valeurs avant modification
        new_values: Nouvelles valeurs
        db: Session de base de données
    """
    # Récupérer IP et User-Agent
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent", "Unknown")
    
    # Créer le log
    audit_log = AuditLog(
        user_id=user.id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(audit_log)
    await db.commit()