# 📋 API Routes - Facturation Planning Backend

## 🔐 Authentification
```
POST /api/register     - Créer un compte entreprise
POST /api/login        - Se connecter (récupère un token JWT)
GET  /profile          - Récupérer le profil de l'entreprise connectée (nécessite token)
```

## 🏢 Entreprises
```
GET  /api/entreprises           - Lister toutes les entreprises
POST /api/entreprises           - Créer une nouvelle entreprise
GET  /api/entreprises/{id}/devis - Récupérer tous les devis d'une entreprise
```

## 👥 Clients
```
GET  /api/clients             - Lister tous les clients
POST /api/clients             - Créer un nouveau client
GET  /api/clients/{id}/devis  - Récupérer tous les devis d'un client
```

## 👨‍💼 Salariés
```
GET  /api/salaries    - Lister tous les salariés
POST /api/salaries    - Créer un nouveau salarié
```

## 📋 Planning
```
GET    /api/plannings     - Récupérer tous les plannings
POST   /api/plannings     - Créer un nouveau planning
PUT    /plannings/{id}    - Modifier un planning existant
DELETE /plannings/{id}    - Supprimer un planning
```

## 📄 Devis
```
GET    /api/devis              - Récupérer tous les devis
POST   /api/devis              - Créer un nouveau devis
GET    /api/devis/{id}         - Récupérer un devis par ID
PUT    /api/devis/{id}         - Mettre à jour un devis
DELETE /api/devis/{id}         - Supprimer un devis
PATCH  /api/devis/{id}/statut  - Mettre à jour le statut d'un devis
GET    /api/devis/{id}/pdf     - Afficher le devis en PDF (navigateur)
GET    /api/devis/{id}/download - Télécharger le devis en PDF
```

## 💰 Factures
```
GET  /api/factures         - Lister toutes les factures
POST /api/factures         - Créer une nouvelle facture
GET  /api/factures/{id}/pdf - Générer et télécharger une facture en PDF
```

---

# 🎯 Modèles de Données pour le Frontend

## RegisterEntrepriseRequest (Inscription)
```json
{
  "nom": "MaBoite",
  "email": "contact@maboite.com",
  "password": "securepass"
}
```

## LoginRequest (Connexion)
```json
{
  "email": "contact@maboite.com",
  "password": "securepass"
}
```

## Client
```json
{
  "nom": "ACME Corporation",
  "email": "contact@acme.com",
  "telephone": "+33123456789",
  "adresse": "123 rue de la Paix, 75001 Paris",
  "entreprise_id": 1
}
```

## Salarié
```json
{
  "nom": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "telephone": "+33123456789",
  "entreprise_id": 1
}
```

## Planning
```json
{
  "date": "2025-06-15",
  "heure_debut": "09:00",
  "heure_fin": "17:00",
  "type_evenement": "Intervention",
  "salarie_id": 1,
  "client_id": 1,
  "objet": "Maintenance système",
  "prestation": "Support technique",
  "facturation": "À facturer",
  "taux_horaire": 45.50,
  "forfait_ht": 0,
  "entreprise_id": 1
}
```

## Devis
```json
{
  "entreprise_id": 1,
  "client_id": 1,
  "date_devis": "2025-06-10T00:00:00Z",
  "date_expiration": "2025-07-10T00:00:00Z",
  "conditions": "Paiement sous 30 jours",
  "objet": "Développement application web",
  "statut": "brouillon",
  "lignes": [
    {
      "description": "Développement site web",
      "quantite": 1,
      "prix_unitaire": 1500,
      "tva": 20
    }
  ]
}
```

## LigneDevis
```json
{
  "description": "Développement site web",
  "quantite": 1,
  "prix_unitaire": 1500,
  "tva": 20
}
```

## Facture
```json
{
  "numero": "FAC-2025-001",
  "type": "standard",
  "montant_ht": 1000.50,
  "montant_ttc": 1200.60,
  "taux_tva": 20,
  "date_emission": "2025-03-17",
  "date_echeance": "2025-04-17",
  "statut": "en attente",
  "description": "Facture pour prestation de services",
  "entreprise_id": 1,
  "planning_id": 3
}
```

---

# 🔑 Notes importantes pour le Frontend

## Configuration
- **Base URL**: `http://localhost:8080`
- **Content-Type**: `application/json` pour toutes les requêtes POST/PUT/PATCH
- **Documentation Swagger**: `http://localhost:8080/swagger/index.html`

## Authentification
- Utiliser le token JWT retourné par `/api/login` dans l'en-tête:
- `Authorization: Bearer {token}`

## Valeurs autorisées

### Statuts de devis
- `brouillon`
- `envoyé`
- `accepté`
- `refusé`
- `expiré`

### Types de factures
- `standard`
- `etat_avancement`
- `auto_liquidation`

### Statuts de factures
- `payée`
- `en attente`
- `rejetée`

## Codes de réponse HTTP

### Succès
- `200` - OK (récupération réussie)
- `201` - Created (création réussie)
- `204` - No Content (suppression réussie)

### Erreurs
- `400` - Bad Request (requête invalide)
- `401` - Unauthorized (non autorisé)
- `404` - Not Found (ressource introuvable)
- `409` - Conflict (conflit, ex: email déjà utilisé)
- `500` - Internal Server Error (erreur serveur)

---

# 📱 Exemples d'utilisation JavaScript/TypeScript

## Connexion
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:8080/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
};
```

## Récupérer les clients
```javascript
const getClients = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8080/api/clients', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

## Créer un devis
```javascript
const createDevis = async (devisData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8080/api/devis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(devisData)
  });
  return await response.json();
};
```
