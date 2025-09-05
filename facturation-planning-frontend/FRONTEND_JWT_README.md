# 🔐 Frontend React - API Facturation avec JWT et CORS

Ce frontend React utilise l'authentification JWT et est configuré pour fonctionner avec l'API Go backend.

## 🚀 Démarrage rapide

### 1. Installation
```bash
npm install
```

### 2. Configuration
Créez un fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

### 3. Démarrage
```bash
npm start
```
Le frontend sera accessible sur http://localhost:3000

## 🔧 Configuration CORS et JWT

### Variables d'environnement
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### Configuration Axios
- **Base URL** : `http://localhost:8080`
- **Credentials** : `withCredentials: true` (pour CORS)
- **Headers automatiques** : `Authorization: Bearer <token>`
- **Gestion d'erreurs** : Intercepteurs pour 401/403/500

## 🏗️ Architecture

### Services
- **`authService.js`** : Gestion complète de l'authentification JWT
- **`planningService.js`** : CRUD des plannings (routes protégées)
- **`errorHandler.js`** : Gestion centralisée des erreurs

### Composants principaux
- **`AuthContext.jsx`** : État global de l'authentification
- **`ProtectedRoute.jsx`** : Protection des routes par JWT
- **`Login.jsx`** : Formulaire de connexion avec validation
- **`Register.jsx`** : Inscription d'entreprises
- **`PlanningTest.jsx`** : Test des routes protégées

## 🔑 Flux d'authentification

### 1. Inscription
```javascript
// Service d'inscription
await authService.register("Mon Entreprise", "contact@exemple.com", "motdepasse");
// ✅ Redirige vers /login
```

### 2. Connexion
```javascript
// Service de connexion
const result = await authService.login("contact@exemple.com", "motdepasse");
// ✅ Token stocké dans localStorage
// ✅ Redirection vers la page demandée
```

### 3. Accès aux routes protégées
```javascript
// Récupération automatique du profil
const profile = await authService.getProfile();

// CRUD des plannings
const plannings = await planningService.getPlannings();
await planningService.createPlanning({
  date: "2025-09-05",
  objet: "Réunion client",
  description: "Présentation du devis"
});
```

### 4. Déconnexion automatique
- Token expiré : Redirection automatique vers `/login`
- Erreur 401 : Nettoyage du token et déconnexion
- Bouton déconnexion : `authService.logout()`

## 🧪 Tests et débogage

### Page de test JWT
Visitez `/planning-test` pour tester :
- ✅ Authentification JWT
- ✅ Récupération du profil
- ✅ CRUD des plannings
- ✅ Gestion des erreurs

### Console du navigateur
Activez `REACT_APP_DEBUG=true` pour voir :
```
🔧 Axios configuré pour CORS et JWT
📤 Requête sortante: POST /login
🔑 Token JWT ajouté à la requête
🏢 Entreprise ID ajouté: 3
📥 Réponse reçue: 200 /login
✅ Connexion réussie, token JWT stocké
```

### Outils de développement
- **React DevTools** : État du AuthContext
- **Network** : Vérifier les headers Authorization
- **Application** : localStorage avec `auth_token`

## 🔒 Sécurité

### Token JWT
- **Stockage** : localStorage (production : considérer httpOnly cookies)
- **Expiration** : 24h (configurable côté backend)
- **Validation** : Vérification automatique côté client
- **Nettoyage** : Suppression en cas d'erreur 401

### CORS
- **Développement** : Origins localhost autorisées
- **Production** : Origins spécifiques uniquement
- **Credentials** : `withCredentials: true` requis

### Headers de sécurité
```javascript
// Automatiquement ajoutés
headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "Content-Type": "application/json",
  "X-Entreprise-ID": "3"
}
```

## 📋 Routes disponibles

### Routes publiques
- `/login` - Connexion
- `/register` - Inscription

### Routes protégées (JWT requis)
- `/` - Accueil
- `/planning` - Calendrier des plannings
- `/planning-test` - Test de l'API JWT
- `/factures` - Gestion des factures
- `/devis` - Gestion des devis
- `/clients/ajouter` - Ajouter un client
- `/documents` - Gestion des documents

## 🚨 Gestion d'erreurs

### Erreurs courantes

#### CORS
```
❌ Problème CORS ou réseau - Vérifiez la configuration CORS du backend
💡 Assurez-vous que l'origine http://localhost:3000 est autorisée
```
**Solution** : Vérifier `ALLOWED_ORIGINS` côté backend

#### JWT expiré
```
🔑 Token JWT expiré ou invalide - Déconnexion
```
**Solution** : Reconnexion automatique demandée

#### Serveur non accessible
```
❌ Problème de connexion - Vérifiez que le serveur est démarré
```
**Solution** : Démarrer le backend Go sur port 8080

### Retry automatique
Le système effectue automatiquement :
- 1 retry pour les erreurs réseau
- Délai de 1 seconde entre les tentatives
- Messages d'erreur utilisateur-friendly

## 🔄 Cycle de vie de l'authentification

```mermaid
graph TD
    A[Page chargée] --> B{Token présent?}
    B -->|Non| C[Redirection /login]
    B -->|Oui| D{Token valide?}
    D -->|Non| C
    D -->|Oui| E[Récupération profil]
    E --> F{Profil OK?}
    F -->|Non| C
    F -->|Oui| G[Application chargée]
    G --> H[Vérification toutes les 60s]
    H --> D
```

## 🛠️ Développement

### Structure des fichiers
```
src/
├── services/
│   ├── authService.js      # Authentification JWT
│   └── planningService.js  # Routes protégées
├── contexts/
│   └── AuthContext.jsx     # État global auth
├── components/
│   ├── ProtectedRoute.jsx  # Garde des routes
│   ├── Login.jsx           # Connexion
│   ├── Register.jsx        # Inscription
│   └── PlanningTest.jsx    # Tests JWT
├── utils/
│   └── errorHandler.js     # Gestion d'erreurs
└── axiosInstance.js        # Config HTTP + CORS
```

### Bonnes pratiques
1. **Toujours utiliser les services** au lieu d'appeler Axios directement
2. **Vérifier l'authentification** avec `useAuth()` dans les composants
3. **Protéger les routes sensibles** avec `<ProtectedRoute>`
4. **Gérer les erreurs** avec `handleApiError()`
5. **Tester régulièrement** avec `/planning-test`

## 📚 Exemples d'usage

### Dans un composant React
```jsx
import { useAuth } from '../contexts/AuthContext';
import planningService from '../services/planningService';

function MonComposant() {
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleCreatePlanning = async () => {
    try {
      await planningService.createPlanning({
        date: "2025-09-05",
        objet: "Nouvelle tâche"
      });
      alert("✅ Planning créé !");
    } catch (error) {
      // Gestion automatique des erreurs
    }
  };

  if (!isAuthenticated) {
    return <div>Connexion requise</div>;
  }

  return (
    <div>
      <h1>Bonjour {user?.nom}</h1>
      <button onClick={handleCreatePlanning}>
        Créer planning
      </button>
      <button onClick={logout}>
        Déconnexion
      </button>
    </div>
  );
}
```

---

## 🤝 Support

- **Logs détaillés** : Console navigateur avec `REACT_APP_DEBUG=true`
- **Test endpoint** : http://localhost:3000/planning-test
- **Backend API** : http://localhost:8080/profile (avec token)

Le frontend est prêt pour la production ! 🚀
