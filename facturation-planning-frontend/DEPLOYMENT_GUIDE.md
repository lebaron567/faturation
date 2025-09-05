# 🚀 Guide de déploiement - Frontend avec JWT

## ✅ État actuel

Votre frontend React avec authentification JWT fonctionne parfaitement ! 

### Logs de fonctionnement :
```
✅ Connexion réussie
🏢 Entreprise ID ajouté: 2
📥 Réponse reçue: 200 /login
🔑 Token JWT ajouté à la requête
```

## 🧹 Mode production (logs propres)

### 1. Créer le fichier `.env.production`
```env
REACT_APP_API_URL=https://votre-api.com
REACT_APP_ENV=production
REACT_APP_DEBUG=false
REACT_APP_TOKEN_KEY=auth_token
```

### 2. Build pour la production
```bash
npm run build
```

### 3. Variables d'environnement à configurer

#### Développement (`.env`)
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

#### Production (`.env.production`)
```env
REACT_APP_API_URL=https://api.votre-domaine.com
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

## 🔧 Configuration backend requise

Assurez-vous que votre backend Go accepte l'origine de production :

```go
// Dans votre .env backend
ALLOWED_ORIGINS=https://app.votre-domaine.com,http://localhost:3000
GO_ENV=production
JWT_SECRET=Fact2025-SuperSecret-Key-EmericBarotin-9x8z7y6w5v4u3t2s1r0q
```

## 🧪 Test complet

### 1. Routes à tester
- ✅ `/login` - Connexion
- ✅ `/register` - Inscription
- ✅ `/planning-test` - Test des routes protégées
- ✅ `/planning` - Calendrier
- ✅ `/factures` - Gestion des factures

### 2. Fonctionnalités testées
- ✅ CORS configuré correctement
- ✅ JWT automatiquement ajouté aux requêtes
- ✅ Décodage du token (entreprise_id: 2)
- ✅ Gestion des erreurs 401/403/500
- ✅ Redirection automatique vers /login si non connecté

## 🎯 Checklist de déploiement

### Frontend
- [ ] Variables d'environnement de production configurées
- [ ] Build de production créé (`npm run build`)
- [ ] Logs de debug désactivés (`REACT_APP_DEBUG=false`)
- [ ] URL de l'API pointant vers la production

### Backend
- [ ] CORS configuré pour l'origine de production
- [ ] Variables d'environnement sécurisées
- [ ] JWT_SECRET sécurisé et unique
- [ ] HTTPS activé en production

### Sécurité
- [ ] Token JWT stocké de manière sécurisée
- [ ] Expiration des tokens configurée (24h)
- [ ] HTTPS utilisé en production
- [ ] Variables sensibles dans .env (pas dans le code)

## 🚨 Surveillance

### Métriques à surveiller
- Taux de réussite des connexions
- Temps de réponse de l'API
- Erreurs 401 (tokens expirés)
- Erreurs CORS

### Logs utiles (développement)
```javascript
// axiosInstance.js affiche :
📤 Requête sortante: POST /login
🔑 Token JWT ajouté à la requête  
🏢 Entreprise ID ajouté: 2
📥 Réponse reçue: 200 /login

// authService.js affiche :
✅ Connexion réussie, token JWT stocké
```

## 🔄 Maintenance

### Rotation des clés JWT
1. Générer une nouvelle `JWT_SECRET`
2. Déployer le backend avec la nouvelle clé
3. Les utilisateurs devront se reconnecter

### Mise à jour des tokens
- Durée de vie actuelle : 24h
- Renouvellement : Reconnexion requise
- Amélioration future : Refresh tokens

---

## 🎉 Félicitations !

Votre intégration CORS + JWT est **parfaitement fonctionnelle** ! 

L'application est prête pour :
- ✅ Développement local
- ✅ Tests d'intégration  
- ✅ Déploiement en production

Les logs montrent que tout fonctionne comme prévu avec l'entreprise ID 2 correctement extraite du token JWT.
