"""
Schémas Pydantic pour l'entité Entreprise
Validation et sérialisation des données du cabinet
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class EntrepriseBase(BaseModel):
    """Schéma de base pour les données entreprise"""

    # Identification
    nom: str = Field(..., min_length=1, max_length=255, description="Nom du cabinet")
    forme_juridique: Optional[str] = Field(None, max_length=100)
    capital: Optional[str] = Field(None, max_length=100)

    # Adresse
    adresse: Optional[str] = Field(None, max_length=255)
    code_postal: Optional[str] = Field(None, max_length=10)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field("France", max_length=100)

    # Immatriculations
    numero_rcs: Optional[str] = Field(None, max_length=50)
    ville_rcs: Optional[str] = Field(None, max_length=100)
    numero_orias: Optional[str] = Field(None, max_length=20)
    siret: Optional[str] = Field(None, max_length=14)
    siren: Optional[str] = Field(None, max_length=9)
    code_ape: Optional[str] = Field(None, max_length=10)
    numero_tva: Optional[str] = Field(None, max_length=20)

    # CIF
    association_cif: Optional[str] = Field(None, max_length=255)
    numero_cif: Optional[str] = Field(None, max_length=50)

    # Assurance RCP
    assureur_rcp: Optional[str] = Field(None, max_length=255)
    numero_contrat_rcp: Optional[str] = Field(None, max_length=100)

    # Représentant légal
    representant_civilite: Optional[str] = Field(None, max_length=10)
    representant_nom: Optional[str] = Field(None, max_length=100)
    representant_prenom: Optional[str] = Field(None, max_length=100)
    representant_qualite: Optional[str] = Field(None, max_length=100)

    # Contact
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    site_web: Optional[str] = Field(None, max_length=255)

    # Médiateur
    mediateur_nom: Optional[str] = Field(None, max_length=255)
    mediateur_adresse: Optional[str] = None
    mediateur_email: Optional[str] = Field(None, max_length=255)
    mediateur_site_web: Optional[str] = Field(None, max_length=255)


class EntrepriseCreate(EntrepriseBase):
    """Schéma pour la création d'une entreprise"""
    pass


class EntrepriseUpdate(BaseModel):
    """Schéma pour la mise à jour d'une entreprise (tous les champs optionnels)"""

    # Identification
    nom: Optional[str] = Field(None, min_length=1, max_length=255)
    forme_juridique: Optional[str] = Field(None, max_length=100)
    capital: Optional[str] = Field(None, max_length=100)

    # Adresse
    adresse: Optional[str] = Field(None, max_length=255)
    code_postal: Optional[str] = Field(None, max_length=10)
    ville: Optional[str] = Field(None, max_length=100)
    pays: Optional[str] = Field(None, max_length=100)

    # Immatriculations
    numero_rcs: Optional[str] = Field(None, max_length=50)
    ville_rcs: Optional[str] = Field(None, max_length=100)
    numero_orias: Optional[str] = Field(None, max_length=20)
    siret: Optional[str] = Field(None, max_length=14)
    siren: Optional[str] = Field(None, max_length=9)
    code_ape: Optional[str] = Field(None, max_length=10)
    numero_tva: Optional[str] = Field(None, max_length=20)

    # CIF
    association_cif: Optional[str] = Field(None, max_length=255)
    numero_cif: Optional[str] = Field(None, max_length=50)

    # Assurance RCP
    assureur_rcp: Optional[str] = Field(None, max_length=255)
    numero_contrat_rcp: Optional[str] = Field(None, max_length=100)

    # Représentant légal
    representant_civilite: Optional[str] = Field(None, max_length=10)
    representant_nom: Optional[str] = Field(None, max_length=100)
    representant_prenom: Optional[str] = Field(None, max_length=100)
    representant_qualite: Optional[str] = Field(None, max_length=100)

    # Contact
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    site_web: Optional[str] = Field(None, max_length=255)

    # Médiateur
    mediateur_nom: Optional[str] = Field(None, max_length=255)
    mediateur_adresse: Optional[str] = None
    mediateur_email: Optional[str] = Field(None, max_length=255)
    mediateur_site_web: Optional[str] = Field(None, max_length=255)


class EntrepriseResponse(EntrepriseBase):
    """Schéma de réponse pour une entreprise"""

    id: UUID
    actif: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EntrepriseTemplateData(BaseModel):
    """Données formatées pour les templates Word"""

    CABINET_NOM: str = ""
    CABINET_FORME_JURIDIQUE: str = ""
    CABINET_CAPITAL: str = ""
    CABINET_ADRESSE: str = ""
    CABINET_CODE_POSTAL: str = ""
    CABINET_VILLE: str = ""
    CABINET_PAYS: str = ""
    CABINET_NUM_RCS: str = ""
    CABINET_VILLE_RCS: str = ""
    CABINET_NUM_ORIAS: str = ""
    CABINET_SIRET: str = ""
    CABINET_SIREN: str = ""
    CABINET_CODE_APE: str = ""
    CABINET_NUM_TVA: str = ""
    CABINET_ASSOCIATION_CIF: str = ""
    CABINET_NUM_CIF: str = ""
    CABINET_ASSUREUR_RCP: str = ""
    CABINET_NUM_CONTRAT_RCP: str = ""
    CABINET_REPRESENTANT_CIVILITE: str = ""
    CABINET_REPRESENTANT_NOM: str = ""
    CABINET_REPRESENTANT_PRENOM: str = ""
    CABINET_REPRESENTANT_QUALITE: str = ""
    CABINET_TELEPHONE: str = ""
    CABINET_EMAIL: str = ""
    CABINET_SITE_WEB: str = ""
    MEDIATEUR_NOM: str = ""
    MEDIATEUR_ADRESSE: str = ""
    MEDIATEUR_EMAIL: str = ""
    MEDIATEUR_SITE_WEB: str = ""
