"""
CRUD operations pour User
Create, Read, Update, Delete avec SQLAlchemy async
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser:
    """
    Classe CRUD pour les opérations User
    Toutes les méthodes sont async pour PostgreSQL
    """
    
    # ==========================================
    # CREATE
    # ==========================================
    
    async def create(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: UserCreate
    ) -> User:
        """
        Créer un nouvel utilisateur
        
        Args:
            db: Session database
            obj_in: Données de création
            
        Returns:
            User créé
        """
        # Hash du mot de passe
        hashed_password = get_password_hash(obj_in.mot_de_passe)
        
        # Créer l'objet User
        db_obj = User(
            email=obj_in.email.lower(),
            nom=obj_in.nom,
            prenom=obj_in.prenom,
            mot_de_passe_hash=hashed_password,
            role=obj_in.role,
            actif=obj_in.actif
        )
        
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
    ) -> Optional[User]:
        """
        Récupérer un utilisateur par ID
        
        Args:
            db: Session database
            id: ID de l'utilisateur
            
        Returns:
            User ou None si non trouvé
        """
        result = await db.execute(
            select(User).where(User.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(
        self, 
        db: AsyncSession, 
        *, 
        email: str
    ) -> Optional[User]:
        """
        Récupérer un utilisateur par email
        
        Args:
            db: Session database
            email: Email de l'utilisateur
            
        Returns:
            User ou None si non trouvé
        """
        result = await db.execute(
            select(User).where(
                func.lower(User.email) == func.lower(email)
            )
        )
        return result.scalar_one_or_none()
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        only_active: bool = False,
        role: Optional[str] = None
    ) -> List[User]:
        """
        Récupérer plusieurs utilisateurs avec pagination
        
        Args:
            db: Session database
            skip: Nombre d'enregistrements à ignorer
            limit: Nombre maximum de résultats
            only_active: Filtrer uniquement les actifs
            role: Filtrer par rôle
            
        Returns:
            Liste de Users
        """
        query = select(User)
        
        # Filtres optionnels
        conditions = []
        if only_active:
            conditions.append(User.actif == True)
        if role:
            conditions.append(User.role == role)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Ordre et pagination
        query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def count(
        self,
        db: AsyncSession,
        *,
        only_active: bool = False,
        role: Optional[str] = None
    ) -> int:
        """
        Compter le nombre d'utilisateurs
        
        Args:
            db: Session database
            only_active: Compter uniquement les actifs
            role: Filtrer par rôle
            
        Returns:
            Nombre d'utilisateurs
        """
        query = select(func.count(User.id))
        
        conditions = []
        if only_active:
            conditions.append(User.actif == True)
        if role:
            conditions.append(User.role == role)
        
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
        db_obj: User,
        obj_in: UserUpdate
    ) -> User:
        """
        Mettre à jour un utilisateur
        
        Args:
            db: Session database
            db_obj: User existant
            obj_in: Données de mise à jour
            
        Returns:
            User mis à jour
        """
        # Mettre à jour uniquement les champs fournis
        update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def update_password(
        self,
        db: AsyncSession,
        *,
        user: User,
        new_password: str
    ) -> bool:
        """
        Mettre à jour le mot de passe d'un utilisateur
        
        Args:
            db: Session database
            user: User existant
            new_password: Nouveau mot de passe en clair
            
        Returns:
            True si succès
        """
        user.mot_de_passe_hash = get_password_hash(new_password)
        db.add(user)
        await db.commit()
        return True
    
    async def authenticate(
        self,
        db: AsyncSession,
        *,
        email: str,
        password: str
    ) -> Optional[User]:
        """
        Authentifier un utilisateur
        
        Args:
            db: Session database
            email: Email
            password: Mot de passe en clair
            
        Returns:
            User si authentification réussie, None sinon
        """
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.mot_de_passe_hash):
            return None
        if not user.actif:
            return None
        return user
    
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
        Supprimer un utilisateur (soft delete)
        
        Args:
            db: Session database
            id: ID de l'utilisateur
            
        Returns:
            True si supprimé, False si non trouvé
        """
        user = await self.get(db, id=id)
        if user:
            # Soft delete - on désactive seulement
            user.actif = False
            db.add(user)
            await db.commit()
            return True
        return False


# Instance singleton
crud_user = CRUDUser()