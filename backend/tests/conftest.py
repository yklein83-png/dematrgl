"""
Configuration pytest pour les tests backend
Fixtures et configuration globale
"""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import MagicMock, AsyncMock
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.core.deps import get_session, get_current_user
from app.config import settings


# ==========================================
# CONFIGURATION PYTEST
# ==========================================

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Créer une boucle d'événements pour les tests async"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ==========================================
# BASE DE DONNÉES DE TEST (SQLite en mémoire)
# ==========================================

# Moteur SQLite async en mémoire pour les tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Fixture pour créer une session de base de données de test
    Crée les tables avant chaque test et les supprime après
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ==========================================
# CLIENT HTTP DE TEST
# ==========================================

@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Client HTTP async pour tester les endpoints API
    """
    # Override la dépendance de base de données
    async def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_db] = override_get_session

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    # Nettoyer les overrides
    app.dependency_overrides.clear()


# ==========================================
# FIXTURES UTILISATEUR
# ==========================================

@pytest.fixture
def mock_user():
    """Mock d'un utilisateur standard"""
    from uuid import uuid4
    from datetime import datetime

    user = MagicMock()
    user.id = uuid4()
    user.email = "test@fareepargne.pf"
    user.nom = "Dupont"
    user.prenom = "Jean"
    user.nom_complet = "Jean Dupont"
    user.role = "conseiller"
    user.actif = True
    user.is_active = True
    user.is_admin = False
    user.created_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()
    return user


@pytest.fixture
def mock_admin_user(mock_user):
    """Mock d'un utilisateur admin"""
    mock_user.role = "admin"
    mock_user.is_admin = True
    return mock_user


@pytest_asyncio.fixture
async def authenticated_client(client: AsyncClient, mock_user) -> AsyncClient:
    """
    Client HTTP avec authentification simulée
    """
    async def override_get_current_user():
        return mock_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    # Ne pas clear ici, sera fait par le fixture client


# ==========================================
# FIXTURES CLIENT (DONNÉES MÉTIER)
# ==========================================

@pytest.fixture
def mock_client_minimal():
    """Mock d'un client avec données minimales"""
    client = MagicMock()
    client.id = None
    client.numero_client = "FAR-2025-001"

    # Données requises minimales
    client.t1_civilite = "M."
    client.t1_nom = "Martin"
    client.t1_prenom = "Pierre"

    # Valeurs par défaut pour éviter les erreurs
    client.horizon_placement = None
    client.tolerance_risque = None
    client.pertes_maximales_acceptables = None
    client.patrimoine_global = None
    client.liquidite_importante = False

    # KYC
    client.kyc_portefeuille_experience_pro = False
    client.kyc_portefeuille_gestion_personnelle = False
    client.kyc_derives_detention = False
    client.kyc_structures_detention = False
    client.kyc_culture_presse_financiere = False
    client.kyc_culture_suivi_bourse = False

    # LCB-FT
    client.lcb_ft_ppe = False
    client.lcb_ft_ppe_famille = False
    client.t1_us_person = False
    client.t2_us_person = False
    client.t1_residence_fiscale = "France"
    client.t1_residence_fiscale_autre = None
    client.origine_economique_gains_jeu = False
    client.origine_economique_cession_pro = False
    client.origine_economique_autres = False
    client.lcb_ft_justificatifs = False
    client.origine_fonds_montant_prevu = None
    client.t1_profession = "Employé"
    client.t1_chef_entreprise = False
    client.t1_entreprise_forme_juridique = None

    return client


@pytest.fixture
def mock_client_dynamique(mock_client_minimal):
    """Mock d'un client avec profil Dynamique"""
    client = mock_client_minimal

    # Horizon long terme = 25 points
    client.horizon_placement = "Plus de 8 ans"

    # Tolérance élevée = 20 points
    client.tolerance_risque = "Élevé - Dynamique"

    # Pertes 50% = 15 points
    client.pertes_maximales_acceptables = "50%"

    # Expérience = 15 points
    client.kyc_portefeuille_experience_pro = True
    client.kyc_portefeuille_gestion_personnelle = True
    client.kyc_derives_detention = True
    client.kyc_culture_presse_financiere = True
    client.kyc_culture_suivi_bourse = True

    # Patrimoine élevé = 10 points
    client.patrimoine_global = "Plus de 5000000 XPF"

    # Pas besoin de liquidité = 5 points
    client.liquidite_importante = False

    return client


@pytest.fixture
def mock_client_securitaire(mock_client_minimal):
    """Mock d'un client avec profil Sécuritaire"""
    client = mock_client_minimal

    # Court terme = 5 points
    client.horizon_placement = "Moins de 2 ans"

    # Très faible tolérance = 3 points
    client.tolerance_risque = "Très faible - Sécuritaire"

    # Aucune perte = 0 points
    client.pertes_maximales_acceptables = "Aucune perte"

    # Pas d'expérience = 0 points
    client.kyc_portefeuille_experience_pro = False

    # Besoin de liquidité = 0 points
    client.liquidite_importante = True

    return client


@pytest.fixture
def mock_client_ppe(mock_client_minimal):
    """Mock d'un client PPE (risque LCB-FT élevé)"""
    client = mock_client_minimal

    # PPE = +3 facteurs
    client.lcb_ft_ppe = True

    # US Person = +2 facteurs
    client.t1_us_person = True

    # Total >= 5 = Élevé
    return client


@pytest.fixture
def mock_client_standard_lcb(mock_client_minimal):
    """Mock d'un client avec risque LCB-FT standard"""
    client = mock_client_minimal

    # Résidence hors France = +1
    client.t1_residence_fiscale = "Nouvelle-Calédonie"

    # Total = 1 = Standard
    return client


# ==========================================
# FIXTURES REDIS MOCK
# ==========================================

@pytest.fixture
def mock_redis():
    """Mock du client Redis"""
    redis = AsyncMock()
    redis.setex = AsyncMock(return_value=True)
    redis.exists = AsyncMock(return_value=0)
    redis.get = AsyncMock(return_value=None)
    redis.delete = AsyncMock(return_value=1)
    redis.keys = AsyncMock(return_value=[])
    redis.incr = AsyncMock(return_value=1)
    redis.expire = AsyncMock(return_value=True)
    return redis


# ==========================================
# HELPERS
# ==========================================

def create_test_token(user_id: str, role: str = "conseiller") -> str:
    """Créer un token JWT de test"""
    from app.core.security import create_access_token
    return create_access_token(
        data={"sub": user_id, "email": "test@test.com", "role": role}
    )
