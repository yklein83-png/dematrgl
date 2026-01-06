"""
Modèle Produit - Table des produits financiers souscrits
Suivi des investissements clients
"""

from sqlalchemy import Column, String, DateTime, Date, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any
import enum

from app.database import Base


class TypeProduit(str, enum.Enum):
    """Types de produits financiers"""
    ASSURANCE_VIE = "Assurance-vie"
    SCPI = "SCPI"
    PEA = "PEA"
    COMPTE_TITRES = "Compte-titres"
    FCPI = "FCPI"
    FIP = "FIP"
    PER = "PER"
    CREDIT = "Crédit"
    AUTRE = "Autre"


class StatutProduit(str, enum.Enum):
    """Statuts possibles d'un produit"""
    ACTIF = "actif"
    CLOTURE = "cloture"
    EN_COURS = "en_cours"


class Produit(Base):
    """
    Modèle Produit - Représente un produit financier souscrit par un client
    """
    __tablename__ = "produits"
    
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
    
    # Client propriétaire
    client_id = Column(
        UUID(as_uuid=True),
        ForeignKey('clients.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Informations produit
    type_produit = Column(
        String(50),
        nullable=False,
        index=True
    )
    
    nom_produit = Column(String(255), nullable=False)
    fournisseur = Column(String(255), nullable=False)
    
    # Montants et dates
    montant_investi = Column(Numeric(15, 2))
    date_souscription = Column(Date)
    
    # Statut
    statut = Column(
        String(50),
        default=StatutProduit.ACTIF.value,
        nullable=False,
        index=True
    )
    
    # Détails flexibles (numéro contrat, options, etc.)
    details = Column(JSONB)
    
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
    
    # Relation avec le client
    client = relationship("Client", back_populates="produits")
    
    # ==========================================
    # MÉTHODES
    # ==========================================
    
    def __repr__(self) -> str:
        """Représentation string"""
        return f"<Produit {self.type_produit} - {self.nom_produit}>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertit l'objet en dictionnaire"""
        return {
            "id": str(self.id),
            "client_id": str(self.client_id),
            "type_produit": self.type_produit,
            "nom_produit": self.nom_produit,
            "fournisseur": self.fournisseur,
            "montant_investi": float(self.montant_investi) if self.montant_investi else None,
            "date_souscription": self.date_souscription.isoformat() if self.date_souscription else None,
            "statut": self.statut,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def is_active(self) -> bool:
        """Vérifie si le produit est actif"""
        return self.statut == StatutProduit.ACTIF.value
    
    @property
    def is_assurance(self) -> bool:
        """Vérifie si c'est un produit d'assurance"""
        return self.type_produit == TypeProduit.ASSURANCE_VIE.value
    
    @property
    def is_immobilier(self) -> bool:
        """Vérifie si c'est un produit immobilier"""
        return self.type_produit == TypeProduit.SCPI.value