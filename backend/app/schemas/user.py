"""
Schemas Pydantic pour User - Validation des données
Entrée/sortie API pour les utilisateurs
"""

from pydantic import BaseModel, EmailStr, field_validator, Field, ConfigDict, computed_field
from typing import Optional
from datetime import datetime
from uuid import UUID
import re

from app.models.user import UserRole


# ==========================================
# SCHEMAS DE BASE
# ==========================================

class UserBase(BaseModel):
    """Schema de base pour User"""
    email: EmailStr
    civilite: Optional[str] = Field(None, max_length=10)
    nom: str = Field(..., min_length=1, max_length=100)
    prenom: str = Field(..., min_length=1, max_length=100)
    fonction: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
    role: UserRole = UserRole.CONSEILLER
    actif: bool = True


class UserCreate(UserBase):
    """Schema pour création d'un utilisateur"""
    mot_de_passe: str = Field(..., min_length=8, max_length=100)

    @field_validator('mot_de_passe')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Valide la force du mot de passe"""
        # Minimum 8 caractères
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au minimum 8 caractères')

        # Au moins une majuscule
        if not re.search(r"[A-Z]", v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')

        # Au moins un chiffre
        if not re.search(r"\d", v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')

        # Au moins un caractère spécial
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')

        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Valide le format de l'email"""
        # Convertir en minuscules
        return v.lower()

    @field_validator('nom', 'prenom')
    @classmethod
    def validate_names(cls, v: str) -> str:
        """Valide et nettoie les noms"""
        # Supprimer espaces en trop
        v = v.strip()
        # Capitaliser
        return v.capitalize()


class UserUpdate(BaseModel):
    """Schema pour mise à jour d'un utilisateur"""
    email: Optional[EmailStr] = None
    civilite: Optional[str] = Field(None, max_length=10)
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    prenom: Optional[str] = Field(None, min_length=1, max_length=100)
    fonction: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    actif: Optional[bool] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Valide et nettoie l'email"""
        if v:
            return v.lower()
        return v

    @field_validator('nom', 'prenom')
    @classmethod
    def validate_names(cls, v: Optional[str]) -> Optional[str]:
        """Valide et nettoie les noms"""
        if v:
            return v.strip().capitalize()
        return v


class UserUpdatePassword(BaseModel):
    """Schema pour changement de mot de passe"""
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str = Field(..., min_length=8, max_length=100)

    @field_validator('nouveau_mot_de_passe')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Valide le nouveau mot de passe"""
        # Appliquer les règles de force
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au minimum 8 caractères')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        if not re.search(r"\d", v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')

        return v


class UserInDB(UserBase):
    """Schema pour User en base de données"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class UserResponse(BaseModel):
    """Schema pour réponse API User"""
    id: UUID
    email: EmailStr
    civilite: Optional[str] = None
    nom: str
    prenom: str
    fonction: Optional[str] = None
    telephone: Optional[str] = None
    role: str
    actif: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def nom_complet(self) -> str:
        """Calcule le nom complet"""
        return f"{self.prenom} {self.nom}"


# ==========================================
# SCHEMAS D'AUTHENTIFICATION
# ==========================================

class UserLogin(BaseModel):
    """Schema pour login"""
    email: EmailStr
    mot_de_passe: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Normalise l'email"""
        return v.lower()


class TokenResponse(BaseModel):
    """Schema pour réponse avec tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Secondes avant expiration
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Schema pour rafraîchissement du token"""
    refresh_token: str