# Security hardening script for production server
# Run as root or with sudo

#!/bin/bash

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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    apt update && apt upgrade -y
    log_success "System packages updated"
}

# Configure UFW firewall
configure_firewall() {
    log "Configuring UFW firewall..."
    
    # Reset UFW to default state
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (important - don't lock yourself out!)
    ufw allow ssh
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow API port only from localhost (if needed)
    # ufw allow from 127.0.0.1 to any port 8080
    
    # Enable UFW
    ufw --force enable
    
    log_success "UFW firewall configured and enabled"
    ufw status verbose
}

# Configure automatic security updates
configure_auto_updates() {
    log "Configuring automatic security updates..."
    
    # Install unattended-upgrades
    apt install -y unattended-upgrades apt-listchanges
    
    # Configure unattended-upgrades
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";

Unattended-Upgrade::Mail "admin@localhost";
Unattended-Upgrade::MailOnlyOnError "true";
EOF

    # Enable automatic updates
    cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

    log_success "Automatic security updates configured"
}

# Configure fail2ban for SSH protection
configure_fail2ban() {
    log "Installing and configuring fail2ban..."
    
    apt install -y fail2ban
    
    # Configure fail2ban for SSH
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

    # Restart fail2ban
    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log_success "Fail2ban configured and started"
}

# Secure SSH configuration
secure_ssh() {
    log "Securing SSH configuration..."
    
    # Backup original SSH config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Create secure SSH config
    cat > /etc/ssh/sshd_config << EOF
# Security-hardened SSH configuration
Port 22
Protocol 2

# Authentication
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes

# Security settings
X11Forwarding no
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxSessions 2

# Logging
LogLevel INFO
SyslogFacility AUTH

# Network settings
AddressFamily inet
ListenAddress 0.0.0.0

PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

    # Test SSH config and restart
    sshd -t
    systemctl restart ssh
    
    log_success "SSH configuration secured"
}

# Configure Docker security
secure_docker() {
    log "Applying Docker security settings..."
    
    # Create Docker daemon configuration for security
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true,
    "seccomp-profile": "/etc/docker/seccomp.json"
}
EOF

    # Download Docker's default seccomp profile
    curl -o /etc/docker/seccomp.json https://raw.githubusercontent.com/moby/moby/master/profiles/seccomp/default.json

    # Restart Docker
    systemctl restart docker
    
    log_success "Docker security configuration applied"
}

# Configure system limits and kernel parameters
configure_system_limits() {
    log "Configuring system limits and kernel parameters..."
    
    # Configure kernel parameters for security
    cat > /etc/sysctl.d/99-security.conf << EOF
# IP Spoofing protection
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Ignore ICMP ping requests
net.ipv4.icmp_echo_ignore_all = 0

# Ignore Directed pings
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Disable IPv6 if not needed
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1

# TCP SYN flood protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5
EOF

    # Apply kernel parameters
    sysctl -p /etc/sysctl.d/99-security.conf
    
    log_success "System limits and kernel parameters configured"
}

# Set up log rotation
configure_log_rotation() {
    log "Configuring log rotation..."
    
    # Configure logrotate for application logs
    cat > /etc/logrotate.d/facturation-app << EOF
/var/log/facturation/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        /usr/bin/docker-compose -f /opt/facturation/docker-compose.yml restart api > /dev/null 2>&1 || true
    endscript
}

/var/lib/docker/containers/*/*-json.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        /bin/kill -USR1 $(cat /var/run/docker.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
EOF

    log_success "Log rotation configured"
}

# Create monitoring user
create_monitoring_user() {
    log "Creating monitoring user..."
    
    # Create a user for monitoring services
    if ! id "monitoring" &>/dev/null; then
        useradd -r -s /bin/false -d /nonexistent monitoring
        log_success "Monitoring user created"
    else
        log_warning "Monitoring user already exists"
    fi
}

# Install and configure basic intrusion detection
configure_intrusion_detection() {
    log "Installing basic intrusion detection..."
    
    # Install rkhunter and chkrootkit
    apt install -y rkhunter chkrootkit
    
    # Update rkhunter database
    rkhunter --update
    
    # Create daily scan script
    cat > /etc/cron.daily/security-scan << EOF
#!/bin/bash
# Daily security scan

# Run rkhunter scan
/usr/bin/rkhunter --cronjob --update --quiet

# Run chkrootkit scan
/usr/sbin/chkrootkit > /var/log/chkrootkit.log 2>&1

# Check for failed login attempts
awk '/Failed password/ {print \$0}' /var/log/auth.log | tail -10 > /var/log/failed-logins.log
EOF

    chmod +x /etc/cron.daily/security-scan
    
    log_success "Intrusion detection configured"
}

# Main function
main() {
    log "🛡️  Starting security hardening process..."
    
    check_root
    
    # System updates
    update_system
    
    # Network security
    configure_firewall
    
    # SSH security
    secure_ssh
    configure_fail2ban
    
    # System security
    configure_auto_updates
    configure_system_limits
    
    # Application security
    secure_docker
    configure_log_rotation
    
    # Monitoring
    create_monitoring_user
    configure_intrusion_detection
    
    log_success "🎉 Security hardening completed successfully!"
    
    echo ""
    echo "🔒 Security Summary:"
    echo "✅ System packages updated"
    echo "✅ UFW firewall configured (ports 22, 80, 443 open)"
    echo "✅ SSH hardened and secured"
    echo "✅ Fail2ban configured for SSH protection"
    echo "✅ Automatic security updates enabled"
    echo "✅ Docker security settings applied"
    echo "✅ System kernel parameters hardened"
    echo "✅ Log rotation configured"
    echo "✅ Basic intrusion detection installed"
    echo ""
    echo "⚠️  Important notes:"
    echo "- SSH root login is disabled"
    echo "- Password authentication is still enabled (consider disabling after setting up SSH keys)"
    echo "- IPv6 is disabled"
    echo "- Regular security scans will run daily"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Set up SSH key authentication"
    echo "2. Consider disabling password authentication"
    echo "3. Set up monitoring alerts"
    echo "4. Regular backup verification"
}

# Show help
show_help() {
    echo "Security Hardening Script for Production Server"
    echo ""
    echo "Usage: sudo $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo "  --dry-run     Show what would be done without making changes"
    echo ""
    echo "This script will:"
    echo "  - Update system packages"
    echo "  - Configure UFW firewall"
    echo "  - Secure SSH configuration"
    echo "  - Install and configure fail2ban"
    echo "  - Enable automatic security updates"
    echo "  - Apply Docker security settings"
    echo "  - Configure system kernel parameters"
    echo "  - Set up log rotation"
    echo "  - Install basic intrusion detection"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --dry-run)
        log "DRY RUN MODE - No changes will be made"
        log "This script would perform security hardening..."
        show_help
        exit 0
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac