"""
CRUD operations pour Client
Gestion des 120+ champs du formulaire client
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, update
from sqlalchemy.orm import selectinload

from app.models.client import Client, ClientStatut
from app.schemas.client import ClientCreate, ClientUpdate


def serialize_for_json(value: Any) -> Any:
    """
    Convertir une valeur pour qu'elle soit sérialisable en JSON.
    Notamment les dates, datetime et Decimal.
    """
    from decimal import Decimal as DecimalType
    from uuid import UUID as UUIDType

    if value is None:
        return None
    elif isinstance(value, (datetime, date)):
        return value.isoformat()
    elif isinstance(value, DecimalType):
        # Convertir Decimal en float pour JSON
        return float(value)
    elif isinstance(value, UUIDType):
        return str(value)
    elif isinstance(value, dict):
        return {k: serialize_for_json(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [serialize_for_json(item) for item in value]
    return value


class CRUDClient:
    """
    Classe CRUD pour les opérations Client
    Gestion complète des clients avec 120+ champs
    """
    
    # ==========================================
    # CREATE
    # ==========================================
    
    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: ClientCreate,
        conseiller_id: UUID
    ) -> Client:
        """
        Créer un nouveau client
        
        Args:
            db: Session database
            obj_in: Données de création (120+ champs)
            conseiller_id: ID du conseiller créateur
            
        Returns:
            Client créé
        """
        # Générer numéro client si non fourni
        if not obj_in.numero_client:
            obj_in.numero_client = await self.generate_numero_client(db)
        
        # Convertir en dict et ajouter conseiller_id
        obj_in_data = obj_in.dict()
        obj_in_data['conseiller_id'] = conseiller_id
        
        # Créer l'objet Client
        db_obj = Client(**obj_in_data)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def generate_numero_client(self, db: AsyncSession) -> str:
        """
        Générer un numéro client unique
        Format: FAR-YYYY-NNNN
        
        Returns:
            Numéro client généré
        """
        year = datetime.now().year
        prefix = f"FAR-{year}-"
        
        # Récupérer le dernier numéro
        result = await db.execute(
            select(func.max(Client.numero_client))
            .where(Client.numero_client.like(f"{prefix}%"))
        )
        last_numero = result.scalar()
        
        if last_numero:
            # Extraire le compteur et incrémenter
            last_count = int(last_numero.split("-")[-1])
            new_count = last_count + 1
        else:
            new_count = 1
        
        return f"{prefix}{new_count:04d}"
    
    # ==========================================
    # READ
    # ==========================================
    
    async def get(
        self,
        db: AsyncSession,
        id: UUID,
        load_relations: bool = False
    ) -> Optional[Client]:
        """
        Récupérer un client par ID
        
        Args:
            db: Session database
            id: ID du client
            load_relations: Charger les relations (produits, documents)
            
        Returns:
            Client ou None
        """
        query = select(Client).where(Client.id == id)
        
        if load_relations:
            query = query.options(
                selectinload(Client.conseiller),
                selectinload(Client.produits),
                selectinload(Client.documents)
            )
        
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_numero(
        self,
        db: AsyncSession,
        *,
        numero_client: str
    ) -> Optional[Client]:
        """
        Récupérer un client par numéro client
        
        Args:
            db: Session database
            numero_client: Numéro client
            
        Returns:
            Client ou None
        """
        result = await db.execute(
            select(Client).where(Client.numero_client == numero_client)
        )
        return result.scalar_one_or_none()
    
    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        conseiller_id: Optional[UUID] = None,
        statut: Optional[ClientStatut] = None,
        search: Optional[str] = None,
        only_validated: bool = False,
        profil_risque: Optional[str] = None,
        lcb_ft_niveau: Optional[str] = None
    ) -> List[Client]:
        """
        Récupérer plusieurs clients avec filtres
        
        Args:
            db: Session database
            skip: Pagination offset
            limit: Nombre max de résultats
            conseiller_id: Filtrer par conseiller
            statut: Filtrer par statut
            search: Recherche textuelle (nom, email)
            only_validated: Uniquement les validés
            profil_risque: Filtrer par profil de risque
            lcb_ft_niveau: Filtrer par niveau LCB-FT
            
        Returns:
            Liste de clients
        """
        query = select(Client).options(
            selectinload(Client.conseiller)
        )
        
        # Construire les conditions
        conditions = []
        
        if conseiller_id:
            conditions.append(Client.conseiller_id == conseiller_id)
        
        if statut:
            conditions.append(Client.statut == statut.value)
        
        if only_validated:
            conditions.append(Client.validated_at.isnot(None))
        
        if profil_risque:
            conditions.append(Client.profil_risque_calcule == profil_risque)
        
        if lcb_ft_niveau:
            conditions.append(Client.lcb_ft_niveau_risque == lcb_ft_niveau)
        
        # Recherche textuelle
        if search:
            search_lower = f"%{search.lower()}%"
            conditions.append(
                or_(
                    func.lower(Client.t1_nom).like(search_lower),
                    func.lower(Client.t1_prenom).like(search_lower),
                    func.lower(Client.t1_email).like(search_lower),
                    func.lower(Client.t2_nom).like(search_lower),
                    func.lower(Client.t2_prenom).like(search_lower),
                    Client.numero_client.like(f"%{search}%")
                )
            )
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Ordre et pagination
        query = query.order_by(Client.created_at.desc()).offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def count(
        self,
        db: AsyncSession,
        *,
        conseiller_id: Optional[UUID] = None,
        statut: Optional[ClientStatut] = None
    ) -> int:
        """
        Compter les clients
        
        Args:
            db: Session database
            conseiller_id: Filtrer par conseiller
            statut: Filtrer par statut
            
        Returns:
            Nombre de clients
        """
        query = select(func.count(Client.id))
        
        conditions = []
        if conseiller_id:
            conditions.append(Client.conseiller_id == conseiller_id)
        if statut:
            conditions.append(Client.statut == statut.value)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        result = await db.execute(query)
        return result.scalar()
    
    # ==========================================
    # UPDATE
    # ==========================================
    
    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: Client,
        obj_in: ClientUpdate
    ) -> Client:
        """
        Mettre à jour un client

        Args:
            db: Session database
            db_obj: Client existant
            obj_in: Données de mise à jour

        Returns:
            Client mis à jour
        """
        # Champs système à ne jamais mettre à jour via l'API
        PROTECTED_FIELDS = {
            'id', 'conseiller_id', 'created_at', 'updated_at',
            'validated_at', 'validated_by', 'profil_risque_date_calcul',
            'nom_complet_t1', 'nom_complet_t2', 'has_titulaire_2',
            'is_validated', 'is_us_person', 'is_ppe'
        }

        # Convertir en dict et ignorer les None
        update_data = obj_in.dict(exclude_unset=True)

        # Récupérer les noms de colonnes du modèle Client
        model_columns = {column.name for column in Client.__table__.columns}

        # Préparer form_data pour les champs non-mappés
        extra_fields = {}
        existing_form_data = db_obj.form_data or {}

        # Mettre à jour les champs
        for field, value in update_data.items():
            # Ignorer les champs protégés
            if field in PROTECTED_FIELDS:
                continue

            if field in model_columns:
                # Champ existe dans le modèle -> mise à jour directe
                setattr(db_obj, field, value)
            else:
                # Champ n'existe pas -> stocker dans form_data
                # Sérialiser pour JSON (convertir dates en strings)
                extra_fields[field] = serialize_for_json(value)

        # Fusionner les champs extra avec form_data existant
        if extra_fields:
            merged_form_data = {**existing_form_data, **extra_fields}
            db_obj.form_data = merged_form_data

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)

        return db_obj
    
    async def update_profil_risque(
        self,
        db: AsyncSession,
        *,
        client_id: UUID,
        profil: str,
        score: int
    ) -> bool:
        """
        Mettre à jour le profil de risque calculé
        
        Args:
            db: Session database
            client_id: ID du client
            profil: Profil calculé
            score: Score calculé
            
        Returns:
            True si mis à jour
        """
        await db.execute(
            update(Client)
            .where(Client.id == client_id)
            .values(
                profil_risque_calcule=profil,
                profil_risque_score=score,
                profil_risque_date_calcul=datetime.utcnow()
            )
        )
        await db.commit()
        return True
    
    async def validate_client(
        self,
        db: AsyncSession,
        *,
        client_id: UUID,
        validator_id: UUID
    ) -> bool:
        """
        Valider un client
        
        Args:
            db: Session database
            client_id: ID du client
            validator_id: ID du validateur
            
        Returns:
            True si validé
        """
        await db.execute(
            update(Client)
            .where(Client.id == client_id)
            .values(
                validated_at=datetime.utcnow(),
                validated_by=validator_id,
                statut=ClientStatut.CLIENT_ACTIF.value
            )
        )
        await db.commit()
        return True
    
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
        Supprimer un client (soft delete via statut)
        
        Args:
            db: Session database
            id: ID du client
            
        Returns:
            True si supprimé
        """
        client = await self.get(db, id=id)
        if client:
            client.statut = ClientStatut.CLIENT_INACTIF.value
            db.add(client)
            await db.commit()
            return True
        return False
    
    # ==========================================
    # STATISTIQUES
    # ==========================================
    
    async def get_stats_by_conseiller(
        self,
        db: AsyncSession,
        conseiller_id: UUID
    ) -> Dict[str, Any]:
        """
        Obtenir les statistiques d'un conseiller
        
        Args:
            db: Session database
            conseiller_id: ID du conseiller
            
        Returns:
            Dict avec statistiques
        """
        # Total clients
        total = await self.count(db, conseiller_id=conseiller_id)
        
        # Par statut
        prospects = await self.count(
            db, 
            conseiller_id=conseiller_id,
            statut=ClientStatut.PROSPECT
        )
        actifs = await self.count(
            db,
            conseiller_id=conseiller_id,
            statut=ClientStatut.CLIENT_ACTIF
        )
        
        # Clients validés
        result = await db.execute(
            select(func.count(Client.id))
            .where(
                and_(
                    Client.conseiller_id == conseiller_id,
                    Client.validated_at.isnot(None)
                )
            )
        )
        valides = result.scalar()
        
        return {
            "total": total,
            "prospects": prospects,
            "clients_actifs": actifs,
            "clients_valides": valides
        }


# Instance singleton
crud_client = CRUDClient()