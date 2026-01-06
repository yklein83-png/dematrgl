"""
API Routes pour les statistiques du Dashboard
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from pydantic import BaseModel

from app.core.deps import get_session, get_current_active_user
from app.models.user import User
from app.models.client import Client, ClientStatut
from app.models.document import Document

router = APIRouter()


class DashboardStats(BaseModel):
    """Schéma de réponse pour les statistiques du dashboard"""
    total_clients: int
    clients_actifs: int
    documents_generes: int
    clients_ce_mois: int


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> DashboardStats:
    """
    Récupérer les statistiques pour le dashboard

    - Total clients du conseiller
    - Clients actifs (statut actif)
    - Documents générés
    - Nouveaux clients ce mois

    Args:
        current_user: Utilisateur authentifié
        db: Session database

    Returns:
        Statistiques du dashboard
    """
    # Filtre conseiller (admin voit tout)
    conseiller_filter = [] if current_user.is_admin else [Client.conseiller_id == current_user.id]

    # 1. Total clients
    result = await db.execute(
        select(func.count(Client.id)).where(
            and_(*conseiller_filter) if conseiller_filter else True
        )
    )
    total_clients = result.scalar() or 0

    # 2. Clients actifs
    result = await db.execute(
        select(func.count(Client.id)).where(
            and_(
                Client.statut == ClientStatut.CLIENT_ACTIF.value,
                *conseiller_filter
            ) if conseiller_filter else Client.statut == ClientStatut.CLIENT_ACTIF.value
        )
    )
    clients_actifs = result.scalar() or 0

    # 3. Documents générés
    if current_user.is_admin:
        result = await db.execute(
            select(func.count(Document.id))
        )
    else:
        # Joindre sur clients pour filtrer par conseiller
        result = await db.execute(
            select(func.count(Document.id))
            .join(Client, Document.client_id == Client.id)
            .where(Client.conseiller_id == current_user.id)
        )
    documents_generes = result.scalar() or 0

    # 4. Nouveaux clients ce mois
    now = datetime.now()
    first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    conditions = [Client.created_at >= first_day_of_month]
    if conseiller_filter:
        conditions.extend(conseiller_filter)

    result = await db.execute(
        select(func.count(Client.id)).where(and_(*conditions))
    )
    clients_ce_mois = result.scalar() or 0

    return DashboardStats(
        total_clients=total_clients,
        clients_actifs=clients_actifs,
        documents_generes=documents_generes,
        clients_ce_mois=clients_ce_mois
    )
