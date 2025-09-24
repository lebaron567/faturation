#!/bin/bash

# Enhanced Deployment script for Facturation Planning Application
# Handles git updates, Docker rebuilds, and service restarts

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Function to check if a service is running
check_service_health() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    log "Checking health of service: $service_name"
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep -q "$service_name.*Up"; then
            log_success "$service_name is healthy"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: Waiting for $service_name to be healthy..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "$service_name failed to become healthy after $max_attempts attempts"
    return 1
}

# Function to create a backup before deployment
create_pre_deployment_backup() {
    log "Creating pre-deployment backup..."
    
    if [ -f "./backup.sh" ]; then
        chmod +x ./backup.sh
        ./backup.sh
        log_success "Pre-deployment backup created"
    else
        log_warning "Backup script not found, skipping backup"
    fi
}

# Function to test the application
test_application() {
    log "Testing application endpoints..."
    
    # Wait a bit for services to be ready
    sleep 10
    
    # Test API health
    if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
        log_success "API health check passed"
    else
        log_warning "API health check failed (endpoint might not exist yet)"
    fi
    
    # Test web frontend
    if curl -f -s http://localhost > /dev/null 2>&1; then
        log_success "Frontend accessibility check passed"
    else
        log_error "Frontend accessibility check failed"
        return 1
    fi
}

# Main deployment function
deploy() {
    local skip_backup=${1:-false}
    local skip_tests=${2:-false}
    
    log "🚀 Starting deployment process..."
    
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml not found. Are you in the right directory?"
        exit 1
    fi
    
    # Create backup unless skipped
    if [ "$skip_backup" != "true" ]; then
        create_pre_deployment_backup
    fi
    
    # Pull latest changes from git
    log "Pulling latest changes from git..."
    if git pull origin main; then
        log_success "Git pull completed successfully"
    else
        log_error "Git pull failed"
        exit 1
    fi
    
    # Check if there are any changes to Docker files
    if git diff --name-only HEAD~1 HEAD | grep -E "(Dockerfile|docker-compose.yml|package.json|go.mod|go.sum)" > /dev/null; then
        log "Docker-related files changed, rebuilding images..."
        REBUILD_IMAGES=true
    else
        log "No Docker-related changes detected"
        REBUILD_IMAGES=false
    fi
    
    # Stop services gracefully
    log "Stopping services..."
    docker-compose down --timeout 30
    
    # Remove old images if rebuilding
    if [ "$REBUILD_IMAGES" = "true" ]; then
        log "Removing old images..."
        docker-compose down --rmi local --volumes --timeout 30
        
        # Prune build cache
        log "Pruning Docker build cache..."
        docker builder prune -f
    fi
    
    # Build and start services
    log "Building and starting services..."
    if [ "$REBUILD_IMAGES" = "true" ]; then
        docker-compose up -d --build
    else
        docker-compose up -d
    fi
    
    # Check service health
    log "Checking service health..."
    sleep 5
    
    if check_service_health "db" && check_service_health "api" && check_service_health "caddy"; then
        log_success "All services are healthy"
    else
        log_error "Some services failed to start properly"
        log "Showing service status:"
        docker-compose ps
        log "Showing recent logs:"
        docker-compose logs --tail=20
        exit 1
    fi
    
    # Test application unless skipped
    if [ "$skip_tests" != "true" ]; then
        test_application
    fi
    
    # Clean up old Docker resources
    log "Cleaning up old Docker resources..."
    docker system prune -f --volumes
    
    log_success "🎉 Deployment completed successfully!"
    log "Services status:"
    docker-compose ps
}

# Function to show deployment status
status() {
    log "Deployment Status:"
    echo ""
    
    log "📊 Docker Compose Services:"
    docker-compose ps
    echo ""
    
    log "💾 Disk Usage:"
    df -h | head -1
    df -h | grep -E "/$|/var"
    echo ""
    
    log "🐳 Docker System Info:"
    docker system df
    echo ""
    
    log "📝 Recent Logs (last 10 lines):"
    docker-compose logs --tail=10
}

# Function to rollback to previous version
rollback() {
    log "🔄 Starting rollback process..."
    
    # Check if we can rollback
    if ! git log --oneline -n 2 | tail -1 > /dev/null; then
        log_error "Cannot find previous commit for rollback"
        exit 1
    fi
    
    # Get the previous commit hash
    PREVIOUS_COMMIT=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)
    
    log "Rolling back to commit: $PREVIOUS_COMMIT"
    
    # Create emergency backup
    create_pre_deployment_backup
    
    # Rollback git
    git reset --hard $PREVIOUS_COMMIT
    
    # Redeploy
    deploy true true  # Skip backup and tests for rollback
    
    log_success "Rollback completed to commit: $PREVIOUS_COMMIT"
}

# Function to show help
help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy          Deploy the application (default)"
    echo "  status          Show deployment status"
    echo "  rollback        Rollback to previous version"
    echo "  help            Show this help message"
    echo ""
    echo "Deploy Options:"
    echo "  --skip-backup   Skip pre-deployment backup"
    echo "  --skip-tests    Skip application testing"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 deploy --skip-backup"
    echo "  $0 status"
    echo "  $0 rollback"
}

# Parse command line arguments
COMMAND=${1:-deploy}
SKIP_BACKUP=false
SKIP_TESTS=false

# Parse options
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            help
            exit 1
            ;;
    esac
done

# Execute command
case $COMMAND in
    deploy)
        deploy $SKIP_BACKUP $SKIP_TESTS
        ;;
    status)
        status
        ;;
    rollback)
        rollback
        ;;
    help)
        help
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        help
        exit 1
        ;;
esac