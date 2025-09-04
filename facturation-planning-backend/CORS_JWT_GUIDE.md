# 🔐 Guide CORS et JWT - API Facturation

Ce guide explique comment utiliser l'authentification JWT et la configuration CORS de l'API Facturation.

## 📋 Table des matières

1. [CORS (Cross-Origin Resource Sharing)](#cors-cross-origin-resource-sharing)
2. [JWT (JSON Web Token)](#jwt-json-web-token)
3. [Configuration](#configuration)
4. [Utilisation pratique](#utilisation-pratique)
5. [Exemples de code](#exemples-de-code)
6. [Dépannage](#dépannage)

---

## 🌐 CORS (Cross-Origin Resource Sharing)

### Qu'est-ce que CORS ?

CORS est un mécanisme de sécurité qui permet à une application web (frontend) d'accéder aux ressources d'un serveur (API) situé sur un domaine différent.

### Configuration actuelle

L'API est configurée pour accepter les requêtes depuis :
- `http://localhost:3000` - Serveur de développement React
- `http://localhost:3001` - Port alternatif
- `http://127.0.0.1:3000` - Adresse IP locale
- `http://0.0.0.0:3000` - Configuration Docker

### Méthodes HTTP autorisées
- `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`, `HEAD`

### Headers autorisés
- En développement : Tous les headers (`*`)
- En production : `Authorization`, `Content-Type`, `X-CSRF-Token`

### Configuration par environnement

#### Développement (`GO_ENV=development`)
```go
cors.Options{
    AllowedOrigins: ["http://localhost:3000", "http://localhost:3001", ...],
    AllowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    AllowedHeaders: ["*"],  // Permissif
    AllowCredentials: true,
    MaxAge: 300,  // 5 minutes
    Debug: true   // Logs activés
}
```

#### Production (`GO_ENV=production`)
```go
cors.Options{
    AllowedOrigins: ["https://mon-site.com"],  // Spécifique
    AllowedMethods: ["GET", "POST", "PUT", "DELETE"],
    AllowedHeaders: ["Authorization", "Content-Type"],  // Restrictif
    AllowCredentials: true,
    MaxAge: 86400  // 24 heures
}
```

---

## 🔑 JWT (JSON Web Token)

### Qu'est-ce que JWT ?

JWT est un standard ouvert (RFC 7519) qui définit un moyen compact et autonome de transmettre des informations de manière sécurisée entre les parties sous forme d'objet JSON.

### Structure d'un token JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnRyZXByaXNlX2lkIjozLCJleHAiOjE3NTcwNjA1NzZ9.1w1AZMV9zhbjGd57ngMnNXrEj9zOm_HTKVapy7_xy5Y
```

Le token est composé de 3 parties séparées par des points :
1. **Header** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
2. **Payload** : `eyJlbnRyZXByaXNlX2lkIjozLCJleHAiOjE3NTcwNjA1NzZ9`
3. **Signature** : `1w1AZMV9zhbjGd57ngMnNXrEj9zOm_HTKVapy7_xy5Y`

### Payload décodé
```json
{
  "entreprise_id": 3,
  "exp": 1757060576  // Timestamp d'expiration (24h)
}
```

### Routes protégées par JWT

- `GET /profile` - Profil de l'entreprise connectée
- `GET /plannings` - Liste des plannings
- `POST /plannings` - Créer un planning
- `PUT /plannings/{id}` - Modifier un planning
- `DELETE /plannings/{id}` - Supprimer un planning

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` avec :

```env
# Configuration JWT
JWT_SECRET=your-super-secret-key-here

# Configuration CORS
GO_ENV=development  # ou 'production'
ALLOWED_ORIGINS=http://localhost:3000,https://mon-site.com
```

### Configuration personnalisée

Pour ajouter des origines autorisées :
```bash
# Dans votre .env
ALLOWED_ORIGINS=http://localhost:3000,https://example.com,https://app.example.com
```

---

## 🚀 Utilisation pratique

### 1. Inscription d'une entreprise

```bash
# PowerShell
$headers = @{"Content-Type" = "application/json"}
$body = '{"nom":"Mon Entreprise","email":"contact@monentreprise.com","password":"motdepasse123"}'
$response = Invoke-WebRequest -Uri "http://localhost:8080/register" -Method POST -Headers $headers -Body $body
$response.Content
```

**Réponse :**
```json
{"message":"Compte entreprise créé avec succès"}
```

### 2. Connexion et récupération du token

```bash
# PowerShell
$headers = @{"Content-Type" = "application/json"}
$body = '{"email":"contact@monentreprise.com","password":"motdepasse123"}'
$response = Invoke-WebRequest -Uri "http://localhost:8080/login" -Method POST -Headers $headers -Body $body
$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

**Réponse :**
```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### 3. Utilisation du token pour accéder aux routes protégées

```bash
# PowerShell
$headers = @{"Authorization" = "Bearer $token"}
$response = Invoke-WebRequest -Uri "http://localhost:8080/profile" -Method GET -Headers $headers
$response.Content
```

**Réponse :**
```json
{
  "id": 3,
  "nom": "Mon Entreprise",
  "email": "contact@monentreprise.com",
  "created_at": "2025-09-04T10:22:43.803813+02:00"
}
```

---

## 💻 Exemples de code

### Frontend JavaScript/React

```javascript
// Configuration de base
const API_BASE_URL = 'http://localhost:8080';

// Stockage du token (localStorage ou state management)
const token = localStorage.getItem('auth_token');

// Headers par défaut
const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
};

// Fonction helper pour les requêtes
async function apiRequest(endpoint, options = {}) {
    const config = {
        credentials: 'include', // Important pour CORS
        headers: { ...defaultHeaders, ...options.headers },
        ...options
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
        if (response.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
}

// Exemples d'utilisation
async function login(email, password) {
    const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    localStorage.setItem('auth_token', response.token);
    return response;
}

async function getProfile() {
    return await apiRequest('/profile');
}

async function getPlannings() {
    return await apiRequest('/plannings');
}
```

### Frontend avec Axios

```javascript
import axios from 'axios';

// Configuration Axios
const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true, // Important pour CORS
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur pour gérer l'expiration du token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Utilisation
export const authService = {
    async register(nom, email, password) {
        const response = await api.post('/register', { nom, email, password });
        return response.data;
    },
    
    async login(email, password) {
        const response = await api.post('/login', { email, password });
        localStorage.setItem('auth_token', response.data.token);
        return response.data;
    },
    
    async getProfile() {
        const response = await api.get('/profile');
        return response.data;
    },
    
    async getPlannings() {
        const response = await api.get('/plannings');
        return response.data;
    }
};
```

### Composant React d'exemple

```jsx
import React, { useState, useEffect } from 'react';
import { authService } from './authService';

function App() {
    const [user, setUser] = useState(null);
    const [plannings, setPlannings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                const profile = await authService.getProfile();
                const userPlannings = await authService.getPlannings();
                setUser(profile);
                setPlannings(userPlannings);
            }
        } catch (error) {
            console.error('Erreur de chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (email, password) => {
        try {
            await authService.login(email, password);
            await loadUserData();
        } catch (error) {
            alert('Erreur de connexion: ' + error.message);
        }
    };

    if (loading) return <div>Chargement...</div>;

    if (!user) {
        return <LoginForm onLogin={handleLogin} />;
    }

    return (
        <div>
            <h1>Bonjour {user.nom}</h1>
            <h2>Vos plannings ({plannings.length})</h2>
            <ul>
                {plannings.map(planning => (
                    <li key={planning.id}>
                        {planning.date} - {planning.objet}
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

---

## 🔧 Dépannage

### Erreurs CORS courantes

#### 1. "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Cause :** L'origine du frontend n'est pas dans la liste des origines autorisées.

**Solution :**
```env
# Ajouter votre origine dans .env
ALLOWED_ORIGINS=http://localhost:3000,http://votre-origine.com
```

#### 2. "Credentials include but origin not allowed"

**Cause :** `withCredentials: true` utilisé mais origine pas autorisée.

**Solution :** Vérifier que l'origine exacte (protocole + domaine + port) est autorisée.

#### 3. Headers CORS manquants

**Cause :** Le serveur ne renvoie pas les headers CORS.

**Solution :** Vérifier que le middleware CORS est appliqué avant les routes.

### Erreurs JWT courantes

#### 1. "Token manquant" (401)

**Cause :** Header `Authorization` absent.

**Solution :**
```javascript
headers: {
    'Authorization': `Bearer ${token}`
}
```

#### 2. "Token invalide" (401)

**Causes possibles :**
- Token expiré (> 24h)
- Token malformé
- Secret JWT incorrect

**Solutions :**
- Reconnecter l'utilisateur
- Vérifier le format du token
- Vérifier la variable `JWT_SECRET`

#### 3. "Erreur d'authentification" lors de l'accès au contexte

**Cause :** Token valide mais erreur dans l'extraction des claims.

**Solution :** Vérifier que le token contient bien `entreprise_id`.

### Tests de débogage

```bash
# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  http://localhost:8080/profile

# Test JWT
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/profile
```

---

## 📚 Ressources supplémentaires

- [Documentation CORS MDN](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [JWT.io - Décodeur de tokens](https://jwt.io/)
- [RFC 7519 - JWT Specification](https://tools.ietf.org/html/rfc7519)

---

## 🏷️ Résumé

- **CORS** : Configuré pour le développement et la production
- **JWT** : Système complet d'authentification avec expiration
- **Sécurité** : Routes protégées et gestion des erreurs
- **Flexibilité** : Configuration par variables d'environnement

L'API est prête pour être utilisée avec n'importe quel frontend moderne ! 🚀
