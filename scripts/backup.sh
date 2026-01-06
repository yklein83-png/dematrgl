#!/bin/bash
#
# Script de backup automatisé pour la base de données PostgreSQL
# À exécuter via cron : 0 2 * * * /path/to/backup.sh
#
# Configuration:
#   - Copier ce fichier et définir les variables d'environnement
#   - chmod +x backup.sh
#   - Tester manuellement avant de configurer cron
#

set -euo pipefail

# ==========================================
# CONFIGURATION
# ==========================================

# Variables d'environnement (à définir dans .env ou environnement)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-fare_epargne}"
DB_USER="${DB_USER:-postgres}"
# DB_PASSWORD doit être défini via PGPASSWORD ou .pgpass

# Répertoire de backup
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgresql}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Nom du fichier avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Logging
LOG_FILE="${BACKUP_DIR}/backup.log"

# ==========================================
# FONCTIONS
# ==========================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

check_prerequisites() {
    # Vérifier que pg_dump est disponible
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump n'est pas installé"
        exit 1
    fi

    # Vérifier que gzip est disponible
    if ! command -v gzip &> /dev/null; then
        log_error "gzip n'est pas installé"
        exit 1
    fi

    # Créer le répertoire de backup si nécessaire
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "Répertoire de backup créé: $BACKUP_DIR"
    fi
}

perform_backup() {
    log "Démarrage du backup de $DB_NAME..."

    # Export du mot de passe pour pg_dump
    export PGPASSWORD="${DB_PASSWORD:-}"

    # Exécuter pg_dump avec compression
    if pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --verbose \
        2>> "$LOG_FILE" \
        | gzip > "$BACKUP_FILE"; then

        # Vérifier que le fichier n'est pas vide
        if [ -s "$BACKUP_FILE" ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            log "Backup réussi: $BACKUP_FILE ($BACKUP_SIZE)"
            return 0
        else
            log_error "Le fichier de backup est vide"
            rm -f "$BACKUP_FILE"
            return 1
        fi
    else
        log_error "Échec du backup"
        rm -f "$BACKUP_FILE"
        return 1
    fi
}

cleanup_old_backups() {
    log "Nettoyage des backups de plus de $BACKUP_RETENTION_DAYS jours..."

    # Trouver et supprimer les vieux backups
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete -print | wc -l)

    if [ "$DELETED_COUNT" -gt 0 ]; then
        log "Supprimé $DELETED_COUNT ancien(s) backup(s)"
    else
        log "Aucun backup à nettoyer"
    fi
}

verify_backup() {
    log "Vérification de l'intégrité du backup..."

    # Vérifier que le fichier peut être décompressé
    if gzip -t "$BACKUP_FILE" 2>/dev/null; then
        log "Vérification OK: le backup est valide"
        return 0
    else
        log_error "Le backup est corrompu"
        return 1
    fi
}

send_notification() {
    local status=$1
    local message=$2

    # Webhook Slack (optionnel)
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[$status] Backup DB $DB_NAME: $message\"}" \
            > /dev/null 2>&1 || true
    fi

    # Email (optionnel)
    if [ -n "${ALERT_EMAIL:-}" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "[$status] Backup DB $DB_NAME" "$ALERT_EMAIL" || true
    fi
}

# ==========================================
# MAIN
# ==========================================

main() {
    log "=========================================="
    log "Début du processus de backup"
    log "=========================================="

    check_prerequisites

    if perform_backup; then
        if verify_backup; then
            cleanup_old_backups
            send_notification "SUCCESS" "Backup créé avec succès: $BACKUP_FILE"
            log "Processus de backup terminé avec succès"
            exit 0
        else
            send_notification "ERROR" "Backup corrompu"
            exit 1
        fi
    else
        send_notification "ERROR" "Échec du backup"
        exit 1
    fi
}

# Exécuter le script
main "$@"
