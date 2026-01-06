"""
Configuration centralisée de l'application Fare Epargne
Gestion des variables d'environnement et paramètres
"""

from typing import List, Optional, ClassVar, Dict, Tuple
from pydantic import BaseModel, field_validator
from pydantic_settings import BaseSettings
from decouple import config
import os
from functools import lru_cache


class Settings(BaseSettings):
    """Configuration principale de l'application"""

    # ==========================================
    # APPLICATION
    # ==========================================
    APP_NAME: str = config('APP_NAME', default='Fare Epargne - Gestion Patrimoine')
    APP_TITLE: str = config('APP_TITLE', default='Fare Epargne API')
    APP_DESCRIPTION: str = config('APP_DESCRIPTION', default='API de gestion patrimoniale - AMF/ACPR')
    APP_VERSION: str = config('APP_VERSION', default='1.0.0')
    API_PREFIX: str = config('API_PREFIX', default='/api/v1')
    ENVIRONMENT: str = config('ENVIRONMENT', default='development')
    DEBUG: bool = config('DEBUG', default=True, cast=bool)
    TIMEZONE: str = config('TIMEZONE', default='Pacific/Tahiti')
    
    # ==========================================
    # SECURITY
    # ==========================================
    SECRET_KEY: str = config('SECRET_KEY', default='CHANGE_ME_IN_PRODUCTION_USE_STRONG_SECRET_KEY_MIN_32_CHARS')
    JWT_ALGORITHM: str = config('JWT_ALGORITHM', default='HS256')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config('ACCESS_TOKEN_EXPIRE_MINUTES', default=30, cast=int)
    REFRESH_TOKEN_EXPIRE_DAYS: int = config('REFRESH_TOKEN_EXPIRE_DAYS', default=7, cast=int)
    
    # Hash bcrypt rounds
    BCRYPT_ROUNDS: int = 12
    
    # ==========================================
    # DATABASE
    # ==========================================
    DATABASE_URL: str = config(
        'DATABASE_URL',
        default='postgresql+asyncpg://fare_admin:FareEpargne2025!Secure@postgres:5432/fare_epargne'
    )
    DATABASE_POOL_SIZE: int = config('DATABASE_POOL_SIZE', default=20, cast=int)
    DATABASE_MAX_OVERFLOW: int = config('DATABASE_MAX_OVERFLOW', default=40, cast=int)
    DATABASE_ECHO: bool = config('DATABASE_ECHO', default=False, cast=bool)
    
    # ==========================================
    # REDIS CACHE
    # ==========================================
    REDIS_URL: str = config('REDIS_URL', default='redis://:FareRedis2025!Secure@redis:6379/0')
    REDIS_TTL_SECONDS: int = config('REDIS_TTL_SECONDS', default=3600, cast=int)
    
    # ==========================================
    # CORS
    # ==========================================
    BACKEND_CORS_ORIGINS: List[str] = config(
        'CORS_ORIGINS',
        default='http://localhost:5173,http://localhost:3000,http://localhost',
        cast=lambda v: [item.strip() for item in v.split(',')]
    )
    CORS_ALLOW_CREDENTIALS: bool = config('CORS_ALLOW_CREDENTIALS', default=True, cast=bool)
    CORS_ALLOW_METHODS: ClassVar[List[str]] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    CORS_ALLOW_HEADERS: ClassVar[List[str]] = ['Content-Type', 'Authorization', 'X-Requested-With']
    
    # ==========================================
    # LOGGING
    # ==========================================
    LOG_LEVEL: str = config('LOG_LEVEL', default='INFO')
    LOG_FILE: str = config('LOG_FILE', default='/app/logs/fare_epargne.log')
    
    # ==========================================
    # DOCUMENTS
    # ==========================================
    DOCX_TEMPLATE_PATH: str = config('DOCX_TEMPLATE_PATH', default='/app/templates')
    EXPORT_PATH: str = config('EXPORT_PATH', default='/app/exports')
    MAX_FILE_SIZE_MB: int = config('MAX_FILE_SIZE_MB', default=10, cast=int)
    
    # Extensions autorisées pour upload
    ALLOWED_EXTENSIONS: List[str] = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png']
    
    # ==========================================
    # NUMERO CLIENT
    # ==========================================
    CLIENT_NUMBER_PREFIX: str = 'FAR'
    CLIENT_NUMBER_YEAR: int = 2025
    CLIENT_NUMBER_START: int = 1
    
    # ==========================================
    # VALIDATION MÉTIER
    # ==========================================
    # Mot de passe
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_NUMBER: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True
    
    # Profil de risque - Seuils de score
    PROFIL_RISQUE_SEUILS: ClassVar[Dict[str, Tuple[int, int]]] = {
        'Sécuritaire': (0, 25),
        'Prudent': (26, 50),
        'Equilibré': (51, 75),
        'Dynamique': (76, 100)
    }
    
    # LCB-FT - Critères de classification
    LCB_FT_CRITERES: ClassVar[Dict] = {
        'montant_eleve': 500000,  # XPF
        'pays_risque': ['Corée du Nord', 'Iran', 'Syrie'],
        'ppe_risque_eleve': True
    }
    
    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v, info):
        """Valide que la clé secrète est suffisamment forte"""
        if len(v) < 32:
            raise ValueError('SECRET_KEY doit faire au minimum 32 caractères')
        if v == 'CHANGE_ME_IN_PRODUCTION_USE_STRONG_SECRET_KEY_MIN_32_CHARS':
            # Note: info.data permet d'accéder aux autres champs
            environment = info.data.get('ENVIRONMENT', 'development')
            if environment == 'production':
                raise ValueError('SECRET_KEY par défaut interdite en production')
        return v

    model_config = {
        'env_file': '.env',
        'case_sensitive': True
    }


@lru_cache()
def get_settings() -> Settings:
    """
    Retourne l'instance Settings en cache
    Utiliser cette fonction pour accéder à la configuration
    """
    return Settings()


# Instance globale pour import direct si nécessaire
settings = get_settings()