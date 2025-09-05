#!/bin/bash

echo "🚀 Déploiement de l'application de facturation"
echo "=============================================="

# Vérifier que Docker est en marche
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez lancer Docker Desktop."
    exit 1
fi

# Vérifier les fichiers requis
required_files=(".env" "docker-compose.yml" "Caddyfile")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    fi
done

echo "✅ Tous les fichiers requis sont présents"

# Arrêter les containers existants
echo "🛑 Arrêt des containers existants..."
docker-compose down

# Nettoyer les images orphelines
echo "🧹 Nettoyage des images orphelines..."
docker image prune -f

# Lancer le build et démarrage
echo "🏗️ Build et démarrage des services..."
docker-compose up --build -d

# Vérifier le statut
echo "📊 Statut des services:"
docker-compose ps

echo ""
echo "🎉 Déploiement terminé!"
echo "🌐 Application disponible sur: http://localhost"
echo "📊 Logs en temps réel: docker-compose logs -f"
echo "🛑 Arrêter l'application: docker-compose down"
