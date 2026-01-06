"""
Documentation et exemples pour l'API OpenAPI
Enrichit la documentation Swagger/ReDoc avec des exemples
"""

from typing import Dict, Any

# ==========================================
# TAGS METADATA
# ==========================================

tags_metadata = [
    {
        "name": "Authentication",
        "description": "Endpoints d'authentification. Login, logout, refresh token.",
    },
    {
        "name": "Users",
        "description": "Gestion des utilisateurs (conseillers). Réservé aux administrateurs.",
    },
    {
        "name": "Clients",
        "description": "Gestion des fiches clients. CRUD complet avec filtres et recherche.",
    },
    {
        "name": "Documents",
        "description": "Génération et gestion des documents réglementaires (DER, KYC, etc.).",
    },
    {
        "name": "Health",
        "description": "Endpoints de monitoring et health checks.",
    },
    {
        "name": "Stats",
        "description": "Statistiques et tableaux de bord.",
    },
    {
        "name": "Exports",
        "description": "Export de données (CSV, Excel).",
    },
]

# ==========================================
# EXEMPLES DE REQUÊTES/RÉPONSES
# ==========================================

# Authentication
login_request_example = {
    "email": "conseiller@exemple.fr",
    "mot_de_passe": "MotDePasse123!"
}

login_response_example = {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "conseiller@exemple.fr",
        "nom": "Dupont",
        "prenom": "Jean",
        "role": "conseiller"
    }
}

# Client
client_create_example = {
    "t1_civilite": "Monsieur",
    "t1_nom": "Martin",
    "t1_prenom": "Pierre",
    "t1_date_naissance": "1975-06-15",
    "t1_lieu_naissance": "Paris",
    "t1_nationalite": "Française",
    "t1_adresse": "15 rue de la Paix",
    "t1_email": "pierre.martin@email.fr",
    "t1_telephone": "0612345678",
    "t1_residence_fiscale": "France",
    "t1_us_person": False,
    "t1_profession": "Cadre",
    "situation_familiale": "Marié(e)",
    "regime_matrimonial": "Communauté réduite aux acquêts",
    "nombre_enfants": 2,
    "revenus_annuels_foyer": "100000 à 150000 €",
    "patrimoine_global": "500000 à 1000000 €",
    "horizon_placement": "5 à 8 ans",
    "tolerance_risque": "Moyen - Équilibré",
    "objectifs_investissement": "Constitution d'un capital retraite"
}

client_response_example = {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "numero_client": "CLI-2024-00001",
    "statut": "prospect",
    **client_create_example,
    "profil_risque_calcule": "Équilibré",
    "profil_risque_score": 58,
    "lcb_ft_niveau_risque": "Faible",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "conseiller_id": "550e8400-e29b-41d4-a716-446655440000"
}

client_list_response_example = {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "clients": [client_response_example]
}

# Document
document_generate_request_example = {
    "client_id": "550e8400-e29b-41d4-a716-446655440001",
    "type_document": "DER",
    "include_titulaire_2": False,
    "include_patrimoine_detail": True
}

document_response_example = {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "client_id": "550e8400-e29b-41d4-a716-446655440001",
    "type_document": "DER",
    "nom_fichier": "DER_Martin_Pierre_20240115.docx",
    "date_generation": "2024-01-15T10:35:00Z",
    "signe": False,
    "genere_par": "550e8400-e29b-41d4-a716-446655440000"
}

# Health
health_response_example = {
    "status": "healthy",
    "timestamp": "2024-01-15T10:40:00Z",
    "version": "1.0.0",
    "environment": "production",
    "uptime_seconds": 86400.5,
    "components": [
        {
            "name": "database",
            "status": "healthy",
            "latency_ms": 2.5,
            "message": "PostgreSQL connection OK",
            "last_check": "2024-01-15T10:40:00Z"
        },
        {
            "name": "redis",
            "status": "healthy",
            "latency_ms": 0.8,
            "message": "Redis connection OK",
            "last_check": "2024-01-15T10:40:00Z"
        },
        {
            "name": "disk",
            "status": "healthy",
            "message": "Free: 45.2% (180 GB)",
            "last_check": "2024-01-15T10:40:00Z"
        },
        {
            "name": "templates",
            "status": "healthy",
            "message": "8 template(s) available",
            "last_check": "2024-01-15T10:40:00Z"
        }
    ]
}

# Erreurs
error_401_example = {
    "detail": "Token invalide ou expiré"
}

error_403_example = {
    "detail": "Accès non autorisé à cette ressource"
}

error_404_example = {
    "detail": "Client non trouvé"
}

error_422_example = {
    "detail": [
        {
            "loc": ["body", "t1_email"],
            "msg": "Email invalide",
            "type": "value_error.email"
        }
    ]
}

error_500_example = {
    "detail": "Erreur interne du serveur"
}

# ==========================================
# DESCRIPTIONS DES ENDPOINTS
# ==========================================

endpoint_descriptions: Dict[str, str] = {
    "login": """
Authentifie un utilisateur et retourne les tokens JWT.

**Flux d'authentification:**
1. L'utilisateur envoie ses identifiants
2. Le serveur vérifie le mot de passe
3. Si valide, génère un access token (30 min) et un refresh token (7 jours)
4. Le client stocke les tokens et utilise l'access token pour les requêtes suivantes

**Sécurité:**
- Rate limiting: 3 tentatives par minute par IP
- Les tokens sont signés avec HS256
- L'access token contient l'ID utilisateur, email et rôle
""",

    "logout": """
Déconnecte l'utilisateur en invalidant ses tokens.

Le token est ajouté à une blacklist Redis et ne sera plus accepté.
""",

    "refresh": """
Renouvelle l'access token en utilisant le refresh token.

Utilisez cet endpoint avant l'expiration de l'access token pour maintenir la session.
""",

    "get_clients": """
Retourne la liste des clients avec pagination et filtres.

**Filtres disponibles:**
- `search`: Recherche dans nom, prénom, email
- `statut`: prospect, client_actif, client_inactif
- `profil_risque`: Sécuritaire, Prudent, Équilibré, Dynamique
- `lcb_ft_niveau`: Faible, Standard, Renforcé, Élevé

**Tri:**
- Par défaut: date de création décroissante
- Paramètres: `sort_by` et `sort_order`
""",

    "create_client": """
Crée une nouvelle fiche client.

**Validation automatique:**
- Calcul du profil de risque
- Évaluation du niveau LCB-FT
- Génération du numéro client unique

**Champs requis:**
- Identité T1 (nom, prénom, date naissance, etc.)
- Coordonnées (email, téléphone)
- Situation familiale
""",

    "generate_document": """
Génère un document réglementaire pour un client.

**Types de documents:**
- `DER`: Document d'Entrée en Relation
- `KYC`: Questionnaire Know Your Customer
- `LETTRE_MISSION_CIF`: Lettre de mission CIF
- `LETTRE_MISSION_IAS`: Lettre de mission IAS
- `DECLARATION_ADEQUATION_CIF`: Déclaration d'adéquation
- `RAPPORT_CONSEIL_IAS`: Rapport de conseil
- `CONVENTION_RTO`: Convention RTO

**Options:**
- `include_titulaire_2`: Inclure le co-titulaire
- `include_patrimoine_detail`: Détail du patrimoine
- `include_produits`: Liste des produits souscrits
""",

    "health_check": """
Vérifie la santé de tous les composants du système.

**Composants vérifiés:**
- Base de données PostgreSQL
- Cache Redis
- Espace disque
- Templates DOCX

**Statuts possibles:**
- `healthy`: Tous les composants fonctionnent
- `degraded`: Certains composants en mode dégradé
- `unhealthy`: Composants critiques non disponibles
""",
}


def get_openapi_config() -> Dict[str, Any]:
    """
    Retourne la configuration OpenAPI enrichie
    """
    return {
        "title": "Le Fare de l'Épargne - API",
        "description": """
## API de gestion de patrimoine pour conseillers financiers

Cette API permet de gérer les fiches clients, générer les documents réglementaires
et assurer la conformité AMF/ACPR.

### Fonctionnalités principales

- **Gestion des clients**: CRUD complet avec calcul automatique du profil de risque
- **Documents réglementaires**: Génération automatisée (DER, KYC, lettres de mission, etc.)
- **Conformité LCB-FT**: Classification automatique du niveau de risque
- **Multi-utilisateurs**: Gestion des conseillers avec rôles (admin, conseiller)

### Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

1. Obtenez un token via `/api/v1/auth/login`
2. Incluez le token dans le header `Authorization: Bearer <token>`
3. Rafraîchissez le token via `/api/v1/auth/refresh` avant expiration

### Rate Limiting

- Authentification: 3 requêtes/minute
- API générale: 60 requêtes/minute
- Génération de documents: 10 requêtes/minute

### Support

Pour toute question technique, contactez l'équipe de développement.
        """,
        "version": "1.0.0",
        "contact": {
            "name": "Support technique",
            "email": "support@fare-epargne.fr"
        },
        "license_info": {
            "name": "Propriétaire",
        },
        "tags": tags_metadata,
    }
