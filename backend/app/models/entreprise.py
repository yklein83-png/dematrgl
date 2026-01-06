"""
Modèle Entreprise - Configuration du cabinet/entreprise
Stocke les informations réglementaires et d'identification du cabinet
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from typing import Optional, Dict, Any

from app.database import Base


class Entreprise(Base):
    """
    Modèle Entreprise - Représente le cabinet de conseil
    Stocke toutes les informations nécessaires pour les documents réglementaires
    Il ne doit y avoir qu'une seule entreprise (singleton)
    """
    __tablename__ = "entreprise"

    # ==========================================
    # COLONNES - IDENTIFICATION
    # ==========================================

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    # Raison sociale et forme juridique
    nom = Column(String(255), nullable=False)  # Ex: LE FARE DE L'ÉPARGNE
    forme_juridique = Column(String(100), nullable=True)  # Ex: SARL, SAS, EURL
    capital = Column(String(100), nullable=True)  # Ex: 1 000 000 XPF

    # ==========================================
    # COLONNES - ADRESSE
    # ==========================================

    adresse = Column(String(255), nullable=True)
    code_postal = Column(String(10), nullable=True)
    ville = Column(String(100), nullable=True)
    pays = Column(String(100), nullable=True, default="France")

    # ==========================================
    # COLONNES - IMMATRICULATIONS
    # ==========================================

    # RCS (Registre du Commerce et des Sociétés)
    numero_rcs = Column(String(50), nullable=True)
    ville_rcs = Column(String(100), nullable=True)

    # ORIAS (Organisme pour le Registre unique des Intermédiaires)
    numero_orias = Column(String(20), nullable=True)

    # SIRET/SIREN
    siret = Column(String(14), nullable=True)
    siren = Column(String(9), nullable=True)

    # Code APE/NAF
    code_ape = Column(String(10), nullable=True)

    # TVA Intracommunautaire
    numero_tva = Column(String(20), nullable=True)

    # ==========================================
    # COLONNES - CIF (Conseiller en Investissements Financiers)
    # ==========================================

    # Association professionnelle CIF
    association_cif = Column(String(255), nullable=True)  # Ex: La Compagnie CIF
    numero_cif = Column(String(50), nullable=True)  # Ex: F-123456

    # ==========================================
    # COLONNES - ASSURANCES RCP
    # ==========================================

    # Assurance Responsabilité Civile Professionnelle
    assureur_rcp = Column(String(255), nullable=True)
    numero_contrat_rcp = Column(String(100), nullable=True)

    # ==========================================
    # COLONNES - REPRÉSENTANT LÉGAL
    # ==========================================

    representant_civilite = Column(String(10), nullable=True)  # M., Mme
    representant_nom = Column(String(100), nullable=True)
    representant_prenom = Column(String(100), nullable=True)
    representant_qualite = Column(String(100), nullable=True)  # Ex: Gérant, PDG

    # ==========================================
    # COLONNES - CONTACT
    # ==========================================

    telephone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    site_web = Column(String(255), nullable=True)

    # ==========================================
    # COLONNES - MÉDIATEUR
    # ==========================================

    mediateur_nom = Column(String(255), nullable=True)
    mediateur_adresse = Column(Text, nullable=True)
    mediateur_email = Column(String(255), nullable=True)
    mediateur_site_web = Column(String(255), nullable=True)

    # ==========================================
    # COLONNES - MÉTADONNÉES
    # ==========================================

    actif = Column(Boolean, default=True, nullable=False)

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
    # MÉTHODES
    # ==========================================

    def __repr__(self) -> str:
        return f"<Entreprise {self.nom}>"

    def to_dict(self) -> Dict[str, Any]:
        """Convertit l'objet en dictionnaire pour les templates"""
        return {
            "id": str(self.id) if self.id else None,
            # Identification
            "nom": self.nom,
            "forme_juridique": self.forme_juridique,
            "capital": self.capital,
            # Adresse
            "adresse": self.adresse,
            "code_postal": self.code_postal,
            "ville": self.ville,
            "pays": self.pays,
            # Immatriculations
            "numero_rcs": self.numero_rcs,
            "ville_rcs": self.ville_rcs,
            "numero_orias": self.numero_orias,
            "siret": self.siret,
            "siren": self.siren,
            "code_ape": self.code_ape,
            "numero_tva": self.numero_tva,
            # CIF
            "association_cif": self.association_cif,
            "numero_cif": self.numero_cif,
            # Assurance
            "assureur_rcp": self.assureur_rcp,
            "numero_contrat_rcp": self.numero_contrat_rcp,
            # Représentant légal
            "representant_civilite": self.representant_civilite,
            "representant_nom": self.representant_nom,
            "representant_prenom": self.representant_prenom,
            "representant_qualite": self.representant_qualite,
            # Contact
            "telephone": self.telephone,
            "email": self.email,
            "site_web": self.site_web,
            # Médiateur
            "mediateur_nom": self.mediateur_nom,
            "mediateur_adresse": self.mediateur_adresse,
            "mediateur_email": self.mediateur_email,
            "mediateur_site_web": self.mediateur_site_web,
            # Métadonnées
            "actif": self.actif,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_template_data(self) -> Dict[str, str]:
        """
        Retourne les données formatées pour les placeholders des templates
        Préfixe CABINET_ pour correspondre aux templates Word
        """
        return {
            "CABINET_NOM": self.nom or "",
            "CABINET_FORME_JURIDIQUE": self.forme_juridique or "",
            "CABINET_CAPITAL": self.capital or "",
            "CABINET_ADRESSE": self.adresse or "",
            "CABINET_CODE_POSTAL": self.code_postal or "",
            "CABINET_VILLE": self.ville or "",
            "CABINET_PAYS": self.pays or "",
            "CABINET_NUM_RCS": self.numero_rcs or "",
            "CABINET_VILLE_RCS": self.ville_rcs or "",
            "CABINET_NUM_ORIAS": self.numero_orias or "",
            "CABINET_SIRET": self.siret or "",
            "CABINET_SIREN": self.siren or "",
            "CABINET_CODE_APE": self.code_ape or "",
            "CABINET_NUM_TVA": self.numero_tva or "",
            "CABINET_ASSOCIATION_CIF": self.association_cif or "",
            "CABINET_NUM_CIF": self.numero_cif or "",
            "CABINET_ASSUREUR_RCP": self.assureur_rcp or "",
            "CABINET_NUM_CONTRAT_RCP": self.numero_contrat_rcp or "",
            "CABINET_REPRESENTANT_CIVILITE": self.representant_civilite or "",
            "CABINET_REPRESENTANT_NOM": self.representant_nom or "",
            "CABINET_REPRESENTANT_PRENOM": self.representant_prenom or "",
            "CABINET_REPRESENTANT_QUALITE": self.representant_qualite or "",
            "CABINET_TELEPHONE": self.telephone or "",
            "CABINET_EMAIL": self.email or "",
            "CABINET_SITE_WEB": self.site_web or "",
            "MEDIATEUR_NOM": self.mediateur_nom or "",
            "MEDIATEUR_ADRESSE": self.mediateur_adresse or "",
            "MEDIATEUR_EMAIL": self.mediateur_email or "",
            "MEDIATEUR_SITE_WEB": self.mediateur_site_web or "",
        }
