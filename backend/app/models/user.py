"""
Modèle User - Table des utilisateurs (conseillers et admins)
Conforme aux exigences AMF/ACPR pour la traçabilité
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime
import enum
from typing import Optional, Dict, Any

from app.database import Base


class UserRole(str, enum.Enum):
    """Énumération des rôles utilisateurs autorisés"""
    ADMIN = "admin"
    CONSEILLER = "conseiller"


class User(Base):
    """
    Modèle User - Représente un utilisateur du système
    Peut être un conseiller ou un administrateur
    """
    __tablename__ = "users"
    
    # ==========================================
    # COLONNES
    # ==========================================
    
    # Identifiant unique
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        index=True
    )
    
    # Email unique pour connexion
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Informations personnelles
    civilite = Column(String(10), nullable=True)  # M., Mme
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    fonction = Column(String(100), nullable=True)  # Ex: Conseiller en gestion de patrimoine
    telephone = Column(String(20), nullable=True)

    # Sécurité
    mot_de_passe_hash = Column(String(255), nullable=False)
    
    # Rôle (admin ou conseiller uniquement)
    role = Column(
        String(50),
        nullable=False,
        default=UserRole.CONSEILLER.value,
        index=True
    )
    
    # Statut du compte
    actif = Column(Boolean, default=True, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    # ==========================================
    # RELATIONS
    # ==========================================
    
    # Un conseiller peut avoir plusieurs clients
    clients = relationship(
        "Client",
        back_populates="conseiller",
        foreign_keys="Client.conseiller_id",
        cascade="all, delete-orphan"
    )
    
    # Un user peut générer plusieurs documents
    documents_generes = relationship(
        "Document",
        back_populates="generateur",
        foreign_keys="Document.genere_par"
    )
    
    # Un user peut valider des clients
    clients_valides = relationship(
        "Client",
        back_populates="validateur",
        foreign_keys="Client.validated_by"
    )
    
    # Logs d'audit
    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # ==========================================
    # MÉTHODES
    # ==========================================
    
    def __repr__(self) -> str:
        """Représentation string de l'objet"""
        return f"<User {self.email} - {self.role}>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convertit l'objet en dictionnaire
        Exclut le mot de passe pour sécurité
        """
        return {
            "id": str(self.id),
            "email": self.email,
            "civilite": self.civilite,
            "nom": self.nom,
            "prenom": self.prenom,
            "fonction": self.fonction,
            "telephone": self.telephone,
            "role": self.role,
            "actif": self.actif,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def to_template_data(self) -> Dict[str, str]:
        """
        Retourne les données formatées pour les placeholders des templates
        Préfixe CONSEILLER_ pour correspondre aux templates Word
        """
        return {
            "CONSEILLER_CIVILITE": self.civilite or "",
            "CONSEILLER_NOM": self.nom or "",
            "CONSEILLER_PRENOM": self.prenom or "",
            "CONSEILLER_NOM_COMPLET": self.nom_complet,
            "CONSEILLER_FONCTION": self.fonction or "",
            "CONSEILLER_EMAIL": self.email or "",
            "CONSEILLER_TELEPHONE": self.telephone or "",
        }
    
    @property
    def nom_complet(self) -> str:
        """Retourne le nom complet de l'utilisateur"""
        return f"{self.prenom} {self.nom}"
    
    @property
    def is_admin(self) -> bool:
        """Vérifie si l'utilisateur est admin"""
        return self.role == UserRole.ADMIN.value
    
    @property
    def is_active(self) -> bool:
        """Vérifie si le compte est actif"""
        return self.actif