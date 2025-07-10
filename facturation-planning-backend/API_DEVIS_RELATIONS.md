# API Devis avec Relations Entreprise/Client

## Nouveau format JSON pour créer un devis

```json
{
  "entreprise_id": 1,
  "client_id": 2,
  "date_devis": "2025-01-15T00:00:00Z",
  "date_expiration": "2025-02-15T00:00:00Z",
  "objet": "Développement application web",
  "conditions": "Devis valable 30 jours - Paiement sous 30 jours",
  "statut": "brouillon",
  "lignes": [
    {
      "description": "Développement frontend React",
      "quantite": 1,
      "prix_unitaire": 3000.00,
      "tva": 20.0
    },
    {
      "description": "Développement backend API",
      "quantite": 1,
      "prix_unitaire": 2500.00,
      "tva": 20.0
    },
    {
      "description": "Formation utilisateurs",
      "quantite": 2,
      "prix_unitaire": 500.00,
      "tva": 20.0
    }
  ]
}
```

## Exemple de réponse avec les relations

```json
{
  "id": 1,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "entreprise_id": 1,
  "client_id": 2,
  "date_devis": "2025-01-15T00:00:00Z",
  "date_expiration": "2025-02-15T00:00:00Z",
  "objet": "Développement application web",
  "conditions": "Devis valable 30 jours - Paiement sous 30 jours",
  "statut": "brouillon",
  "lignes": [
    {
      "id": 1,
      "description": "Développement frontend React",
      "quantite": 1,
      "prix_unitaire": 3000.00,
      "tva": 20.0
    },
    {
      "id": 2,
      "description": "Développement backend API",
      "quantite": 1,
      "prix_unitaire": 2500.00,
      "tva": 20.0
    },
    {
      "id": 3,
      "description": "Formation utilisateurs",
      "quantite": 2,
      "prix_unitaire": 500.00,
      "tva": 20.0
    }
  ],
  "entreprise": {
    "id": 1,
    "nom": "ODI SERVICE PRO",
    "adresse": "23 RUE ERIC TABARLY",
    "email": "aide.odiservicepro@gmail.com",
    "telephone": "02 51 99 36 91",
    "siret": "83377432600023",
    "tva": "FR92833774326"
  },
  "client": {
    "id": 2,
    "nom": "Entreprise Client SARL",
    "adresse": "456 Avenue de la République\n44000 Nantes",
    "email": "contact@entreprise-client.fr",
    "telephone": "02 40 98 76 54",
    "entreprise_id": 1
  },
  "sous_total_ht": 6000.00,
  "total_tva": 1200.00,
  "total_ttc": 7200.00
}
```

## Commandes curl pour tester

### 1. Créer un client pour une entreprise
```bash
curl -X POST http://localhost:8080/clients \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Entreprise Client SARL",
    "adresse": "456 Avenue de la République\n44000 Nantes",
    "email": "contact@entreprise-client.fr",
    "telephone": "02 40 98 76 54",
    "entreprise_id": 1
  }'
```

### 2. Créer un devis
```bash
curl -X POST http://localhost:8080/devis \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": 1,
    "client_id": 2,
    "date_devis": "2025-01-15T00:00:00Z",
    "date_expiration": "2025-02-15T00:00:00Z",
    "objet": "Développement application web",
    "conditions": "Devis valable 30 jours - Paiement sous 30 jours",
    "lignes": [
      {
        "description": "Développement frontend React",
        "quantite": 1,
        "prix_unitaire": 3000.00,
        "tva": 20.0
      },
      {
        "description": "Développement backend API",
        "quantite": 1,
        "prix_unitaire": 2500.00,
        "tva": 20.0
      }
    ]
  }'
```

### 3. Récupérer tous les devis
```bash
curl http://localhost:8080/devis
```

### 4. Récupérer un devis spécifique
```bash
curl http://localhost:8080/devis/1
```

### 5. Générer le PDF d'un devis
```bash
curl http://localhost:8080/devis/1/pdf
```

### 6. Télécharger le PDF d'un devis
```bash
curl http://localhost:8080/devis/1/download -o devis_001.pdf
```

## Statuts possibles pour un devis

- `brouillon` : Devis en cours de création
- `envoyé` : Devis envoyé au client
- `accepté` : Devis accepté par le client
- `refusé` : Devis refusé par le client
- `expiré` : Devis expiré

## Validation

Le système valide automatiquement que :
- L'entreprise existe
- Le client existe
- Le client appartient bien à l'entreprise spécifiée
- Les dates sont cohérentes
- Les lignes contiennent des données valides

## Calculs automatiques

Les totaux sont calculés automatiquement :
- `sous_total_ht` : Somme des montants HT
- `total_tva` : Somme des montants de TVA
- `total_ttc` : Somme des montants TTC
