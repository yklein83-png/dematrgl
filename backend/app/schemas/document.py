"""
Schemas Pydantic pour Document - Validation des données
Génération et gestion des documents DOCX
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from app.models.document import TypeDocument


# ==========================================
# SCHEMAS DE BASE
# ==========================================

class DocumentBase(BaseModel):
    """Schema de base pour Document"""
    type_document: TypeDocument
    nom_fichier: str = Field(..., min_length=1, max_length=255)
    chemin_fichier: str
    taille_octets: Optional[int] = None
    hash_fichier: Optional[str] = Field(None, max_length=64)
    metadata: Optional[Dict[str, Any]] = None


class DocumentCreate(BaseModel):
    """Schema pour création d'un document"""
    client_id: UUID
    type_document: TypeDocument
    metadata: Optional[Dict[str, Any]] = None

    @field_validator('type_document')
    @classmethod
    def validate_type(cls, v):
        """Valide le type de document"""
        if v not in [t.value for t in TypeDocument]:
            raise ValueError(f"Type de document invalide: {v}")
        return v


class DocumentResponse(BaseModel):
    """Schema pour réponse API Document"""
    id: UUID
    client_id: UUID
    type_document: str
    nom_fichier: str
    chemin_fichier: str
    taille_octets: Optional[int] = None
    hash_fichier: Optional[str] = None
    genere_par: Optional[UUID] = None
    date_generation: datetime
    date_signature: Optional[datetime] = None
    signe: bool
    doc_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    is_signed: bool
    file_exists: bool
    extension: str
    is_docx: bool
    is_csv: bool

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS GÉNÉRATION DOCUMENTS
# ==========================================

class DocumentGenerateRequest(BaseModel):
    """Schema pour demande de génération de document"""
    client_id: UUID
    type_document: TypeDocument
    
    # Options spécifiques selon le type
    include_titulaire_2: Optional[bool] = True
    include_patrimoine_detail: Optional[bool] = True
    include_produits: Optional[bool] = True
    
    # Métadonnées additionnelles
    metadata: Optional[Dict[str, Any]] = None


class DocumentGenerateResponse(BaseModel):
    """Schema pour réponse de génération"""
    success: bool
    message: str
    document_id: Optional[UUID] = None
    download_url: Optional[str] = None
    filename: Optional[str] = None


class DocumentBulkGenerateRequest(BaseModel):
    """Schema pour génération multiple de documents"""
    client_id: UUID
    types_documents: list[TypeDocument]

    @field_validator('types_documents')
    @classmethod
    def validate_types(cls, v):
        """Valide qu'au moins un type est demandé"""
        if not v:
            raise ValueError("Au moins un type de document requis")
        return v


class DocumentDownloadResponse(BaseModel):
    """Schema pour téléchargement de document"""
    filename: str
    content_type: str
    file_size: int
    download_url: str