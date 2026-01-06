"""
Schemas Pydantic pour Produit - Validation des données
Gestion des produits financiers
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID

from app.models.produit import TypeProduit, StatutProduit


# ==========================================
# SCHEMAS DE BASE
# ==========================================

class ProduitBase(BaseModel):
    """Schema de base pour Produit"""
    type_produit: TypeProduit
    nom_produit: str = Field(..., min_length=1, max_length=255)
    fournisseur: str = Field(..., min_length=1, max_length=255)
    montant_investi: Optional[Decimal] = Field(None, ge=0)
    date_souscription: Optional[date] = None
    statut: StatutProduit = StatutProduit.ACTIF
    details: Optional[Dict[str, Any]] = None

    @field_validator('montant_investi')
    @classmethod
    def validate_montant(cls, v):
        """Valide le montant investi"""
        if v is not None and v < 0:
            raise ValueError("Le montant investi ne peut être négatif")
        return v


class ProduitCreate(ProduitBase):
    """Schema pour création d'un produit"""
    client_id: UUID

    @field_validator('nom_produit', 'fournisseur')
    @classmethod
    def capitalize_names(cls, v: str) -> str:
        """Capitalise les noms"""
        return v.strip().title()


class ProduitUpdate(BaseModel):
    """Schema pour mise à jour d'un produit"""
    type_produit: Optional[TypeProduit] = None
    nom_produit: Optional[str] = Field(None, min_length=1, max_length=255)
    fournisseur: Optional[str] = Field(None, min_length=1, max_length=255)
    montant_investi: Optional[Decimal] = None
    date_souscription: Optional[date] = None
    statut: Optional[StatutProduit] = None
    details: Optional[Dict[str, Any]] = None


class ProduitInDB(ProduitBase):
    """Schema pour Produit en base de données"""
    id: UUID
    client_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProduitResponse(ProduitInDB):
    """Schema pour réponse API Produit"""
    is_active: bool
    is_assurance: bool
    is_immobilier: bool

    model_config = ConfigDict(from_attributes=True)


class ProduitListResponse(BaseModel):
    """Schema pour liste de produits"""
    total: int
    produits: List[ProduitResponse]