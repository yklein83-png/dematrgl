"""
Module de sécurité - Gestion JWT et hash des mots de passe
Conforme aux exigences de sécurité AMF/ACPR
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import bcrypt
import secrets
import string
import re

from app.config import settings


# ==========================================
# FONCTIONS HASH PASSWORD
# ==========================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie qu'un mot de passe correspond à son hash

    Args:
        plain_password: Mot de passe en clair
        hashed_password: Hash bcrypt du mot de passe

    Returns:
        True si le mot de passe correspond
    """
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def get_password_hash(password: str) -> str:
    """
    Hash un mot de passe avec bcrypt

    Args:
        password: Mot de passe en clair

    Returns:
        Hash bcrypt du mot de passe
    """
    salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Valide la force d'un mot de passe selon les règles AMF/ACPR
    
    Règles:
        - Minimum 8 caractères
        - Au moins 1 majuscule
        - Au moins 1 chiffre
        - Au moins 1 caractère spécial
    
    Args:
        password: Mot de passe à valider
        
    Returns:
        (valide, message_erreur)
    """
    # Vérifier longueur minimale
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        return False, f"Le mot de passe doit contenir au minimum {settings.PASSWORD_MIN_LENGTH} caractères"
    
    # Vérifier majuscule
    if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r"[A-Z]", password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    
    # Vérifier chiffre
    if settings.PASSWORD_REQUIRE_NUMBER and not re.search(r"\d", password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    
    # Vérifier caractère spécial
    if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", password):
        return False, "Le mot de passe doit contenir au moins un caractère spécial"
    
    return True, "Mot de passe valide"


# ==========================================
# FONCTIONS JWT
# ==========================================

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crée un token JWT d'accès
    
    Args:
        data: Données à encoder dans le token (user_id, email, role)
        expires_delta: Durée de validité du token
        
    Returns:
        Token JWT encodé
    """
    to_encode = data.copy()
    
    # Définir l'expiration
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Ajouter les claims standards
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    # Encoder le token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crée un token JWT de rafraîchissement
    
    Args:
        data: Données à encoder (user_id uniquement)
        
    Returns:
        Token JWT refresh encodé
    """
    to_encode = data.copy()
    
    # Expiration plus longue pour le refresh token
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Ajouter les claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    # Encoder le token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Décode et vérifie un token JWT
    
    Args:
        token: Token JWT à décoder
        
    Returns:
        Payload décodé ou None si invalide
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def generate_secure_password(length: int = 12) -> str:
    """
    Génère un mot de passe sécurisé aléatoire
    
    Args:
        length: Longueur du mot de passe (minimum 8)
        
    Returns:
        Mot de passe sécurisé
    """
    if length < 8:
        length = 8
    
    # Caractères à utiliser
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    
    # Générer le mot de passe
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    # S'assurer qu'il respecte les règles
    while not validate_password_strength(password)[0]:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    return password