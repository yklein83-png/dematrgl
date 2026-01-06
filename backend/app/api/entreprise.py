"""
API endpoints pour la gestion de l'Entreprise (cabinet)
Configuration singleton du cabinet
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.entreprise import (
    EntrepriseCreate,
    EntrepriseUpdate,
    EntrepriseResponse,
    EntrepriseTemplateData
)
from app.crud import entreprise as crud_entreprise

router = APIRouter(prefix="/entreprise", tags=["Entreprise"])


@router.get("", response_model=EntrepriseResponse | None)
async def get_entreprise(db: AsyncSession = Depends(get_db)):
    """
    Récupère les informations de l'entreprise/cabinet
    Retourne null si non configurée
    """
    return await crud_entreprise.get_entreprise(db)


@router.post("", response_model=EntrepriseResponse, status_code=status.HTTP_201_CREATED)
async def create_entreprise(
    entreprise_data: EntrepriseCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crée la configuration de l'entreprise
    Note: Une seule entreprise peut exister (singleton)
    """
    existing = await crud_entreprise.get_entreprise(db)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Une entreprise existe déjà. Utilisez PUT pour la modifier."
        )

    return await crud_entreprise.create_entreprise(db, entreprise_data)


@router.put("", response_model=EntrepriseResponse)
async def update_entreprise(
    entreprise_data: EntrepriseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Met à jour ou crée la configuration de l'entreprise
    Endpoint principal pour la configuration
    """
    return await crud_entreprise.create_or_update_entreprise(db, entreprise_data)


@router.get("/template-data", response_model=EntrepriseTemplateData)
async def get_template_data(db: AsyncSession = Depends(get_db)):
    """
    Récupère les données formatées pour les templates Word
    Utilisé par le générateur de documents
    """
    entreprise = await crud_entreprise.get_entreprise(db)

    if not entreprise:
        # Retourner des valeurs vides si pas configuré
        return EntrepriseTemplateData()

    return EntrepriseTemplateData(**entreprise.to_template_data())
