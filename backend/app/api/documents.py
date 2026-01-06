"""
API Routes pour les documents
Génération DOCX et téléchargement
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
from datetime import datetime

from app.core.deps import get_session, get_current_active_user
from app.crud.document import crud_document
from app.crud.client import crud_client
from app.schemas.document import (
    DocumentResponse, DocumentGenerateRequest, 
    DocumentGenerateResponse, DocumentBulkGenerateRequest
)
from app.models.user import User
from app.models.document import TypeDocument
from app.models.audit_log import AuditLog, AuditAction
from app.services.docx_generator import DocxGenerator
from app.config import settings

router = APIRouter()


@router.get("/client/{client_id}", response_model=List[DocumentResponse])
async def list_client_documents(
    client_id: UUID,
    type_document: Optional[TypeDocument] = None,
    signe_only: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> List[DocumentResponse]:
    """
    Liste des documents d'un client
    
    Args:
        client_id: ID du client
        type_document: Filtrer par type
        signe_only: Uniquement les signés
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Liste des documents
    """
    # Vérifier permissions
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
    
    # Récupérer les documents
    documents = await crud_document.get_by_client(
        db,
        client_id=client_id,
        type_document=type_document,
        signe_only=signe_only
    )
    
    return [DocumentResponse.from_orm(doc) for doc in documents]


@router.post("/generate", response_model=DocumentGenerateResponse)
async def generate_document(
    request: Request,
    generate_request: DocumentGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> DocumentGenerateResponse:
    """
    Générer un document pour un client
    
    Args:
        generate_request: Paramètres de génération
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Document généré avec URL de téléchargement
        
    Raises:
        404: Client non trouvé
        403: Accès non autorisé
        500: Erreur de génération
    """
    # Récupérer le client avec toutes les données
    client = await crud_client.get(
        db, 
        id=generate_request.client_id,
        load_relations=True
    )
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    # Vérifier permissions
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    try:
        # Initialiser le générateur
        generator = DocxGenerator()

        # Générer le document selon le type (avec alias pour rétrocompatibilité)
        doc_type = generate_request.type_document

        if doc_type == TypeDocument.DER:
            # Utiliser le nouveau template v2 avec mise en page professionnelle
            file_path = await generator.generate_der_v2(client, current_user)
        elif doc_type in (TypeDocument.QCC, TypeDocument.KYC):
            # Utiliser le nouveau template v2 avec les données client pré-remplies
            file_path = await generator.generate_qcc_v2(client, current_user)
        elif doc_type == TypeDocument.PROFIL_RISQUE:
            # Utiliser le nouveau template v2 avec les données client pré-remplies
            file_path = await generator.generate_profil_risque_v2(client, current_user)
        elif doc_type in (TypeDocument.LETTRE_MISSION, TypeDocument.LETTRE_MISSION_CIF):
            file_path = await generator.generate_lettre_mission_cif(client, current_user)
        elif doc_type in (TypeDocument.DECLARATION_ADEQUATION, TypeDocument.DECLARATION_ADEQUATION_CIF):
            file_path = await generator.generate_declaration_adequation(client, current_user)
        elif doc_type == TypeDocument.CONVENTION_RTO:
            # Utiliser le nouveau template v2 avec mise en page professionnelle
            file_path = await generator.generate_rto_v2(client, current_user)
        elif doc_type in (TypeDocument.RAPPORT_IAS, TypeDocument.RAPPORT_CONSEIL_IAS):
            file_path = await generator.generate_rapport_conseil_ias(client, current_user)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Type de document non supporté: {generate_request.type_document}"
            )
        
        # Enregistrer en base de données
        filename = os.path.basename(file_path)
        document = await crud_document.create(
            db,
            client_id=client.id,
            type_document=generate_request.type_document,
            nom_fichier=filename,
            chemin_fichier=file_path,
            genere_par=current_user.id,
            metadata=generate_request.metadata or {
                "template_version": "2025.03",
                "generated_by": current_user.nom_complet
            }
        )
        
        # Log génération
        await AuditLog.log_action(
            db,
            user_id=current_user.id,
            action=AuditAction.GENERATE_DOC.value,
            entity_type="document",
            entity_id=document.id,
            new_values={
                "type": generate_request.type_document.value,
                "client_id": str(client.id),
                "filename": filename
            },
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent")
        )
        await db.commit()
        
        return DocumentGenerateResponse(
            success=True,
            message=f"Document {generate_request.type_document.value} généré avec succès",
            document_id=document.id,
            download_url=f"/api/v1/documents/download/{document.id}",
            filename=filename
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération: {str(e)}"
        )


@router.post("/generate-bulk", response_model=List[DocumentGenerateResponse])
async def generate_bulk_documents(
    request: Request,
    bulk_request: DocumentBulkGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> List[DocumentGenerateResponse]:
    """
    Générer plusieurs documents pour un client
    
    Args:
        bulk_request: Types de documents à générer
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Liste des documents générés
    """
    results = []
    
    for type_doc in bulk_request.types_documents:
        try:
            # Créer une requête individuelle
            single_request = DocumentGenerateRequest(
                client_id=bulk_request.client_id,
                type_document=type_doc
            )
            
            # Générer le document
            result = await generate_document(
                request=request,
                generate_request=single_request,
                current_user=current_user,
                db=db
            )
            results.append(result)
            
        except Exception as e:
            # En cas d'erreur, ajouter un résultat d'échec
            results.append(DocumentGenerateResponse(
                success=False,
                message=f"Erreur génération {type_doc.value}: {str(e)}",
                document_id=None,
                download_url=None,
                filename=None
            ))
    
    return results


@router.get("/download/{document_id}")
async def download_document(
    document_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> FileResponse:
    """
    Télécharger un document
    
    Args:
        document_id: ID du document
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Fichier à télécharger
        
    Raises:
        404: Document ou fichier non trouvé
        403: Accès non autorisé
    """
    # Récupérer le document
    document = await crud_document.get(db, id=document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document non trouvé"
        )
    
    # Vérifier permissions via le client
    client = await crud_client.get(db, id=document.client_id)
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Vérifier que le fichier existe
    if not document.file_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier non trouvé sur le serveur"
        )
    
    # Retourner le fichier
    return FileResponse(
        path=document.chemin_fichier,
        filename=document.nom_fichier,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@router.post("/{document_id}/sign")
async def sign_document(
    request: Request,
    document_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Marquer un document comme signé (placeholder pour DocuSign)
    
    Args:
        document_id: ID du document
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Confirmation de signature
    """
    # Récupérer le document
    document = await crud_document.get(db, id=document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document non trouvé"
        )
    
    # Vérifier permissions
    client = await crud_client.get(db, id=document.client_id)
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Marquer comme signé
    success = await crud_document.mark_as_signed(db, document_id=document_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la signature"
        )
    
    # Log signature
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action="SIGN_DOC",
        entity_type="document",
        entity_id=document_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return {"message": "Document marqué comme signé"}


@router.delete("/{document_id}")
async def delete_document(
    request: Request,
    document_id: UUID,
    delete_file: bool = Query(False),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Supprimer un document
    
    Args:
        document_id: ID du document
        delete_file: Supprimer aussi le fichier physique
        current_user: Utilisateur authentifié
        db: Session database
        
    Returns:
        Confirmation de suppression
    """
    # Récupérer le document
    document = await crud_document.get(db, id=document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document non trouvé"
        )
    
    # Admin uniquement ou propriétaire du client
    client = await crud_client.get(db, id=document.client_id)
    if not current_user.is_admin and client.conseiller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Supprimer
    success = await crud_document.delete(
        db,
        id=document_id,
        delete_file=delete_file
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression"
        )
    
    # Log suppression
    await AuditLog.log_action(
        db,
        user_id=current_user.id,
        action=AuditAction.DELETE.value,
        entity_type="document",
        entity_id=document_id,
        new_values={"delete_file": delete_file},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent")
    )
    await db.commit()
    
    return {"message": "Document supprimé avec succès"}