#!/bin/bash

# Script pour démarrer le serveur backend avec PostgreSQL dans WSL

echo "🔧 Configuration du serveur backend..."

# 1. Démarrer PostgreSQL
echo "📊 Démarrage de PostgreSQL..."
sudo service postgresql start
sudo service postgresql status

# 2. Configurer PostgreSQL pour accepter les connexions
echo "⚙️ Configuration de PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'd3qmjmam';"

# Modifier postgresql.conf pour écouter sur toutes les interfaces
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Modifier pg_hba.conf pour autoriser les connexions depuis Windows
echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Redémarrer PostgreSQL avec la nouvelle config
sudo service postgresql restart

# 3. Créer la base de données si elle n'existe pas
echo "🗃️ Création de la base de données..."
sudo -u postgres createdb facturation 2>/dev/null || echo "Base 'facturation' existe déjà"

# 4. Afficher l'IP de WSL
WSL_IP=$(ip addr show eth0 | grep inet | head -n1 | awk '{print $2}' | cut -d/ -f1)
echo "🌐 IP de WSL: $WSL_IP"

# 5. Démarrer le serveur Go
echo "🚀 Démarrage du serveur Go..."
echo "📍 Le serveur sera accessible depuis Windows sur: http://$WSL_IP:8080"
echo "📍 Et depuis WSL sur: http://localhost:8080"

cd /mnt/c/Users/emeri/Documents/faturation/facturation-planning-backend

# Modifier le .env pour utiliser localhost dans WSL
sed -i 's/DB_HOST=.*/DB_HOST=localhost/' .env

go run main.go
