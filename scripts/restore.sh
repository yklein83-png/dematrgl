#!/bin/bash
#
# Script de restauration de la base de données PostgreSQL
# Usage: ./restore.sh <backup_file.sql.gz>
#

set -euo pipefail

# ==========================================
# CONFIGURATION
# ==========================================

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-fare_epargne}"
DB_USER="${DB_USER:-postgres}"

# ==========================================
# FONCTIONS
# ==========================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

usage() {
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Variables d'environnement:"
    echo "  DB_HOST     - Hôte PostgreSQL (default: localhost)"
    echo "  DB_PORT     - Port PostgreSQL (default: 5432)"
    echo "  DB_NAME     - Nom de la base (default: fare_epargne)"
    echo "  DB_USER     - Utilisateur PostgreSQL (default: postgres)"
    echo "  DB_PASSWORD - Mot de passe PostgreSQL"
    exit 1
}

confirm() {
    read -p "ATTENTION: Cette opération va SUPPRIMER la base $DB_NAME et la recréer. Continuer? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restauration annulée"
        exit 0
    fi
}

# ==========================================
# MAIN
# ==========================================

# Vérifier les arguments
if [ $# -ne 1 ]; then
    usage
fi

BACKUP_FILE=$1

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Fichier de backup introuvable: $BACKUP_FILE"
    exit 1
fi

# Vérifier que le fichier est un .sql.gz
if [[ ! "$BACKUP_FILE" =~ \.sql\.gz$ ]]; then
    log_error "Le fichier doit être un .sql.gz"
    exit 1
fi

# Demander confirmation
confirm

log "Démarrage de la restauration depuis $BACKUP_FILE..."

# Export du mot de passe
export PGPASSWORD="${DB_PASSWORD:-}"

# Déconnecter tous les utilisateurs et supprimer la base
log "Déconnexion des utilisateurs et suppression de la base..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres <<EOF
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

# Restaurer la base
log "Restauration en cours..."
if gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    log "Restauration terminée avec succès!"

    # Afficher les statistiques
    log "Statistiques de la base restaurée:"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            schemaname,
            relname as table_name,
            n_live_tup as row_count
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
        LIMIT 10;
    "
else
    log_error "Échec de la restauration"
    exit 1
fi
