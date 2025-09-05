# Configuration CORS pour l'API Facturation

## Aperçu
Ce document explique la configuration CORS (Cross-Origin Resource Sharing) mise en place pour permettre aux applications frontend d'accéder à l'API.

## Configuration actuelle

### Environnement de développement
- **Origines autorisées par défaut** :
  - `http://localhost:3000` - Serveur de développement React
  - `http://localhost:3001` - Port alternatif
  - `http://127.0.0.1:3000` - Adresse IP locale
  - `http://0.0.0.0:3000` - Configuration Docker

- **Méthodes HTTP autorisées** :
  - GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD

- **Headers autorisés** : Tous (`*`) pour faciliter le développement

- **Credentials** : Activés (`AllowCredentials: true`)

- **Cache** : 5 minutes (300 secondes)

### Environnement de production
- **Configuration plus stricte** avec headers spécifiques
- **Cache étendu** : 24 heures (86400 secondes)
- **Debug désactivé**

## Variables d'environnement

### GO_ENV
Définit l'environnement d'exécution :
```bash
GO_ENV=development  # Configuration permissive
GO_ENV=production   # Configuration stricte
```

### ALLOWED_ORIGINS
Liste des origines autorisées (séparées par des virgules) :
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://mon-site.com
```

### PROD_FRONTEND_URL
URL spécifique du frontend en production :
```bash
PROD_FRONTEND_URL=https://mon-app.com
```

## Utilisation

### 1. Configuration automatique
Le middleware CORS est automatiquement appliqué à toutes les routes :
```go
r.Use(middlewares.CORSMiddleware())
```

### 2. Configuration personnalisée
Modifiez le fichier `middlewares/cors_middleware.go` pour adapter la configuration.

### 3. Ajout d'origines dynamiques
Utilisez les variables d'environnement pour ajouter des origines sans modifier le code.

## Dépannage

### Erreur CORS courantes

1. **Origin not allowed**
   - Vérifiez que l'origine du frontend est dans `ALLOWED_ORIGINS`
   - Assurez-vous que le protocole (http/https) et le port sont corrects

2. **Credentials not allowed**
   - Vérifiez que `AllowCredentials: true` est configuré
   - L'origine ne peut pas être `*` quand les credentials sont activés

3. **Method not allowed**
   - Ajoutez la méthode HTTP dans `AllowedMethods`

4. **Header not allowed**
   - En production, ajoutez le header dans `AllowedHeaders`

### Logs de débogage
En développement, activez les logs CORS avec `Debug: true`.

### Test de la configuration
Utilisez curl pour tester :
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/clients
```

## Sécurité

### Bonnes pratiques
1. **Limitez les origines** : Ne pas utiliser `*` en production
2. **Limitez les méthodes** : N'autorisez que les méthodes nécessaires
3. **Limitez les headers** : Spécifiez les headers requis en production
4. **Surveillez les logs** : Activez les logs en cas de problème

### Configuration recommandée pour la production
```go
cors.Options{
    AllowedOrigins:   []string{"https://mon-site.com"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
    AllowedHeaders:   []string{"Authorization", "Content-Type"},
    AllowCredentials: true,
    MaxAge:           86400,
}
```

## Structure des fichiers

```
middlewares/
└── cors_middleware.go     # Configuration CORS principale
main.go                    # Application du middleware
.env                       # Variables d'environnement
.env.example              # Template des variables
```
