"""
Package CRUD - Opérations base de données
Import centralisé de tous les CRUD
"""

from app.crud.user import crud_user
from app.crud.client import crud_client
from app.crud.document import crud_document
from app.crud.produit import crud_produit

__all__ = [
    'crud_user',
    'crud_client',
    'crud_document',
    'crud_produit'
]