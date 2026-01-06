"""
CRUD operations pour Produit
Gestion des produits financiers des clients
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from decimal import Decimal
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from app.models.produit import Produit, TypeProduit, StatutProduit
from app.schemas.produit import ProduitCreate, ProduitUpdate


class CRUDProduit:
    """
    Classe CRUD pour les opérations Produit
    Gestion des produits financiers souscrits
    """
    
    # ==========================================
    # CREATE
    # ==========================================
    
    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: ProduitCreate
    ) -> Produit:
        """
        Créer un nouveau produit
        
        Args:
            db: Session database
            obj_in: Données de création
            
        Returns:
            Produit créé
        """
        db_obj = Produit(**obj_in.dict())
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    # ==========================================
    # READ
    # ==========================================
    
    async def get(
        self,
        db: AsyncSession,
        id: UUID
    ) -> Optional[Produit]:
        """
        Récupérer un produit par ID
        
        Args:
            db: Session database
            id: ID du produit
            
        Returns:
            Produit ou None
        """
        result = await db.execute(
            select(Produit)
            .options(selectinload(Produit.client))
            .where(Produit.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_client(
        self,
        db: AsyncSession,
        *,
        client_id: UUID,
        type_produit: Optional[TypeProduit] = None,
        statut: Optional[StatutProduit] = None
    ) -> List[Produit]:
        """
        Récupérer les produits d'un client
        
        Args:
            db: Session database
            client_id: ID du client
            type_produit: Filtrer par type
            statut: Filtrer par statut
            
        Returns:
            Liste de produits
        """
        query = select(Produit).where(Produit.client_id == client_id)
        
        if type_produit:
            query = query.where(Produit.type_produit == type_produit.value)
        
        if statut:
            query = query.where(Produit.statut == statut.value)
        
        query = query.order_by(Produit.date_souscription.desc())
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        type_produit: Optional[TypeProduit] = None,
        fournisseur: Optional[str] = None,
        statut: Optional[StatutProduit] = None
    ) -> List[Produit]:
        """
        Récupérer plusieurs produits avec filtres
        
        Args:
            db: Session database
            skip: Offset pagination
            limit: Limite de résultats
            type_produit: Filtrer par type
            fournisseur: Filtrer par fournisseur
            statut: Filtrer par statut
            
        Returns:
            Liste de produits
        """
        query = select(Produit).options(selectinload(Produit.client))
        
        conditions = []
        
        if type_produit:
            conditions.append(Produit.type_produit == type_produit.value)
        
        if fournisseur:
            conditions.append(func.lower(Produit.fournisseur).like(f"%{fournisseur.lower()}%"))
        
        if statut:
            conditions.append(Produit.statut == statut.value)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.order_by(Produit.created_at.desc()).offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_total_by_client(
        self,
        db: AsyncSession,
        client_id: UUID
    ) -> Decimal:
        """
        Calculer le total investi par un client
        
        Args:
            db: Session database
            client_id: ID du client
            
        Returns:
            Montant total investi
        """
        result = await db.execute(
            select(func.sum(Produit.montant_investi))
            .where(
                and_(
                    Produit.client_id == client_id,
                    Produit.statut == StatutProduit.ACTIF.value
                )
            )
        )
        total = result.scalar()
        return total or Decimal('0')
    
    # ==========================================
    # UPDATE
    # ==========================================
    
    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: Produit,
        obj_in: ProduitUpdate
    ) -> Produit:
        """
        Mettre à jour un produit
        
        Args:
            db: Session database
            db_obj: Produit existant
            obj_in: Données de mise à jour
            
        Returns:
            Produit mis à jour
        """
        update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def close_produit(
        self,
        db: AsyncSession,
        *,
        produit_id: UUID
    ) -> bool:
        """
        Clôturer un produit
        
        Args:
            db: Session database
            produit_id: ID du produit
            
        Returns:
            True si clôturé
        """
        produit = await self.get(db, id=produit_id)
        if produit:
            produit.statut = StatutProduit.CLOTURE.value
            db.add(produit)
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
        id: UUID
    ) -> bool:
        """
        Supprimer un produit
        
        Args:
            db: Session database
            id: ID du produit
            
        Returns:
            True si supprimé
        """
        produit = await self.get(db, id=id)
        if produit:
            await db.delete(produit)
            await db.commit()
            return True
        return False
    
    # ==========================================
    # STATISTIQUES
    # ==========================================
    
    async def get_repartition_by_type(
        self,
        db: AsyncSession,
        client_id: UUID
    ) -> Dict[str, Decimal]:
        """
        Obtenir la répartition par type de produit
        
        Args:
            db: Session database
            client_id: ID du client
            
        Returns:
            Dict avec montants par type
        """
        result = await db.execute(
            select(
                Produit.type_produit,
                func.sum(Produit.montant_investi)
            )
            .where(
                and_(
                    Produit.client_id == client_id,
                    Produit.statut == StatutProduit.ACTIF.value
                )
            )
            .group_by(Produit.type_produit)
        )
        
        repartition = {}
        for row in result:
            type_produit, montant = row
            repartition[type_produit] = montant or Decimal('0')
        
        return repartition


# Instance singleton
crud_produit = CRUDProduit()