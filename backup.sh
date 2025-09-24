#!/usr/bin/env bash
set -euo pipefail

# Configuration
BACKUP_DIR="/app/backups"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M')
RETENTION_DAYS=7

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Vérifier que Docker Compose est accessible
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé ou accessible"
    exit 1
fi

if ! docker compose ps > /dev/null 2>&1; then
    error "Docker Compose n'est pas accessible ou les conteneurs ne sont pas démarrés"
    exit 1
fi

# Récupérer les variables d'environnement de la base de données
DB_NAME=$(docker compose exec -T db printenv POSTGRES_DB 2>/dev/null || echo "facturation_db")
DB_USER=$(docker compose exec -T db printenv POSTGRES_USER 2>/dev/null || echo "facturation_user")

log "Début de la sauvegarde de la base de données"
log "Base de données: $DB_NAME"
log "Utilisateur: $DB_USER"

# Nom du fichier de backup
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Effectuer le backup
log "Création du dump SQL..."
if docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"; then
    log "Dump SQL créé avec succès: $BACKUP_FILE"
    
    # Compresser le backup
    log "Compression du backup..."
    if gzip "$BACKUP_FILE"; then
        log "Backup compressé: $BACKUP_FILE_COMPRESSED"
        
        # Vérifier la taille du backup
        BACKUP_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
        log "Taille du backup: $BACKUP_SIZE"
        
        # Test d'intégrité du backup compressé
        if gunzip -t "$BACKUP_FILE_COMPRESSED" 2>/dev/null; then
            log "Test d'intégrité réussi"
        else
            error "Le backup compressé semble corrompu !"
            exit 1
        fi
    else
        error "Erreur lors de la compression"
        exit 1
    fi
else
    error "Erreur lors de la création du dump SQL"
    exit 1
fi

# Nettoyage des anciens backups
log "Nettoyage des backups de plus de $RETENTION_DAYS jours..."
DELETED_COUNT=$(find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log "$DELETED_COUNT ancien(s) backup(s) supprimé(s)"
else
    log "Aucun ancien backup à supprimer"
fi

# Afficher le résumé des backups disponibles
log "Backups disponibles:"
ls -lah "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -10 || warning "Aucun backup trouvé"

# Calcul de l'espace disque utilisé
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0B")
log "Espace total utilisé par les backups: $TOTAL_SIZE"

log "Sauvegarde terminée avec succès !"

# Optionnel: notification par webhook (Slack, Discord, etc.)
# if [ -n "${WEBHOOK_URL:-}" ]; then
#     curl -X POST "$WEBHOOK_URL" \
#         -H 'Content-Type: application/json' \
#         -d "{\"text\":\"✅ Backup $DB_NAME réussi - Taille: $BACKUP_SIZE\"}" \
#         2>/dev/null || warning "Échec de l'envoi de notification"
# fi