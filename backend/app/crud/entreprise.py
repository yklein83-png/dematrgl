"""
CRUD operations pour l'entité Entreprise
Gestion du singleton entreprise (une seule entreprise par installation)
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID

from app.models.entreprise import Entreprise
from app.schemas.entreprise import EntrepriseCreate, EntrepriseUpdate


async def get_entreprise(db: AsyncSession) -> Optional[Entreprise]:
    """
    Récupère l'entreprise (singleton)
    Il ne doit y avoir qu'une seule entreprise dans le système
    """
    result = await db.execute(
        select(Entreprise).where(Entreprise.actif == True).limit(1)
    )
    return result.scalar_one_or_none()


async def get_entreprise_by_id(db: AsyncSession, entreprise_id: UUID) -> Optional[Entreprise]:
    """Récupère une entreprise par son ID"""
    result = await db.execute(
        select(Entreprise).where(Entreprise.id == entreprise_id)
    )
    return result.scalar_one_or_none()


async def create_entreprise(db: AsyncSession, entreprise_data: EntrepriseCreate) -> Entreprise:
    """
    Crée une nouvelle entreprise
    Note: Vérifie qu'il n'y en a pas déjà une active
    """
    # Désactiver toute entreprise existante
    existing = await get_entreprise(db)
    if existing:
        existing.actif = False

    # Créer la nouvelle entreprise
    db_entreprise = Entreprise(**entreprise_data.model_dump())
    db.add(db_entreprise)
    await db.flush()
    await db.refresh(db_entreprise)
    return db_entreprise


async def update_entreprise(
    db: AsyncSession,
    entreprise: Entreprise,
    entreprise_data: EntrepriseUpdate
) -> Entreprise:
    """Met à jour une entreprise existante"""
    update_data = entreprise_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(entreprise, field, value)

    await db.flush()
    await db.refresh(entreprise)
    return entreprise


async def create_or_update_entreprise(
    db: AsyncSession,
    entreprise_data: EntrepriseUpdate
) -> Entreprise:
    """
    Crée ou met à jour l'entreprise singleton
    Utilisé par l'interface de configuration
    """
    existing = await get_entreprise(db)

    if existing:
        return await update_entreprise(db, existing, entreprise_data)
    else:
        # Convertir EntrepriseUpdate en données de création
        create_data = EntrepriseCreate(**entreprise_data.model_dump(exclude_unset=True))
        return await create_entreprise(db, create_data)
