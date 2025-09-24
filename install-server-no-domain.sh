#!/bin/bash

# 🚀 Script d'installation SANS nom de domaine (utilise IP directement)
# Usage: bash <(curl -s URL_DU_SCRIPT) 

set -e

echo "🚀 Installation du serveur de facturation ODI SERVICE PRO (IP seulement)"
echo "=================================================================="

# Variables
SERVER_IP=$(curl -s http://ipinfo.io/ip)
DB_PASSWORD=$(openssl rand -base64 32)

echo "📋 Configuration:"
echo "   - IP Serveur: $SERVER_IP"
echo "   - Accès: http://$SERVER_IP"
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
ufw allow 8080/tcp
ufw --force enable

# 6. Clone du projet
echo "📥 Clonage du projet..."
su - facturation -c "
cd /home/facturation
git clone https://github.com/lebaron567/faturation.git
cd faturation
"

# 7. Configuration production SANS SSL (IP seulement)
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

# Accès par IP
SERVER_IP=$SERVER_IP
CORS_ORIGINS=http://$SERVER_IP
EOF

# 8. Configuration Caddy SANS SSL (HTTP seulement)
echo "🌐 Configuration Caddy HTTP..."
cat > /home/facturation/faturation/Caddyfile << EOF
# Configuration HTTP simple (sans SSL)
:80 {
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

    # Headers sécurité basiques
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
    }

    # Compression
    encode gzip

    # Logs
    log {
        output file /var/log/caddy/access.log
        format json
    }
}
EOF

# 9. Utilisation du docker-compose production optimisé
cp /home/facturation/faturation/docker-compose.production.yml /home/facturation/faturation/docker-compose.prod.yml

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

# 13. Attendre démarrage
echo "⏳ Attente démarrage des services..."
sleep 30

echo ""
echo "✅ Installation terminée !"
echo "========================================"
echo "🌐 Votre application est disponible sur: http://$SERVER_IP"
echo "📊 API health check: http://$SERVER_IP/health" 
echo "🔐 Mot de passe DB sauvegardé dans: /home/facturation/faturation/.env"
echo ""
echo "📋 Prochaines étapes OPTIONNELLES:"
echo "1. [Plus tard] Acheter un nom de domaine"
echo "2. [Plus tard] Configurer SSL/HTTPS"
echo "3. [Maintenant] Tester votre application !"
echo ""
echo "🔧 Commandes utiles:"
echo "   - Voir les logs: sudo su - facturation -c 'cd faturation && docker-compose -f docker-compose.prod.yml logs'"
echo "   - Redémarrer: sudo su - facturation -c 'cd faturation && docker-compose -f docker-compose.prod.yml restart'"
echo "   - Sauvegarder: sudo su - facturation -c 'cd faturation && ./backup.sh'"
echo ""
echo "🎉 Votre application de facturation ODI SERVICE PRO est en ligne !"
echo "👉 Testez maintenant: http://$SERVER_IP"