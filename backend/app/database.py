"""
Configuration de la base de données PostgreSQL
Utilisation de SQLAlchemy 2.0 avec support async
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from typing import AsyncGenerator
import logging
from app.config import settings

# Logger
logger = logging.getLogger(__name__)

# ==========================================
# CONFIGURATION ENGINE
# ==========================================

# Paramètres de connexion selon l'environnement
if settings.ENVIRONMENT == 'testing':
    # Pool null pour les tests
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DATABASE_ECHO,
        poolclass=NullPool,
    )
else:
    # Pool normal pour dev/prod
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DATABASE_ECHO,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,  # Vérifier connexion avant utilisation
        pool_recycle=3600,   # Recycler connexions après 1h
    )

# ==========================================
# SESSION FACTORY
# ==========================================

# Factory pour créer des sessions async
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# ==========================================
# BASE MODEL
# ==========================================

# Base pour tous les modèles SQLAlchemy
Base = declarative_base()

# Metadata pour les migrations
metadata = Base.metadata

# ==========================================
# DEPENDENCY INJECTION
# ==========================================

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Générateur de session de base de données
    À utiliser comme dépendance FastAPI
    
    Usage:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Erreur database session: {str(e)}")
            raise
        finally:
            await session.close()

# ==========================================
# HELPERS
# ==========================================

async def init_db():
    """
    Initialise la base de données
    Crée les tables si elles n'existent pas
    """
    async with engine.begin() as conn:
        # En production, utiliser Alembic pour les migrations
        # Cette fonction est pour le développement uniquement
        if settings.ENVIRONMENT == 'development':
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Tables créées avec succès")

async def close_db():
    """
    Ferme proprement les connexions à la base de données
    """
    await engine.dispose()
    logger.info("Connexions database fermées")

async def check_db_connection() -> bool:
    """
    Vérifie la connexion à la base de données
    Retourne True si la connexion est établie, False sinon
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Erreur de connexion à la base de données: {str(e)}")
        return False