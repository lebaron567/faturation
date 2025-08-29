#!/bin/bash

echo "🚀 Configuration PostgreSQL pour connexions externes depuis Windows"

# Démarrer PostgreSQL
sudo service postgresql start

# Configurer PostgreSQL pour accepter les connexions depuis Windows
echo "🔧 Configuration des connexions externes..."

# Éditer postgresql.conf pour écouter sur toutes les interfaces
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Éditer pg_hba.conf pour permettre les connexions depuis le réseau local
echo "host    all             all             172.22.0.0/16           md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Redémarrer PostgreSQL
sudo service postgresql restart

echo "✅ PostgreSQL configuré pour accepter les connexions depuis Windows"
echo "🔗 IP PostgreSQL: 172.22.140.106:5432"

# Tester la connexion
sudo -u postgres psql -c "SELECT version();"
