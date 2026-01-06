"""
API Routes pour l'authentification
Login, logout, refresh token, gestion des sessions
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_session
from app.core.security import create_access_token, create_refresh_token, decode_token, verify_password
from app.core.redis_client import blacklist_token
from app.crud.user import crud_user
from app.schemas.user import UserLogin, TokenResponse, RefreshTokenRequest, UserResponse
from app.models.audit_log import AuditLog, AuditAction
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_session)
) -> TokenResponse:
    """
    Endpoint de connexion
    
    Args:
        credentials: Email et mot de passe
        db: Session database
        
    Returns:
        Access token, refresh token et infos utilisateur
        
    Raises:
        401: Identifiants invalides
        403: Compte désactivé
    """
    # Authentifier l'utilisateur
    user = await crud_user.authenticate(
        db,
        email=credentials.email,
        password=credentials.mot_de_passe
    )
    
    if not user:
        # Log échec de connexion
        await AuditLog.log_action(
            db,
            user_id=None,
            action=AuditAction.LOGIN.value,
            entity_type="auth",
            entity_id=None,
            new_values={"email": credentials.email, "success": False},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent", "Unknown")
        )
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if not user.actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur désactivé"
        )
    
    # Créer les tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    # Log connexion réussie
    await AuditLog.log_action(
        db,
        user_id=user.id,
        action=AuditAction.LOGIN.value,
        entity_type="auth",
        entity_id=user.id,
        new_values={"success": True},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent", "Unknown")
    )
    await db.commit()
    
    # Préparer la réponse
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            email=user.email,
            nom=user.nom,
            prenom=user.prenom,
            nom_complet=user.nom_complet,
            role=user.role,
            actif=user.actif,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_session)
) -> TokenResponse:
    """
    Rafraîchir l'access token avec le refresh token
    
    Args:
        refresh_request: Refresh token
        db: Session database
        
    Returns:
        Nouveaux tokens
        
    Raises:
        401: Refresh token invalide
    """
    # Décoder le refresh token
    payload = decode_token(refresh_request.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalide"
        )
    
    # Récupérer l'utilisateur
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    try:
        user = await crud_user.get(db, id=user_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé"
        )
    
    if not user or not user.actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur invalide ou désactivé"
        )
    
    # Créer nouveaux tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            email=user.email,
            nom=user.nom,
            prenom=user.prenom,
            nom_complet=user.nom_complet,
            role=user.role,
            actif=user.actif,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    )


@router.post("/logout")
async def logout(
    request: Request,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(security)
) -> dict:
    """
    Déconnexion - Révoque le token en l'ajoutant à la blacklist Redis

    Args:
        request: Request FastAPI
        db: Session database
        token: Token Bearer

    Returns:
        Message de confirmation
    """
    # Décoder le token pour récupérer l'utilisateur et l'expiration
    payload = decode_token(token.credentials)

    if payload:
        user_id = payload.get("sub")

        # Calculer le temps restant jusqu'à l'expiration du token
        exp = payload.get("exp")
        if exp:
            import time
            remaining_time = max(0, int(exp - time.time()))

            # Blacklister le token pour le temps restant
            await blacklist_token(token.credentials, remaining_time)

        if user_id:
            try:
                # Log déconnexion
                await AuditLog.log_action(
                    db,
                    user_id=user_id,
                    action=AuditAction.LOGOUT.value,
                    entity_type="auth",
                    entity_id=user_id,
                    new_values={"token_blacklisted": True},
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("User-Agent", "Unknown")
                )
                await db.commit()
            except Exception:
                pass

    return {"message": "Déconnexion réussie", "token_revoked": True}