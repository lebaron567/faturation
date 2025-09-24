#!/usr/bin/env bash
set -euo pipefail

# Script de restauration de backup PostgreSQL
# Usage: ./restore.sh [fichier_backup.sql.gz]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="/app/backups"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [fichier_backup.sql.gz]"
    echo ""
    echo "Si aucun fichier n'est spécifié, le script propose les backups disponibles."
    echo ""
    echo "Exemples:"
    echo "  $0                                    # Liste les backups disponibles"
    echo "  $0 backup_2024-03-15_02-00.sql.gz   # Restaure un backup spécifique"
    echo ""
}

# Vérifier les arguments
if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
    show_help
    exit 0
fi

# Récupérer les variables d'environnement
DB_NAME=$(docker compose exec -T db printenv POSTGRES_DB 2>/dev/null || echo "facturation_db")
DB_USER=$(docker compose exec -T db printenv POSTGRES_USER 2>/dev/null || echo "facturation_user")

# Si aucun fichier spécifié, lister les backups disponibles
if [ $# -eq 0 ]; then
    log "Backups disponibles dans $BACKUP_DIR:"
    if ls "$BACKUP_DIR"/*.sql.gz 1> /dev/null 2>&1; then
        ls -lah "$BACKUP_DIR"/*.sql.gz | nl
        echo ""
        echo "Usage: $0 nom_du_fichier.sql.gz"
    else
        error "Aucun backup trouvé dans $BACKUP_DIR"
        exit 1
    fi
    exit 0
fi

BACKUP_FILE="$1"

# Vérifier si le fichier existe
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    error "Le fichier $BACKUP_DIR/$BACKUP_FILE n'existe pas"
    exit 1
fi

# Demander confirmation
warning "⚠️  ATTENTION: Cette opération va remplacer TOUTE la base de données $DB_NAME"
warning "Fichier de restauration: $BACKUP_FILE"
echo -n "Êtes-vous sûr de vouloir continuer ? (oui/non): "
read -r CONFIRM

if [ "$CONFIRM" != "oui" ]; then
    log "Restauration annulée"
    exit 0
fi

# Créer un backup de sécurité avant restauration
SAFETY_BACKUP="safety_backup_$(date +'%Y-%m-%d_%H-%M').sql.gz"
log "Création d'un backup de sécurité: $SAFETY_BACKUP"
docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/$SAFETY_BACKUP"

# Décompresser et restaurer
log "Décompression et restauration en cours..."
if gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME"; then
    log "✅ Restauration réussie !"
    log "Backup de sécurité conservé: $BACKUP_DIR/$SAFETY_BACKUP"
else
    error "❌ Erreur lors de la restauration"
    log "Restauration du backup de sécurité..."
    gunzip -c "$BACKUP_DIR/$SAFETY_BACKUP" | docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME"
    exit 1
fi