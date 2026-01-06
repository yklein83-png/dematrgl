"""
CRUD operations pour Document
Génération et gestion des documents DOCX et CSV
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
import hashlib
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from app.models.document import Document, TypeDocument
from app.schemas.document import DocumentCreate
from app.config import settings


class CRUDDocument:
    """
    Classe CRUD pour les opérations Document
    Gestion des documents générés et exports
    """
    
    # ==========================================
    # CREATE
    # ==========================================
    
    async def create(
        self,
        db: AsyncSession,
        *,
        client_id: UUID,
        type_document: TypeDocument,
        nom_fichier: str,
        chemin_fichier: str,
        genere_par: UUID,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Document:
        """
        Créer un nouveau document
        
        Args:
            db: Session database
            client_id: ID du client
            type_document: Type de document
            nom_fichier: Nom du fichier généré
            chemin_fichier: Chemin complet du fichier
            genere_par: ID de l'utilisateur générateur
            metadata: Métadonnées additionnelles
            
        Returns:
            Document créé
        """
        # Calculer la taille et le hash si le fichier existe
        taille_octets = None
        hash_fichier = None
        
        if os.path.exists(chemin_fichier):
            # Taille du fichier
            taille_octets = os.path.getsize(chemin_fichier)
            
            # Hash SHA-256 pour intégrité
            hash_fichier = await self.calculate_file_hash(chemin_fichier)
        
        # Créer l'objet Document
        db_obj = Document(
            client_id=client_id,
            type_document=type_document.value if isinstance(type_document, TypeDocument) else type_document,
            nom_fichier=nom_fichier,
            chemin_fichier=chemin_fichier,
            taille_octets=taille_octets,
            hash_fichier=hash_fichier,
            genere_par=genere_par,
            metadata=metadata
        )
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def calculate_file_hash(self, filepath: str) -> str:
        """
        Calculer le hash SHA-256 d'un fichier
        
        Args:
            filepath: Chemin du fichier
            
        Returns:
            Hash SHA-256 en hexadécimal
        """
        sha256_hash = hashlib.sha256()
        with open(filepath, "rb") as f:
            # Lire par chunks pour les gros fichiers
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    # ==========================================
    # READ
    # ==========================================
    
    async def get(
        self,
        db: AsyncSession,
        id: UUID
    ) -> Optional[Document]:
        """
        Récupérer un document par ID
        
        Args:
            db: Session database
            id: ID du document
            
        Returns:
            Document ou None
        """
        result = await db.execute(
            select(Document)
            .options(
                selectinload(Document.client),
                selectinload(Document.generateur)
            )
            .where(Document.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_client(
        self,
        db: AsyncSession,
        *,
        client_id: UUID,
        type_document: Optional[TypeDocument] = None,
        signe_only: bool = False
    ) -> List[Document]:
        """
        Récupérer les documents d'un client
        
        Args:
            db: Session database
            client_id: ID du client
            type_document: Filtrer par type
            signe_only: Uniquement les signés
            
        Returns:
            Liste de documents
        """
        query = select(Document).where(Document.client_id == client_id)
        
        if type_document:
            query = query.where(Document.type_document == type_document.value)
        
        if signe_only:
            query = query.where(Document.signe == True)
        
        query = query.order_by(Document.date_generation.desc())
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        type_document: Optional[TypeDocument] = None,
        genere_par: Optional[UUID] = None,
        signe: Optional[bool] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> List[Document]:
        """
        Récupérer plusieurs documents avec filtres
        
        Args:
            db: Session database
            skip: Offset pagination
            limit: Limite de résultats
            type_document: Filtrer par type
            genere_par: Filtrer par générateur
            signe: Filtrer par statut signature
            date_from: Date de début
            date_to: Date de fin
            
        Returns:
            Liste de documents
        """
        query = select(Document).options(
            selectinload(Document.client),
            selectinload(Document.generateur)
        )
        
        conditions = []
        
        if type_document:
            conditions.append(Document.type_document == type_document.value)
        
        if genere_par:
            conditions.append(Document.genere_par == genere_par)
        
        if signe is not None:
            conditions.append(Document.signe == signe)
        
        if date_from:
            conditions.append(Document.date_generation >= date_from)
        
        if date_to:
            conditions.append(Document.date_generation <= date_to)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.order_by(Document.date_generation.desc()).offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def count(
        self,
        db: AsyncSession,
        *,
        type_document: Optional[TypeDocument] = None,
        signe: Optional[bool] = None
    ) -> int:
        """
        Compter les documents
        
        Args:
            db: Session database
            type_document: Filtrer par type
            signe: Filtrer par statut signature
            
        Returns:
            Nombre de documents
        """
        query = select(func.count(Document.id))
        
        conditions = []
        if type_document:
            conditions.append(Document.type_document == type_document.value)
        if signe is not None:
            conditions.append(Document.signe == signe)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        result = await db.execute(query)
        return result.scalar()
    
    # ==========================================
    # UPDATE
    # ==========================================
    
    async def mark_as_signed(
        self,
        db: AsyncSession,
        *,
        document_id: UUID
    ) -> bool:
        """
        Marquer un document comme signé
        
        Args:
            db: Session database
            document_id: ID du document
            
        Returns:
            True si mis à jour
        """
        document = await self.get(db, id=document_id)
        if document:
            document.signe = True
            document.date_signature = datetime.utcnow()
            db.add(document)
            await db.commit()
            return True
        return False
    
    # ==========================================
    # DELETE
    # ==========================================
    
    async def delete(
        self,
        db: AsyncSession,
        *,
        id: UUID,
        delete_file: bool = False
    ) -> bool:
        """
        Supprimer un document
        
        Args:
            db: Session database
            id: ID du document
            delete_file: Supprimer aussi le fichier physique
            
        Returns:
            True si supprimé
        """
        document = await self.get(db, id=id)
        if document:
            # Supprimer le fichier physique si demandé
            if delete_file and document.file_exists:
                try:
                    os.remove(document.chemin_fichier)
                except OSError:
                    pass
            
            # Supprimer de la BDD
            await db.delete(document)
            await db.commit()
            return True
        return False


# Instance singleton
crud_document = CRUDDocument()