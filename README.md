# 🧾 Application de Facturation & Planning

Application complète de gestion de facturation avec planning intégré, développée avec Go (backend) et React (frontend).

## 🚀 Déploiement rapide

### Prérequis
- Docker Desktop installé et démarré
- PowerShell (Windows) ou Bash (Linux/Mac)

### Lancement de l'application

#### Windows (PowerShell)
```powershell
.\deploy.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Manuel
```bash
docker-compose up --build -d
```

L'application sera disponible sur : **http://localhost**

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   React Frontend │◄──►│   Caddy Proxy   │◄──►│   Go Backend    │
│   (Port interne)│    │   (Port 80/443) │    │   (Port 8080)   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │                 │
                    │  PostgreSQL DB  │
                    │   (Port 5432)   │
                    │                 │
                    └─────────────────┘
```

## 📁 Structure des fichiers

### Configuration
- `.env` - Variables d'environnement
- `docker-compose.yml` - Configuration production
- `docker-compose.dev.yml` - Configuration développement
- `Caddyfile` - Configuration du reverse proxy

### Backend (Go)
- `facturation-planning-backend/`
  - `Dockerfile` - Image de production
  - `main.go` - Point d'entrée
  - `controllers/` - Logique métier
  - `models/` - Modèles de données
  - `templates/` - Templates HTML pour PDF

### Frontend (React)
- `facturation-planning-frontend/`
  - `Dockerfile` - Image de production
  - `Dockerfile.dev` - Image de développement
  - `src/` - Code source React
  - `public/` - Assets statiques

## 🔧 Développement

### Mode développement
```bash
# Lancer en mode dev (hot reload)
docker-compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# DB:       localhost:5432
```

### Logs et debug
```bash
# Voir tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f caddy
```

### Commandes utiles
```bash
# Arrêter l'application
docker-compose down

# Rebuild complet
docker-compose up --build --force-recreate

# Nettoyer les volumes
docker-compose down -v

# Statut des services
docker-compose ps
```

## 🌐 Fonctionnalités

### Backend API
- **Authentification JWT**
- **Gestion des clients**
- **Création de devis** avec génération PDF
- **Facturation** avec templates personnalisés
- **Planning** des interventions
- **Gestion multi-entreprises**

### Frontend React
- **Interface responsive**
- **Gestion des utilisateurs**
- **Création/édition de devis**
- **Génération de factures**
- **Planning interactif**
- **Prévisualisation PDF**

## 🔐 Sécurité

- Headers de sécurité configurés (HSTS, XSS Protection, etc.)
- CORS configuré correctement
- Utilisateur non-root dans les containers
- Variables sensibles via .env

## 📊 Monitoring

L'application inclut des health checks pour :
- ✅ Base de données PostgreSQL
- ✅ API Backend Go
- ✅ Frontend déployé
- ✅ Reverse proxy Caddy

## 🔧 Configuration

### Variables d'environnement (.env)
```env
DB_NAME=facturation
DB_USER=facturation_user
DB_PASSWORD=your_secure_password
APP_DOMAIN=localhost
PORT=8080
ENV=production
JWT_SECRET=your_jwt_secret
```

### Personnalisation
- Modifier `APP_DOMAIN` pour la production
- Changer les mots de passe dans `.env`
- Adapter les templates PDF dans `backend/templates/`

## 🚨 Dépannage

### L'application ne démarre pas
1. Vérifier que Docker Desktop est lancé
2. Vérifier les variables dans `.env`
3. Consulter les logs : `docker-compose logs`

### Erreur de génération PDF
1. Vérifier que wkhtmltopdf est installé dans le container backend
2. Vérifier les templates dans `backend/templates/`
3. Consulter les logs du service API

### Problème de proxy
1. Vérifier la configuration du `Caddyfile`
2. S'assurer que les services sont démarrés : `docker-compose ps`

## 📝 Licence

Propriétaire - Tous droits réservés
