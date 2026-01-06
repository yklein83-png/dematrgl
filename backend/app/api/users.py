"""
API Routes pour les utilisateurs
Gestion des conseillers et admins
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_session, get_current_active_user, get_current_admin_user
from app.crud.user import crud_user
from app.schemas.user import (
    UserCreate, UserUpdate, UserResponse, UserUpdatePassword
)
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog, AuditAction

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
) -> UserResponse:
    """
    Récupérer les informations de l'utilisateur connecté
    
    Args:
        current_user: Utilisateur authentifié
        
    Returns:
        Informations de l'utilisateur
    """
    return UserResponse.from_orm(current_user)


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    only_active: bool = False,
    role: Optional[UserRole] = None,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_session)
) -> List[UserResponse]:
    """
    Liste des utilisateurs (admin uniquement)
    
    Args:
        skip: Offset pagination
        limit: Nombre max de résultats
        only_active: Filtrer uniquement les actifs
        role: Filtrer par rôle
        current_user: Admin authentifié
        db: Session database
        
    Returns:
        Liste des utilisateurs
    """
    users = await crud_user.get_multi(
        db,
        skip=skip,
        limit=limit,
        only_active=only_active,
        role=role.value if role else None
    )
    
    return [UserResponse.from_orm(user) for user in users]


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    request: Request,
    user_in: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_session)
) -> UserResponse:
    """
    Créer un nouvel utilisateur (admin uniquement)
    
    Args:
        user_in: Données du nouvel utilisateur
        current_user: Admin authentifié
        db: Session database
        
    Returns:
        Utilisateur créé
        
    Raises:
        400: Email déjà utilisé
    """
    # Vérifier que l'email n'existe pas
    existing_user = await crud_user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    # Créer l'utilisateur
    user = await crud_user.create(db, obj_in=user_in)
    
    # Log création
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.CREATE.value,
        entity_type="user",
        entity_id=user.id,
        new_values={"email": user.email, "role": user.role},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return UserResponse.from_orm(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    request: Request,
    user_id: UUID,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_session)
) -> UserResponse:
    """
    Mettre à jour un utilisateur (admin uniquement)
    
    Args:
        user_id: ID de l'utilisateur
        user_in: Données de mise à jour
        current_user: Admin authentifié
        db: Session database
        
    Returns:
        Utilisateur mis à jour
        
    Raises:
        404: Utilisateur non trouvé
        400: Email déjà utilisé
    """
    # Récupérer l'utilisateur
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Si changement d'email, vérifier qu'il n'existe pas
    if user_in.email and user_in.email != user.email:
        existing = await crud_user.get_by_email(db, email=user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email déjà utilisé"
            )
    
    # Sauvegarder anciennes valeurs
    old_values = user.to_dict()
    
    # Mettre à jour
    user = await crud_user.update(db, db_obj=user, obj_in=user_in)
    
    # Log mise à jour
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.UPDATE.value,
        entity_type="user",
        entity_id=user_id,
        old_values=old_values,
        new_values=user.to_dict(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return UserResponse.from_orm(user)


@router.post("/change-password")
async def change_password(
    request: Request,
    password_update: UserUpdatePassword,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Changer son propre mot de passe
    
    Args:
        password_update: Ancien et nouveau mot de passe
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Confirmation de changement
        
    Raises:
        400: Ancien mot de passe incorrect
    """
    # Vérifier l'ancien mot de passe
    from app.core.security import verify_password
    if not verify_password(password_update.ancien_mot_de_passe, current_user.mot_de_passe_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ancien mot de passe incorrect"
        )
    
    # Mettre à jour le mot de passe
    await crud_user.update_password(
        db,
        user=current_user,
        new_password=password_update.nouveau_mot_de_passe
    )
    
    # Log changement
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action="CHANGE_PASSWORD",
        entity_type="user",
        entity_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return {"message": "Mot de passe modifié avec succès"}


@router.delete("/{user_id}")
async def delete_user(
    request: Request,
    user_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Désactiver un utilisateur (admin uniquement)
    
    Args:
        user_id: ID de l'utilisateur
        current_user: Admin authentifié
        db: Session database
        
    Returns:
        Confirmation de désactivation
        
    Raises:
        404: Utilisateur non trouvé
        400: Tentative de self-delete
    """
    # Empêcher l'auto-suppression
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de désactiver son propre compte"
        )
    
    # Soft delete
    deleted = await crud_user.delete(db, id=user_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Log désactivation
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.DELETE.value,
        entity_type="user",
        entity_id=user_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return {"message": "Utilisateur désactivé avec succès"}