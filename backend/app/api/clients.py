"""
API Routes pour les clients
CRUD complet avec 120+ champs
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_session, get_current_active_user, get_current_admin_user
from app.crud.client import crud_client
from app.crud.produit import crud_produit
from app.schemas.client import (
    ClientCreate, ClientUpdate, ClientResponse, ClientListResponse, ClientFormDataCreate
)
from app.schemas.produit import ProduitCreate, ProduitResponse
from app.models.user import User
from app.models.client import Client, ClientStatut
from app.models.audit_log import AuditLog, AuditAction
from app.services.risk_calculator import calculate_risk_profile
from app.services.lcb_ft_classifier import classify_lcb_ft_level

router = APIRouter()


@router.get("/", response_model=ClientListResponse)
async def list_clients(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    statut: Optional[ClientStatut] = None,
    search: Optional[str] = None,
    only_validated: bool = False,
    profil_risque: Optional[str] = None,
    lcb_ft_niveau: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> ClientListResponse:
    """
    Liste des clients avec filtres et pagination
    
    Args:
        skip: Offset pagination
        limit: Nombre max de résultats
        statut: Filtrer par statut
        search: Recherche textuelle
        only_validated: Uniquement les validés
        profil_risque: Filtrer par profil de risque
        lcb_ft_niveau: Filtrer par niveau LCB-FT
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Liste paginée de clients
    """
    # Admin voit tout, conseiller voit ses clients uniquement
    conseiller_id = None if current_user.is_admin else current_user.id
    
    # Récupérer les clients
    clients = await crud_client.get_multi(
        db,
        skip=skip,
        limit=limit,
        conseiller_id=conseiller_id,
        statut=statut,
        search=search,
        only_validated=only_validated,
        profil_risque=profil_risque,
        lcb_ft_niveau=lcb_ft_niveau
    )
    
    # Compter le total
    total = await crud_client.count(
        db,
        conseiller_id=conseiller_id,
        statut=statut
    )
    
    # Convertir en response
    clients_response = []
    for client in clients:
        clients_response.append(ClientResponse.from_orm(client))
    
    return ClientListResponse(
        total=total,
        page=skip // limit + 1,
        per_page=limit,
        clients=clients_response
    )


@router.get("/{client_id}")
async def get_client(
    client_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Récupérer un client par ID - retourne TOUTES les données du client

    Args:
        client_id: ID du client
        current_user: Utilisateur authentifié
        db: Session database

    Returns:
        Client détaillé avec tous les champs (colonnes SQL + form_data)

    Raises:
        404: Client non trouvé
        403: Accès non autorisé
    """
    # Récupérer le client avec relations
    client = await crud_client.get(db, id=client_id, load_relations=True)

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )

    # Vérifier les permissions
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce client"
        )

    # Retourner TOUTES les données du client (colonnes + form_data)
    return client.to_dict()


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    request: Request,
    client_in: ClientCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> ClientResponse:
    """
    Créer un nouveau client (120+ champs)
    
    Args:
        client_in: Données du client
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Client créé
    """
    # Créer le client
    client = await crud_client.create(
        db,
        obj_in=client_in,
        conseiller_id=current_user.id
    )
    
    # Calculer automatiquement le profil de risque
    profile = calculate_risk_profile(client)
    await crud_client.update_profil_risque(
        db,
        client_id=client.id,
        profil=profile["profil"],
        score=profile["score"]
    )
    
    # Classifier le niveau LCB-FT
    lcb_level = classify_lcb_ft_level(client)
    client.lcb_ft_niveau_risque = lcb_level
    await db.commit()
    
    # Log création
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.CREATE.value,
        entity_type="client",
        entity_id=client.id,
        new_values={"numero_client": client.numero_client},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    # Recharger avec les calculs
    client = await crud_client.get(db, id=client.id, load_relations=True)
    
    return ClientResponse.from_orm(client)


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    request: Request,
    client_id: UUID,
    client_in: ClientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> ClientResponse:
    """
    Mettre à jour un client
    
    Args:
        client_id: ID du client
        client_in: Données de mise à jour
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Client mis à jour
        
    Raises:
        404: Client non trouvé
        403: Accès non autorisé
    """
    # Récupérer le client
    client = await crud_client.get(db, id=client_id)
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    # Vérifier les permissions
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce client"
        )
    
    # Sauvegarder anciennes valeurs pour audit
    old_values = client.to_dict()
    
    # Mettre à jour
    client = await crud_client.update(
        db,
        db_obj=client,
        obj_in=client_in
    )
    
    # Recalculer le profil de risque si données modifiées
    if any(field in client_in.dict(exclude_unset=True) for field in [
        'objectifs_investissement', 'horizon_placement', 'tolerance_risque',
        'pertes_maximales_acceptables', 'experience_perte'
    ]):
        profile = calculate_risk_profile(client)
        await crud_client.update_profil_risque(
            db,
            client_id=client.id,
            profil=profile["profil"],
            score=profile["score"]
        )
    
    # Log mise à jour
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.UPDATE.value,
        entity_type="client",
        entity_id=client.id,
        old_values=old_values,
        new_values=client.to_dict(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()

    return ClientResponse.from_orm(client)


@router.patch("/{client_id}", response_model=ClientResponse)
async def partial_update_client(
    request: Request,
    client_id: UUID,
    client_in: ClientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> ClientResponse:
    """
    Mise à jour partielle d'un client (PATCH)

    Identique à PUT mais sémantiquement pour les mises à jour partielles.
    """
    # Récupérer le client
    client = await crud_client.get(db, id=client_id)

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )

    # Vérifier les permissions
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce client"
        )

    # Sauvegarder anciennes valeurs pour audit
    old_values = client.to_dict()

    # Mettre à jour uniquement les champs fournis
    client = await crud_client.update(
        db,
        db_obj=client,
        obj_in=client_in
    )

    # Recalculer le profil de risque si données modifiées
    update_data = client_in.dict(exclude_unset=True)
    if any(field in update_data for field in [
        'objectifs_investissement', 'horizon_placement', 'tolerance_risque',
        'pertes_maximales_acceptables', 'experience_perte'
    ]):
        profile = calculate_risk_profile(client)
        await crud_client.update_profil_risque(
            db,
            client_id=client.id,
            profil=profile["profil"],
            score=profile["score"]
        )

    # Log mise à jour
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.UPDATE.value,
        entity_type="client",
        entity_id=client.id,
        old_values=old_values,
        new_values=client.to_dict(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()

    return ClientResponse.from_orm(client)


@router.delete("/{client_id}")
async def delete_client(
    request: Request,
    client_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Supprimer un client
    - Admin: peut supprimer n'importe quel client
    - Conseiller: peut supprimer ses propres clients (brouillons inclus)

    Args:
        client_id: ID du client
        current_user: Utilisateur authentifié
        db: Session database

    Returns:
        Confirmation de suppression

    Raises:
        403: Non autorisé
        404: Client non trouvé
    """
    # Vérifier que le client existe et appartient à l'utilisateur (si pas admin)
    client = await crud_client.get(db, id=client_id)

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )

    # Vérifier les droits: admin OU propriétaire du client
    if current_user.role != "admin" and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez supprimer que vos propres clients"
        )

    # Soft delete
    deleted = await crud_client.delete(db, id=client_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    # Log suppression
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.DELETE.value,
        entity_type="client",
        entity_id=client_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return {"message": "Client supprimé avec succès"}


@router.post("/{client_id}/validate")
async def validate_client(
    request: Request,
    client_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Valider un client
    
    Args:
        client_id: ID du client
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Confirmation de validation
        
    Raises:
        404: Client non trouvé
        403: Accès non autorisé
        400: Client déjà validé
    """
    # Récupérer le client
    client = await crud_client.get(db, id=client_id)
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    # Vérifier les permissions
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce client"
        )
    
    # Vérifier si déjà validé
    if client.is_validated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client déjà validé"
        )
    
    # Valider
    await crud_client.validate_client(
        db,
        client_id=client_id,
        validator_id=current_user.id
    )
    
    # Log validation
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action="VALIDATE",
        entity_type="client",
        entity_id=client_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return {"message": "Client validé avec succès"}


@router.get("/{client_id}/produits", response_model=List[ProduitResponse])
async def get_client_produits(
    client_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> List[ProduitResponse]:
    """
    Récupérer les produits d'un client
    
    Args:
        client_id: ID du client
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Liste des produits du client
    """
    # Vérifier que le client existe et permissions
    client = await crud_client.get(db, id=client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Récupérer les produits
    produits = await crud_produit.get_by_client(db, client_id=client_id)
    
    return [ProduitResponse.from_orm(p) for p in produits]


@router.post("/form", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client_from_form(
    request: Request,
    form_data: ClientFormDataCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> ClientResponse:
    """
    Créer un client depuis le formulaire frontend complet (150+ champs)

    Args:
        form_data: Données complètes du formulaire frontend
        current_user: Utilisateur authentifié
        db: Session database

    Returns:
        Client créé avec tous les champs
    """
    # Extraire les données du formulaire vers le format modèle
    client_data = form_data.extract_client_data()

    # Générer numéro client
    numero = await crud_client.generate_numero_client(db)

    # Ajouter les champs obligatoires
    client_data['numero_client'] = numero
    client_data['conseiller_id'] = current_user.id

    # Créer le client directement avec les données extraites
    client = Client(**client_data)
    db.add(client)
    await db.commit()
    await db.refresh(client)

    # Calculer automatiquement le profil de risque si possible
    try:
        profile = calculate_risk_profile(client)
        await crud_client.update_profil_risque(
            db,
            client_id=client.id,
            profil=profile["profil"],
            score=profile["score"]
        )
    except Exception:
        pass  # Ignorer si les données sont insuffisantes

    # Classifier le niveau LCB-FT si possible
    try:
        lcb_level = classify_lcb_ft_level(client)
        client.lcb_ft_niveau_risque = lcb_level
        await db.commit()
    except Exception:
        pass  # Ignorer si les données sont insuffisantes

    # Log création
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.CREATE.value,
        entity_type="client",
        entity_id=client.id,
        new_values={"numero_client": client.numero_client, "source": "form"},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()

    # Recharger le client
    client = await crud_client.get(db, id=client.id, load_relations=False)

    return ClientResponse.from_orm(client)


@router.put("/{client_id}/form", response_model=ClientResponse)
async def update_client_from_form(
    request: Request,
    client_id: UUID,
    form_data: ClientFormDataCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> ClientResponse:
    """
    Mettre à jour un client depuis le formulaire frontend complet

    Args:
        client_id: ID du client
        form_data: Données complètes du formulaire frontend
        current_user: Utilisateur authentifié
        db: Session database

    Returns:
        Client mis à jour
    """
    # Récupérer le client
    client = await crud_client.get(db, id=client_id)

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )

    # Vérifier les permissions
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce client"
        )

    # Sauvegarder anciennes valeurs pour audit
    old_values = {"id": str(client.id), "numero_client": client.numero_client}

    # Extraire les données du formulaire
    client_data = form_data.extract_client_data()

    # Mettre à jour les champs directement sur l'objet client
    for key, value in client_data.items():
        if hasattr(client, key) and value is not None:
            setattr(client, key, value)

    # CRITICAL: Marquer l'objet comme modifié pour SQLAlchemy
    db.add(client)
    await db.commit()
    await db.refresh(client)

    # Recalculer le profil de risque si possible
    try:
        profile = calculate_risk_profile(client)
        await crud_client.update_profil_risque(
            db,
            client_id=client.id,
            profil=profile["profil"],
            score=profile["score"]
        )
    except Exception:
        pass  # Ignorer si données insuffisantes

    # Reclassifier LCB-FT si possible
    try:
        lcb_level = classify_lcb_ft_level(client)
        client.lcb_ft_niveau_risque = lcb_level
        db.add(client)
        await db.commit()
    except Exception:
        pass  # Ignorer si données insuffisantes

    # Log mise à jour
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.UPDATE.value,
        entity_type="client",
        entity_id=client.id,
        old_values=old_values,
        new_values={"source": "form"},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()

    # Recharger
    client = await crud_client.get(db, id=client.id, load_relations=False)

    return ClientResponse.from_orm(client)