#!/bin/bash

# 🚀 Script d'installation automatique - Serveur de production
# Usage: bash <(curl -s https://raw.githubusercontent.com/lebaron567/faturation/main/install-server.sh)

set -e

echo "🚀 Installation du serveur de facturation ODI SERVICE PRO"
echo "========================================================"

# Variables
DOMAIN=${1:-"votre-domaine.com"}
EMAIL=${2:-"aide.odiservicepro@gmail.com"}
DB_PASSWORD=$(openssl rand -base64 32)

echo "📋 Configuration:"
echo "   - Domaine: $DOMAIN"
echo "   - Email: $EMAIL"
echo "   - Mot de passe DB: [généré automatiquement]"
echo ""

# 1. Mise à jour système
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation Docker
echo "🐳 Installation Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# 3. Installation Docker Compose
echo "🔧 Installation Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Création utilisateur pour l'app
echo "👤 Création utilisateur facturation..."
useradd -m -s /bin/bash facturation
usermod -aG docker facturation

# 5. Configuration firewall
echo "🛡️ Configuration firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 6. Clone du projet
echo "📥 Clonage du projet..."
su - facturation -c "
cd /home/facturation
git clone https://github.com/lebaron567/faturation.git
cd faturation
"

# 7. Configuration production
echo "⚙️ Configuration production..."
cat > /home/facturation/faturation/.env << EOF
# Base de données
DB_HOST=db
DB_PORT=5432
DB_NAME=facturation
DB_USER=facturation_user
DB_PASSWORD=$DB_PASSWORD

# API
PORT=8080
ENV=production
JWT_SECRET=$(openssl rand -base64 64)

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=aide.odiservicepro@gmail.com
SMTP_PASS=your_app_password

# Domaine
DOMAIN=$DOMAIN
EOF

# 8. Configuration Caddy avec SSL
echo "🌐 Configuration Caddy SSL..."
cat > /home/facturation/faturation/Caddyfile << EOF
$DOMAIN {
    # Servir le frontend
    root * /usr/share/web
    file_server

    # API endpoints
    handle /api/* {
        reverse_proxy api:8080
    }
    
    handle /clients* {
        reverse_proxy api:8080
    }
    handle /factures* {
        reverse_proxy api:8080
    }
    handle /devis* {
        reverse_proxy api:8080
    }
    handle /auth* {
        reverse_proxy api:8080
    }
    handle /login* {
        reverse_proxy api:8080
    }
    handle /register* {
        reverse_proxy api:8080
    }
    handle /salaries* {
        reverse_proxy api:8080
    }
    handle /plannings* {
        reverse_proxy api:8080
    }
    handle /entreprises* {
        reverse_proxy api:8080
    }
    handle /health* {
        reverse_proxy api:8080
    }

    # Headers sécurité
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }

    # Compression
    encode gzip

    # Logs
    log {
        output file /var/log/caddy/access.log
        format json
    }

    # Email pour certificat SSL
    tls $EMAIL
}
EOF

# 9. Modification docker-compose pour production avec optimisations 8Go RAM
cat > /home/facturation/faturation/docker-compose.prod.yml << EOF
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: \${DB_NAME}
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      # Optimisations PostgreSQL pour 8Go RAM
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"
    volumes:
      - dbdata:/var/lib/postgresql/data
      - ./postgresql.conf:/etc/postgresql/postgresql.conf:ro
    ports:
      - "5432:5432"
    # Limites ressources optimisées
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER} -d \${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  api:
    build:
      context: ./facturation-planning-backend
      dockerfile: Dockerfile
    environment:
      DB_HOST: "db"
      DB_PORT: "5432"
      DB_NAME: \${DB_NAME}
      DB_USER: \${DB_USER}
      DB_PASSWORD: \${DB_PASSWORD}
      PORT: "8080"
      ENV: "production"
      JWT_SECRET: \${JWT_SECRET}
      # Optimisations Go pour 2 vCPU
      GOMAXPROCS: "2"
      GOMEMLIMIT: "1GiB"
    ports:
      - "8080:8080"
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  web:
    build:
      context: ./facturation-planning-frontend
      dockerfile: Dockerfile
    volumes:
      - webdist:/usr/share/web
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    depends_on:
      - api
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddydata:/data
      - caddyconfig:/config
      - webdist:/usr/share/web:ro
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    depends_on:
      - api
      - web
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  # Monitoring automatique
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_SCHEDULE=0 3 * * *  # Mise à jour 3h du matin
    deploy:
      resources:
        limits:
          memory: 128M
    restart: unless-stopped

volumes:
  dbdata:
  webdist:
  caddydata:
  caddyconfig:
EOF

# 10. Permissions
chown -R facturation:facturation /home/facturation/faturation

# 11. Installation cron pour sauvegardes
echo "💾 Configuration sauvegardes automatiques..."
cat > /home/facturation/backup-cron.sh << 'EOF'
#!/bin/bash
cd /home/facturation/faturation
./backup.sh
EOF

chmod +x /home/facturation/backup-cron.sh
(crontab -u facturation -l 2>/dev/null; echo "0 2 * * * /home/facturation/backup-cron.sh") | crontab -u facturation -

# 12. Démarrage de l'application
echo "🚀 Démarrage de l'application..."
su - facturation -c "
cd /home/facturation/faturation
docker-compose -f docker-compose.prod.yml up -d --build
"

echo ""
echo "✅ Installation terminée !"
echo "========================================"
echo "🌐 Votre application est disponible sur: https://$DOMAIN"
echo "📊 API health check: https://$DOMAIN/health"
echo "🔐 Mot de passe DB sauvegardé dans: /home/facturation/faturation/.env"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Pointez votre domaine vers cette adresse IP"
echo "2. Attendez 5-10 minutes pour la génération SSL"
echo "3. Testez votre application"
echo ""
echo "🔧 Commandes utiles:"
echo "   - Voir les logs: sudo su - facturation -c 'cd faturation && docker-compose -f docker-compose.prod.yml logs'"
echo "   - Redémarrer: sudo su - facturation -c 'cd faturation && docker-compose -f docker-compose.prod.yml restart'"
echo "   - Sauvegarder: sudo su - facturation -c 'cd faturation && ./backup.sh'"
echo ""
echo "🎉 Votre application de facturation ODI SERVICE PRO est en ligne !"