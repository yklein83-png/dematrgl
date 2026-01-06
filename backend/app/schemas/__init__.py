"""
Package schemas - Validation Pydantic pour l'API
Import centralisé de tous les schemas
"""

from app.schemas.user import (
    UserBase, UserCreate, UserUpdate, UserUpdatePassword,
    UserInDB, UserResponse, UserLogin, TokenResponse, RefreshTokenRequest
)
from app.schemas.client import (
    ClientBase, ClientCreate, ClientUpdate, 
    ClientInDB, ClientResponse, ClientListResponse
)
from app.schemas.document import (
    DocumentBase, DocumentCreate, DocumentResponse,
    DocumentGenerateRequest
)
from app.schemas.produit import (
    ProduitBase, ProduitCreate, ProduitUpdate,
    ProduitInDB, ProduitResponse
)

__all__ = [
    # User schemas
    'UserBase', 'UserCreate', 'UserUpdate', 'UserUpdatePassword',
    'UserInDB', 'UserResponse', 'UserLogin', 'TokenResponse', 'RefreshTokenRequest',
    # Client schemas
    'ClientBase', 'ClientCreate', 'ClientUpdate',
    'ClientInDB', 'ClientResponse', 'ClientListResponse',
    # Document schemas
    'DocumentBase', 'DocumentCreate', 'DocumentResponse',
    'DocumentGenerateRequest',
    # Produit schemas
    'ProduitBase', 'ProduitCreate', 'ProduitUpdate',
    'ProduitInDB', 'ProduitResponse'
]