# ==========================================
# STAGE 1: Build de l'application React
# ==========================================
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (production + dev pour le build)
RUN npm ci --silent

# Copier tout le code source
COPY . .

# Variables d'environnement pour la production
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false
ENV REACT_APP_API_URL=http://localhost/api

# Builder l'application React pour la production
RUN npm run build

# ==========================================
# STAGE 2: Copie vers volume partagé
# ==========================================
FROM node:18-alpine AS deploy

# Créer le répertoire de destination
WORKDIR /app

# Copier le build depuis l'étape précédente
COPY --from=build /app/build ./dist

# Créer le répertoire de partage
RUN mkdir -p /usr/share/web

# Script de déploiement
RUN echo '#!/bin/sh' > /deploy.sh && \
    echo 'echo "🚀 Déploiement du frontend React..."' >> /deploy.sh && \
    echo 'rm -rf /usr/share/web/*' >> /deploy.sh && \
    echo 'cp -r /app/dist/* /usr/share/web/' >> /deploy.sh && \
    echo 'echo "✅ Frontend déployé avec succès!"' >> /deploy.sh && \
    echo 'echo "📂 Contenu de /usr/share/web:"' >> /deploy.sh && \
    echo 'ls -la /usr/share/web/' >> /deploy.sh && \
    echo 'echo "🔄 Maintien du container actif..."' >> /deploy.sh && \
    echo 'sleep infinity' >> /deploy.sh && \
    chmod +x /deploy.sh

# Exposer le port (même si c'est Caddy qui sert)
EXPOSE 80

# Lancer le script de déploiement
CMD ["/deploy.sh"]
