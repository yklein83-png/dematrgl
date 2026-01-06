"""
Tests d'authentification
Login, logout, refresh token, validation
"""

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta
from uuid import uuid4

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
    get_password_hash,
    validate_password_strength
)


class TestPasswordHashing:
    """Tests du hashing de mots de passe"""

    @pytest.mark.unit
    def test_hash_password(self):
        """Test que le hash est différent du mot de passe"""
        password = "MonMotDePasse123!"
        hashed = get_password_hash(password)

        assert hashed != password
        assert len(hashed) > 50  # bcrypt hash est long

    @pytest.mark.unit
    def test_verify_password_correct(self):
        """Test vérification mot de passe correct"""
        password = "MonMotDePasse123!"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    @pytest.mark.unit
    def test_verify_password_incorrect(self):
        """Test vérification mot de passe incorrect"""
        password = "MonMotDePasse123!"
        hashed = get_password_hash(password)

        assert verify_password("MauvaisMotDePasse!", hashed) is False

    @pytest.mark.unit
    def test_hash_unique_each_time(self):
        """Test que chaque hash est unique (salt différent)"""
        password = "MonMotDePasse123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        assert hash1 != hash2
        # Mais les deux doivent vérifier
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestPasswordValidation:
    """Tests de validation de force de mot de passe"""

    @pytest.mark.unit
    def test_password_valid(self):
        """Test mot de passe valide"""
        is_valid, msg = validate_password_strength("MonMotDePasse123!")

        assert is_valid is True
        assert "valide" in msg.lower()

    @pytest.mark.unit
    def test_password_trop_court(self):
        """Test mot de passe trop court"""
        is_valid, msg = validate_password_strength("Ab1!")

        assert is_valid is False
        assert "minimum" in msg.lower() or "caractères" in msg.lower()

    @pytest.mark.unit
    def test_password_sans_majuscule(self):
        """Test mot de passe sans majuscule"""
        is_valid, msg = validate_password_strength("motdepasse123!")

        assert is_valid is False
        assert "majuscule" in msg.lower()

    @pytest.mark.unit
    def test_password_sans_chiffre(self):
        """Test mot de passe sans chiffre"""
        is_valid, msg = validate_password_strength("MonMotDePasse!")

        assert is_valid is False
        assert "chiffre" in msg.lower()

    @pytest.mark.unit
    def test_password_sans_special(self):
        """Test mot de passe sans caractère spécial"""
        is_valid, msg = validate_password_strength("MonMotDePasse123")

        assert is_valid is False
        assert "spécial" in msg.lower()

    @pytest.mark.unit
    @pytest.mark.parametrize("password", [
        "Abcdefgh1!",  # Minimum valide
        "MonSuperMotDePasse2024!",
        "P@ssw0rd!SecureTest",
        "Test123!@#Complex"
    ])
    def test_passwords_valides(self, password):
        """Test plusieurs mots de passe valides"""
        is_valid, _ = validate_password_strength(password)

        assert is_valid is True


class TestJWTTokens:
    """Tests des tokens JWT"""

    @pytest.mark.unit
    def test_create_access_token(self):
        """Test création d'access token"""
        user_id = str(uuid4())
        token = create_access_token(
            data={"sub": user_id, "email": "test@test.com", "role": "conseiller"}
        )

        assert token is not None
        assert len(token) > 100  # JWT est assez long

    @pytest.mark.unit
    def test_decode_access_token(self):
        """Test décodage d'access token"""
        user_id = str(uuid4())
        email = "test@test.com"

        token = create_access_token(
            data={"sub": user_id, "email": email, "role": "conseiller"}
        )

        payload = decode_token(token)

        assert payload is not None
        assert payload["sub"] == user_id
        assert payload["email"] == email
        assert payload["type"] == "access"

    @pytest.mark.unit
    def test_create_refresh_token(self):
        """Test création de refresh token"""
        user_id = str(uuid4())
        token = create_refresh_token(data={"sub": user_id})

        assert token is not None

    @pytest.mark.unit
    def test_decode_refresh_token(self):
        """Test décodage de refresh token"""
        user_id = str(uuid4())

        token = create_refresh_token(data={"sub": user_id})
        payload = decode_token(token)

        assert payload is not None
        assert payload["sub"] == user_id
        assert payload["type"] == "refresh"

    @pytest.mark.unit
    def test_token_contains_expiration(self):
        """Test que le token contient une expiration"""
        token = create_access_token(data={"sub": "test"})
        payload = decode_token(token)

        assert "exp" in payload
        assert "iat" in payload

    @pytest.mark.unit
    def test_token_expiration_custom(self):
        """Test expiration personnalisée"""
        token = create_access_token(
            data={"sub": "test"},
            expires_delta=timedelta(minutes=5)
        )

        payload = decode_token(token)

        # Vérifier que l'expiration est dans ~5 minutes
        exp_timestamp = payload["exp"]
        iat_timestamp = payload["iat"]
        diff = exp_timestamp - iat_timestamp

        assert 290 <= diff <= 310  # ~5 minutes en secondes

    @pytest.mark.unit
    def test_decode_invalid_token(self):
        """Test décodage token invalide"""
        payload = decode_token("invalid.token.here")

        assert payload is None

    @pytest.mark.unit
    def test_decode_tampered_token(self):
        """Test décodage token modifié"""
        token = create_access_token(data={"sub": "test"})

        # Modifier le token
        tampered = token[:-5] + "XXXXX"

        payload = decode_token(tampered)

        assert payload is None

    @pytest.mark.unit
    def test_access_vs_refresh_token_type(self):
        """Test que les types de token sont différents"""
        access = create_access_token(data={"sub": "test"})
        refresh = create_refresh_token(data={"sub": "test"})

        access_payload = decode_token(access)
        refresh_payload = decode_token(refresh)

        assert access_payload["type"] == "access"
        assert refresh_payload["type"] == "refresh"


class TestTokenBlacklist:
    """Tests de la blacklist de tokens"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_blacklist_token(self, mock_redis):
        """Test ajout token à la blacklist"""
        with patch('app.core.redis_client._redis_client', mock_redis):
            from app.core.redis_client import blacklist_token

            result = await blacklist_token("test_token", 3600)

            assert result is True
            mock_redis.setex.assert_called_once()

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_is_token_blacklisted_false(self, mock_redis):
        """Test token non blacklisté"""
        mock_redis.exists.return_value = 0

        with patch('app.core.redis_client._redis_client', mock_redis):
            from app.core.redis_client import is_token_blacklisted

            result = await is_token_blacklisted("test_token")

            assert result is False

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_is_token_blacklisted_true(self, mock_redis):
        """Test token blacklisté"""
        mock_redis.exists.return_value = 1

        with patch('app.core.redis_client._redis_client', mock_redis):
            from app.core.redis_client import is_token_blacklisted

            result = await is_token_blacklisted("test_token")

            assert result is True


class TestAuthEndpoints:
    """Tests des endpoints d'authentification"""

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_login_missing_credentials(self, client):
        """Test login sans credentials"""
        response = await client.post("/api/v1/auth/login", json={})

        assert response.status_code == 422  # Validation error

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_login_invalid_email_format(self, client):
        """Test login avec email invalide"""
        response = await client.post("/api/v1/auth/login", json={
            "email": "not-an-email",
            "mot_de_passe": "password123"
        })

        assert response.status_code == 422

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, client):
        """Test refresh avec token invalide"""
        response = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid_token"
        })

        assert response.status_code == 401

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_refresh_access_token_rejected(self, client):
        """Test que access token est rejeté pour refresh"""
        # Créer un access token (pas un refresh)
        access_token = create_access_token(data={"sub": str(uuid4())})

        response = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": access_token
        })

        # Devrait échouer car c'est un access token
        assert response.status_code == 401


class TestSecurityHeaders:
    """Tests des headers de sécurité"""

    @pytest.mark.unit
    def test_token_bearer_format(self):
        """Test format Bearer token"""
        token = create_access_token(data={"sub": "test"})

        # Le token ne doit pas contenir "Bearer"
        assert not token.startswith("Bearer")

        # Mais peut être utilisé avec Bearer
        bearer = f"Bearer {token}"
        assert bearer.startswith("Bearer ")

    @pytest.mark.unit
    def test_token_not_contain_sensitive_data(self):
        """Test que le token ne contient pas de données sensibles"""
        token = create_access_token(
            data={
                "sub": "user_id",
                "email": "test@test.com",
                "role": "admin"
            }
        )

        payload = decode_token(token)

        # Ne doit pas contenir de mot de passe
        assert "password" not in payload
        assert "mot_de_passe" not in payload

        # Doit contenir les infos de base
        assert "sub" in payload
        assert "email" in payload
        assert "role" in payload
