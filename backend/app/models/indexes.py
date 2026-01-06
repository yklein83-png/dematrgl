"""
Index composites pour optimiser les requêtes fréquentes

Ce fichier définit les index supplémentaires pour améliorer les performances
des requêtes courantes sur la table clients.

Installation: Appliquer via une migration Alembic ou manuellement en SQL
"""

from sqlalchemy import Index

# ==========================================
# INDEX COMPOSITES POUR LA TABLE CLIENTS
# ==========================================

# Index pour recherche de clients par conseiller avec filtre statut
# Utilisé par: Dashboard conseiller, liste clients filtrée
idx_clients_conseiller_statut = Index(
    'idx_clients_conseiller_statut',
    'clients.conseiller_id',
    'clients.statut',
)

# Index pour recherche par nom/prénom avec conseiller
# Utilisé par: Recherche clients, autocomplete
idx_clients_conseiller_nom = Index(
    'idx_clients_conseiller_nom',
    'clients.conseiller_id',
    'clients.t1_nom',
    'clients.t1_prenom',
)

# Index pour le tri par date de création (liste clients)
# Utilisé par: Liste clients ordonnée par date
idx_clients_conseiller_created = Index(
    'idx_clients_conseiller_created',
    'clients.conseiller_id',
    'clients.created_at',
)

# Index pour filtrage par profil de risque
# Utilisé par: Rapports conformité, segmentation clients
idx_clients_conseiller_profil_risque = Index(
    'idx_clients_conseiller_profil_risque',
    'clients.conseiller_id',
    'clients.profil_risque_calcule',
)

# Index pour filtrage LCB-FT par niveau de risque
# Utilisé par: Surveillance compliance, alertes
idx_clients_conseiller_lcb_ft = Index(
    'idx_clients_conseiller_lcb_ft',
    'clients.conseiller_id',
    'clients.lcb_ft_niveau_risque',
)

# Index pour recherche email (unicité et login)
# Utilisé par: Vérification doublons, recherche rapide
idx_clients_email_unique = Index(
    'idx_clients_t1_email_unique',
    'clients.t1_email',
    unique=True,
    postgresql_where='t1_email IS NOT NULL',
)


# ==========================================
# SQL BRUT POUR APPLICATION MANUELLE
# ==========================================

INDEXES_SQL = """
-- Index composites pour optimiser les requêtes sur clients
-- Exécuter ces commandes dans la base PostgreSQL

-- Index conseiller + statut (dashboard, filtres)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_conseiller_statut
ON clients (conseiller_id, statut);

-- Index conseiller + nom/prénom (recherche)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_conseiller_nom
ON clients (conseiller_id, t1_nom, t1_prenom);

-- Index conseiller + date création (tri liste)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_conseiller_created
ON clients (conseiller_id, created_at DESC);

-- Index conseiller + profil risque (conformité)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_conseiller_profil_risque
ON clients (conseiller_id, profil_risque_calcule);

-- Index conseiller + niveau LCB-FT (compliance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_conseiller_lcb_ft
ON clients (conseiller_id, lcb_ft_niveau_risque);

-- Index partiel email non null (recherche rapide)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_t1_email_partial
ON clients (t1_email) WHERE t1_email IS NOT NULL;

-- Index pour recherche full-text sur nom/prénom
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_nom_trgm
ON clients USING gin ((t1_nom || ' ' || t1_prenom) gin_trgm_ops);

-- Note: Pour l'index trigram, activer d'abord l'extension:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index sur les champs JSONB fréquemment accédés
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_form_data
ON clients USING gin (form_data jsonb_path_ops);

-- Statistiques étendues pour optimiser les plans de requête
CREATE STATISTICS IF NOT EXISTS stats_clients_conseiller_statut
ON conseiller_id, statut FROM clients;

CREATE STATISTICS IF NOT EXISTS stats_clients_conseiller_profil
ON conseiller_id, profil_risque_calcule FROM clients;

-- Analyser la table après création des index
ANALYZE clients;
"""


# ==========================================
# INDEX POUR LA TABLE DOCUMENTS
# ==========================================

DOCUMENTS_INDEXES_SQL = """
-- Index composites pour optimiser les requêtes sur documents

-- Index client + type document (génération docs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_client_type
ON documents (client_id, type_document);

-- Index client + date génération (historique)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_client_date
ON documents (client_id, created_at DESC);

-- Index conseiller + date (reporting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_conseiller_date
ON documents (genere_par, created_at DESC);

ANALYZE documents;
"""


# ==========================================
# INDEX POUR LA TABLE USERS
# ==========================================

USERS_INDEXES_SQL = """
-- Index pour optimiser les requêtes utilisateurs

-- Index email (login, unique)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower
ON users (LOWER(email));

-- Index role + actif (filtrage admin)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_actif
ON users (role, is_active);

ANALYZE users;
"""


def get_all_indexes_sql() -> str:
    """Retourne tout le SQL des index à appliquer"""
    return f"""
-- ============================================
-- INDEX OPTIMIZATION SCRIPT
-- Application: Le Fare de l'Épargne
-- Date: 2025-12-08
-- ============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_trgm;

{INDEXES_SQL}

{DOCUMENTS_INDEXES_SQL}

{USERS_INDEXES_SQL}

-- Fin du script
"""


if __name__ == "__main__":
    # Permet d'exécuter ce fichier pour générer le SQL
    print(get_all_indexes_sql())
