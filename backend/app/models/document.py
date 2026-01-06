"""
Modèle Document - Table des documents générés
Gestion des documents DOCX et exports CSV
"""

from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import enum
import os

from app.database import Base


class TypeDocument(str, enum.Enum):
    """Types de documents autorisés - Alignés avec le frontend"""
    DER = "DER"  # Document d'Entrée en Relation
    QCC = "QCC"  # Questionnaire Connaissance Client (ex-KYC)
    PROFIL_RISQUE = "PROFIL_RISQUE"  # Profil de Risque client
    LETTRE_MISSION = "LETTRE_MISSION"  # Lettre de Mission CIF
    DECLARATION_ADEQUATION = "DECLARATION_ADEQUATION"  # Déclaration d'Adéquation
    CONVENTION_RTO = "CONVENTION_RTO"  # Réception Transmission d'Ordres
    RAPPORT_IAS = "RAPPORT_IAS"  # Rapport Conseil IAS
    EXPORT_CSV = "EXPORT_CSV"  # Export Harvest CRM
    # Anciens noms pour rétrocompatibilité
    KYC = "KYC"  # Alias vers QCC
    LETTRE_MISSION_CIF = "LETTRE_MISSION_CIF"  # Alias
    DECLARATION_ADEQUATION_CIF = "DECLARATION_ADEQUATION_CIF"  # Alias
    RAPPORT_CONSEIL_IAS = "RAPPORT_CONSEIL_IAS"  # Alias


class Document(Base):
    """
    Modèle Document - Représente un document généré pour un client
    Traçabilité complète pour conformité AMF/ACPR
    """
    __tablename__ = "documents"
    
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
    
    # Client concerné
    client_id = Column(
        UUID(as_uuid=True),
        ForeignKey('clients.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Type de document (enum strict)
    type_document = Column(
        String(50),
        nullable=False,
        index=True
    )
    
    # Informations fichier
    nom_fichier = Column(String(255), nullable=False)
    chemin_fichier = Column(Text, nullable=False)
    taille_octets = Column(Integer)
    hash_fichier = Column(String(64))  # SHA-256 pour intégrité
    
    # Génération
    genere_par = Column(
        UUID(as_uuid=True),
        ForeignKey('users.id'),
        index=True
    )
    date_generation = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    
    # Signature
    date_signature = Column(DateTime(timezone=True))
    signe = Column(Boolean, default=False, nullable=False, index=True)

    # Métadonnées flexibles (version template, paramètres, etc.)
    doc_metadata = Column(JSONB)
    
    # Timestamp création
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    # ==========================================
    # RELATIONS
    # ==========================================
    
    # Relation avec le client
    client = relationship("Client", back_populates="documents")
    
    # Relation avec l'utilisateur qui a généré
    generateur = relationship("User", back_populates="documents_generes")
    
    # ==========================================
    # MÉTHODES
    # ==========================================
    
    def __repr__(self) -> str:
        """Représentation string"""
        return f"<Document {self.type_document} - {self.nom_fichier}>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertit l'objet en dictionnaire"""
        return {
            "id": str(self.id),
            "client_id": str(self.client_id),
            "type_document": self.type_document,
            "nom_fichier": self.nom_fichier,
            "chemin_fichier": self.chemin_fichier,
            "taille_octets": self.taille_octets,
            "hash_fichier": self.hash_fichier,
            "genere_par": str(self.genere_par) if self.genere_par else None,
            "date_generation": self.date_generation.isoformat() if self.date_generation else None,
            "date_signature": self.date_signature.isoformat() if self.date_signature else None,
            "signe": self.signe,
            "metadata": self.doc_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
    @property
    def is_signed(self) -> bool:
        """Vérifie si le document est signé"""
        return self.signe and self.date_signature is not None
    
    @property
    def file_exists(self) -> bool:
        """Vérifie si le fichier existe physiquement"""
        return os.path.exists(self.chemin_fichier) if self.chemin_fichier else False
    
    @property
    def extension(self) -> str:
        """Retourne l'extension du fichier"""
        if self.nom_fichier:
            return os.path.splitext(self.nom_fichier)[1]
        return ""
    
    @property
    def is_docx(self) -> bool:
        """Vérifie si c'est un document Word"""
        return self.extension.lower() == '.docx'
    
    @property
    def is_csv(self) -> bool:
        """Vérifie si c'est un export CSV"""
        return self.type_document == TypeDocument.EXPORT_CSV.value

