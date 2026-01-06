"""
API Routes pour les exports
Export CSV pour Harvest CRM
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import io

from app.core.deps import get_session, get_current_active_user, get_current_admin_user
from app.crud.client import crud_client
from app.crud.document import crud_document
from app.models.user import User
from app.models.document import TypeDocument
from app.models.client import ClientStatut
from app.models.audit_log import AuditLog, AuditAction
from app.services.csv_exporter import CsvExporter

router = APIRouter()


@router.get("/harvest/clients")
async def export_clients_harvest(
    request: Request,
    date_from: Optional[datetime] = Query(None, description="Date de début"),
    date_to: Optional[datetime] = Query(None, description="Date de fin"),
    statut: Optional[ClientStatut] = Query(None, description="Filtrer par statut"),
    conseiller_id: Optional[UUID] = Query(None, description="Filtrer par conseiller"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> StreamingResponse:
    """
    Export CSV des clients pour Harvest CRM
    Format spécifique avec 120+ colonnes
    
    Args:
        date_from: Date de début (created_at)
        date_to: Date de fin (created_at)
        statut: Filtrer par statut client
        conseiller_id: Filtrer par conseiller (admin only)
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Fichier CSV en streaming
    """
    # Si pas admin, forcer son propre ID
    if not current_user.is_admin:
        conseiller_id = current_user.id
    
    # Dates par défaut (30 derniers jours)
    if not date_from:
        date_from = datetime.utcnow() - timedelta(days=30)
    if not date_to:
        date_to = datetime.utcnow()
    
    # Récupérer les clients
    clients = await crud_client.get_multi(
        db,
        skip=0,
        limit=10000,  # Limite haute pour export
        conseiller_id=conseiller_id,
        statut=statut
    )
    
    # Filtrer par dates
    filtered_clients = [
        c for c in clients 
        if c.created_at >= date_from and c.created_at <= date_to
    ]
    
    # Générer le CSV
    exporter = CsvExporter()
    csv_buffer = await exporter.export_clients_harvest(filtered_clients)
    
    # Créer un document pour traçabilité
    filename = f"harvest_clients_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    document = await crud_document.create(
        db,
        client_id=None,  # Export global, pas lié à un client
        type_document=TypeDocument.EXPORT_CSV,
        nom_fichier=filename,
        chemin_fichier=f"/app/exports/{filename}",
        genere_par=current_user.id,
        metadata={
            "export_type": "harvest_clients",
            "filters": {
                "date_from": date_from.isoformat(),
                "date_to": date_to.isoformat(),
                "statut": statut.value if statut else None,
                "conseiller_id": str(conseiller_id) if conseiller_id else None
            },
            "total_records": len(filtered_clients)
        }
    )
    
    # Log export
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.EXPORT.value,
        entity_type="export",
        entity_id=document.id,
        new_values={
            "type": "harvest_clients",
            "records": len(filtered_clients),
            "filename": filename
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    # Retourner le CSV en streaming
    return StreamingResponse(
        io.BytesIO(csv_buffer.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/statistics")
async def get_export_statistics(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Statistiques des exports (admin uniquement)
    
    Args:
        current_user: Admin authentifié
        db: Session database
        
    Returns:
        Statistiques d'export
    """
    # Compter les exports des 30 derniers jours
    date_limit = datetime.utcnow() - timedelta(days=30)
    
    # Total exports CSV
    total_exports = await crud_document.count(
        db,
        type_document=TypeDocument.EXPORT_CSV
    )
    
    # Récupérer les derniers exports
    recent_exports = await crud_document.get_multi(
        db,
        type_document=TypeDocument.EXPORT_CSV,
        date_from=date_limit,
        limit=10
    )
    
    # Formater les statistiques
    return {
        "total_exports": total_exports,
        "exports_last_30_days": len(recent_exports),
        "recent_exports": [
            {
                "id": str(exp.id),
                "filename": exp.nom_fichier,
                "date": exp.date_generation.isoformat(),
                "generated_by": str(exp.genere_par),
                "metadata": exp.metadata
            }
            for exp in recent_exports
        ]
    }


@router.get("/templates")
async def get_csv_templates(
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """
    Obtenir les templates CSV disponibles
    
    Args:
        current_user: Utilisateur authentifié
        
    Returns:
        Liste des templates disponibles
    """
    return {
        "templates": [
            {
                "name": "harvest_clients",
                "description": "Export complet clients pour Harvest CRM",
                "columns": 120,
                "format": "CSV UTF-8"
            },
            {
                "name": "clients_simple",
                "description": "Export simplifié des clients",
                "columns": 15,
                "format": "CSV UTF-8"
            }
        ]
    }