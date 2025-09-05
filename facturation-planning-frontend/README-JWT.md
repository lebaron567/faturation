# 🎯 Frontend React - API Facturation avec JWT

Ce frontend React utilise l'authentification JWT et CORS pour communiquer avec l'API Facturation.

## 📋 Prérequis

- Node.js 16+ et npm
- Backend API Facturation démarré sur `http://localhost:8080`
- Variables d'environnement configurées

## ⚙️ Configuration

### 1. Variables d'environnement

Copiez `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Contenu de `.env.local` :
```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
REACT_APP_DEBUG=true
REACT_APP_TOKEN_KEY=auth_token
```

### 2. Configuration Backend

Assurez-vous que le backend a ces variables :
```bash
# Dans le .env du backend Go
JWT_SECRET=Fact2025-SuperSecret-Key-EmericBarotin-9x8z7y6w5v4u3t2s1r0q
GO_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🔐 Authentification JWT

### Inscription d'une entreprise
1. Allez sur `/register`
2. Remplissez : nom entreprise, email, mot de passe
3. Redirection automatique vers `/login`

### Connexion
1. Allez sur `/login`
2. Utilisez email/mot de passe de l'entreprise
3. Le token JWT est automatiquement stocké
4. Redirection vers la page demandée

### Routes protégées
Toutes les routes sauf `/login` et `/register` nécessitent une authentification :
- `/` - Accueil
- `/planning` - Planning principal
- `/planning-test` - Test des APIs planning
- `/factures/*` - Gestion des factures
- `/devis/*` - Gestion des devis
- `/clients/*` - Gestion des clients

## 🧪 Test des APIs

### Page de test plannings
Accédez à `/planning-test` pour tester :
- ✅ Récupération du profil entreprise
- ✅ Création de plannings
- ✅ Liste des plannings
- ✅ Suppression de plannings

### Test manuel avec le navigateur
```javascript
// Dans la console du navigateur
// Vérifier le token
console.log('Token:', localStorage.getItem('auth_token'));

// Tester une requête protégée
fetch('http://localhost:8080/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(console.log);
```

## 📡 Configuration CORS

### Côté Frontend
- `withCredentials: true` dans Axios
- Origin automatiquement envoyé : `http://localhost:3000`

### Côté Backend (à vérifier)
Le backend doit accepter l'origine du frontend :
```go
// En développement
AllowedOrigins: []string{
    "http://localhost:3000",
    "http://localhost:3001",
}
```

## 🔧 Structure des Services

### AuthService (`src/services/authService.js`)
- `register(nom, email, password)` - Inscription
- `login(email, password)` - Connexion
- `logout()` - Déconnexion
- `getProfile()` - Profil entreprise
- `isAuthenticated()` - Vérification token

### PlanningService (`src/services/planningService.js`)
- `getPlannings()` - Liste plannings
- `createPlanning(data)` - Création
- `updatePlanning(id, data)` - Modification
- `deletePlanning(id)` - Suppression

### AxiosInstance (`src/axiosInstance.js`)
- Intercepteur JWT automatique
- Gestion erreurs 401 (token expiré)
- Gestion erreurs CORS
- Logs configurables

## 🛠️ Dépannage

### Erreur CORS
```
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution :** Vérifiez que `http://localhost:3000` est dans `ALLOWED_ORIGINS` du backend.

### Token expiré (401)
Le frontend gère automatiquement :
- Suppression du token
- Redirection vers `/login`
- Conservation de l'URL demandée

### Problème de connexion réseau
```
NETWORK_ERROR ou ERR_NETWORK
```
**Solutions :**
1. Vérifiez que le backend est démarré sur port 8080
2. Vérifiez `REACT_APP_API_URL` in `.env.local`
3. Testez manuellement : `curl http://localhost:8080/profile`

### Debug
Activez les logs détaillés :
```bash
REACT_APP_DEBUG=true
```

## 📈 Workflow de développement

1. **Backend d'abord :** Démarrez l'API Go
2. **Variables d'env :** Configurez `.env.local`
3. **Frontend :** Démarrez React avec `npm start`
4. **Test :** Utilisez `/planning-test` pour valider JWT
5. **Développement :** Les tokens sont automatiquement gérés

## 🏷️ Résumé technique

- **Frontend :** React avec Axios et JWT
- **Backend :** Go avec middleware CORS et JWT
- **Authentification :** JWT avec expiration 24h
- **Stockage :** localStorage pour les tokens
- **Sécurité :** Routes protégées et validation automatique
- **CORS :** Configuration flexible par environnement

---

L'API est maintenant prête avec une gestion complète de JWT et CORS ! 🚀
