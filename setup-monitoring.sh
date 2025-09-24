#!/bin/bash

# Monitoring setup script for Facturation Planning Application
# Sets up Uptime Kuma for application monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Setup monitoring
setup_monitoring() {
    log "🔍 Setting up application monitoring..."
    
    # Check if monitoring directory exists
    if [ ! -d "monitoring" ]; then
        log_error "Monitoring directory not found. Are you in the right directory?"
        exit 1
    fi
    
    cd monitoring
    
    # Start Uptime Kuma
    log "Starting Uptime Kuma monitoring service..."
    docker-compose up -d
    
    # Wait for service to be ready
    log "Waiting for Uptime Kuma to be ready..."
    sleep 15
    
    # Check if Uptime Kuma is running
    if docker-compose ps | grep -q "uptime-kuma.*Up"; then
        log_success "Uptime Kuma is running successfully"
    else
        log_error "Failed to start Uptime Kuma"
        docker-compose logs
        exit 1
    fi
    
    cd ..
    
    log_success "Monitoring setup completed!"
    echo ""
    echo "📊 Monitoring Dashboard:"
    echo "🌐 Uptime Kuma: http://localhost:3001"
    echo ""
    echo "📝 Recommended monitors to set up:"
    echo "1. Website Monitor: http://localhost (Frontend)"
    echo "2. HTTP Monitor: http://localhost:8080/health (API Health)"
    echo "3. Docker Monitor: Check Docker daemon status"
    echo "4. Disk Space Monitor: Server disk usage"
    echo ""
    echo "⚙️ To configure monitors:"
    echo "1. Open http://localhost:3001"
    echo "2. Create an admin account"
    echo "3. Add monitors for your services"
    echo "4. Configure notifications (email, Discord, Slack, etc.)"
}

# Show monitoring status
monitoring_status() {
    log "Monitoring Status:"
    echo ""
    
    if [ -d "monitoring" ]; then
        cd monitoring
        
        log "📊 Monitoring Services:"
        docker-compose ps
        
        echo ""
        log "📝 Recent Logs:"
        docker-compose logs --tail=10
        
        cd ..
    else
        log_warning "Monitoring directory not found"
    fi
}

# Stop monitoring
stop_monitoring() {
    log "🛑 Stopping monitoring services..."
    
    if [ -d "monitoring" ]; then
        cd monitoring
        docker-compose down
        cd ..
        log_success "Monitoring services stopped"
    else
        log_warning "Monitoring directory not found"
    fi
}

# Create monitoring configuration template
create_monitor_config() {
    log "📋 Creating monitoring configuration template..."
    
    cat > monitoring-config.md << 'EOF'
# Monitoring Configuration Guide

## Uptime Kuma Setup

### 1. Initial Setup
1. Open http://localhost:3001
2. Create an admin account
3. Complete the initial setup

### 2. Recommended Monitors

#### Frontend Website Monitor
- **Name**: Facturation Frontend
- **Type**: HTTP(s)
- **URL**: http://localhost
- **Heartbeat Interval**: 60 seconds
- **Max Retries**: 3
- **Expected Status Codes**: 200

#### API Health Monitor
- **Name**: Facturation API Health
- **Type**: HTTP(s) 
- **URL**: http://localhost:8080/health
- **Heartbeat Interval**: 30 seconds
- **Max Retries**: 2
- **Expected Status Codes**: 200

#### Database Connection Monitor
- **Name**: PostgreSQL Database
- **Type**: Port
- **Hostname**: localhost
- **Port**: 5432
- **Heartbeat Interval**: 120 seconds

#### Docker Health Monitor
- **Name**: Docker Daemon
- **Type**: Docker Container
- **Docker Host**: unix:///var/run/docker.sock
- **Container Name**: facturation_api_1

### 3. Notification Setup

#### Email Notifications
1. Go to Settings > Notifications
2. Add Email notification
3. Configure SMTP settings
4. Test the notification

#### Discord Notifications (Optional)
1. Create Discord webhook in your server
2. Add Discord notification in Uptime Kuma
3. Paste webhook URL

#### Slack Notifications (Optional)
1. Create Slack app and webhook
2. Add Slack notification in Uptime Kuma
3. Configure webhook URL

### 4. Status Page (Optional)
1. Go to Status Pages
2. Create a new status page
3. Add your monitors
4. Configure public access if needed

### 5. Backup Monitoring Data
- Uptime Kuma data is stored in Docker volume: `uptime-kuma-data`
- To backup: `docker run --rm -v uptime-kuma-data:/data -v $(pwd):/backup ubuntu tar czf /backup/uptime-kuma-backup.tar.gz -C /data .`
- To restore: `docker run --rm -v uptime-kuma-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/uptime-kuma-backup.tar.gz -C /data`

### 6. Advanced Configuration

#### Custom CSS (Optional)
```css
/* Custom dark theme adjustments */
:root {
    --primary: #1976d2;
    --warning: #ff9800;
    --danger: #f44336;
    --success: #4caf50;
}
```

#### Heartbeat Intervals
- **Critical Services**: 30 seconds
- **Important Services**: 60 seconds  
- **Background Services**: 300 seconds

#### Alert Rules
- **Down**: Immediate notification
- **Slow Response** (>2s): Warning after 3 occurrences
- **Failed Health Check**: Error after 2 occurrences

### 7. Maintenance Mode
1. Create a maintenance status
2. Schedule during deployment windows
3. Configure automatic start/stop

### 8. Performance Monitoring
- Monitor response times
- Set up trend analysis
- Configure performance alerts

### 9. Integration with Deployment
Add monitoring checks to deployment script:
```bash
# Wait for services to be healthy before completing deployment
check_uptime_kuma_status() {
    # Add health check calls here
}
```

### 10. Security Considerations
- Change default admin password
- Use HTTPS in production
- Restrict access with firewall rules
- Regular backup of monitoring data
EOF

    log_success "Monitoring configuration guide created: monitoring-config.md"
}

# Show help
show_help() {
    echo "Monitoring Setup Script for Facturation Planning Application"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup           Set up monitoring services (default)"
    echo "  status          Show monitoring status"
    echo "  stop            Stop monitoring services"
    echo "  config          Create monitoring configuration guide"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 status"
    echo "  $0 config"
}

# Parse command line arguments
COMMAND=${1:-setup}

case $COMMAND in
    setup)
        setup_monitoring
        ;;
    status)
        monitoring_status
        ;;
    stop)
        stop_monitoring
        ;;
    config)
        create_monitor_config
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac