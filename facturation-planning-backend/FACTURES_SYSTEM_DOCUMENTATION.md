# Système de Factures - Documentation Complete

## Vue d'ensemble

Un système complet de gestion des factures a été créé, similaire au système de devis existant, avec support pour les factures classiques et les factures d'acompte.

## Fonctionnalités Implémentées

### 1. Types de Factures
- **Factures Classiques** : Factures complètes pour prestations finalisées
- **Factures d'Acompte** : Factures partielles pour demandes d'acompte

### 2. API Endpoints

#### CRUD de Base
- `POST /factures` - Créer une nouvelle facture
- `GET /factures` - Récupérer toutes les factures
- `GET /factures/{id}` - Récupérer une facture par ID
- `PUT /factures/{id}` - Mettre à jour une facture
- `DELETE /factures/{id}` - Supprimer une facture

#### Génération PDF
- `GET /factures/{id}/pdf` - Générer et afficher le PDF
- `GET /factures/{id}/download` - Télécharger le PDF

#### Gestion des Statuts
- `PUT /factures/{id}/statut` - Mettre à jour le statut
- `GET /factures/statut/{statut}` - Filtrer par statut

#### Recherche et Filtres
- `GET /factures/search?q={terme}` - Recherche textuelle
- `GET /factures/client/{clientId}` - Factures par client

#### Routes Legacy (compatibilité)
- Aucune route legacy nécessaire (toutes les routes sont cohérentes)

### 3. Modèle de Données

```go
type Facture struct {
    ID                   uint      `json:"id" gorm:"primaryKey"`
    CreatedAt           time.Time `json:"created_at"`
    UpdatedAt           time.Time `json:"updated_at"`
    DeletedAt           *time.Time `json:"deleted_at,omitempty" gorm:"index"`
    
    Reference           string    `json:"reference" gorm:"unique;not null"`
    ClientID            uint      `json:"client_id" gorm:"not null"`
    Client              Client    `json:"client" gorm:"foreignKey:ClientID"`
    ClientNom           string    `json:"client_nom"`
    ClientAdresse       string    `json:"client_adresse"`
    ClientEmail         string    `json:"client_email"`
    ClientTelephone     string    `json:"client_telephone"`
    
    DateEmission        time.Time `json:"date_emission"`
    DateEcheance        time.Time `json:"date_echeance"`
    
    Description         string    `json:"description"`
    TypeFacture         string    `json:"type_facture"` // "classique" ou "acompte"
    
    SousTotalHT         float64   `json:"sous_total_ht"`
    TotalTVA           float64   `json:"total_tva"`
    TotalTTC           float64   `json:"total_ttc"`
    
    Statut             string    `json:"statut"` // "en_attente", "payee", "rejetee"
    DevisReference     string    `json:"devis_reference,omitempty"`
    PourcentageAcompte int       `json:"pourcentage_acompte,omitempty"`
}
```

### 4. Templates PDF

#### Template Principal (`facture.html`)
- Design professionnel avec CSS inline
- Affichage des informations entreprise et client
- Tableau des prestations
- Calculs automatiques (HT, TVA, TTC)
- Conditions de paiement
- Badge de statut coloré

#### Template Acompte (`facture_acompte.html`)
- Design spécialisé avec couleurs distinctives (orange)
- Avertissement visuel "FACTURE D'ACOMPTE"
- Affichage du pourcentage d'acompte
- Conditions de paiement spécifiques aux acomptes
- Référence au devis associé

### 5. Fonctionnalités Avancées

#### Génération PDF
- Utilise `wkhtmltopdf` pour un rendu de qualité
- Templates HTML avec CSS inline
- Support des logos et images
- Format A4 optimisé

#### Validation des Données
- Validation automatique des champs requis
- Calculs automatiques TVA/TTC
- Génération automatique des références

#### Gestion des Statuts
- **en_attente** : Facture créée, en attente de paiement
- **payee** : Facture réglée
- **rejetee** : Facture rejetée ou annulée

### 6. Structure des Fichiers

```
controllers/
  factures_controllers.go     # Logique métier complète
  
models/
  facture.go                 # Modèle de données
  
routes/
  facture_routes.go          # Définition des routes API
  routes.go                  # Routes principales
  
templates/
  facture.html               # Template facture classique
  facture_acompte.html       # Template facture d'acompte
  assets/
    logo.png                 # Logo entreprise
```

### 7. Exemples d'Usage

#### Créer une Facture Classique
```bash
curl -X POST http://localhost:8080/factures \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "description": "Développement site web",
    "type_facture": "classique",
    "sous_total_ht": 1000.00,
    "total_tva": 200.00,
    "total_ttc": 1200.00
  }'
```

#### Créer une Facture d'Acompte
```bash
curl -X POST http://localhost:8080/factures \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "description": "Acompte développement site web",
    "type_facture": "acompte",
    "devis_reference": "DEV-2024-001",
    "pourcentage_acompte": 50,
    "sous_total_ht": 500.00,
    "total_tva": 100.00,
    "total_ttc": 600.00
  }'
```

#### Rechercher des Factures
```bash
curl "http://localhost:8080/factures/search?q=développement"
```

#### Télécharger un PDF
```bash
curl "http://localhost:8080/factures/1/download" -o facture.pdf
```

### 8. Différences avec le Système Devis

| Fonctionnalité | Devis | Factures |
|---|---|---|
| **Statuts** | accepté/refusé/en_attente | payée/rejetée/en_attente |
| **Types** | Standard uniquement | Classique + Acompte |
| **Couleurs** | Bleu (#2c3e50) | Bleu (classique) / Orange (acompte) |
| **Échéance** | Non applicable | Date d'échéance obligatoire |
| **Pourcentage** | Non applicable | Pourcentage d'acompte |

### 9. Swagger Documentation

Toutes les routes sont documentées avec Swagger :
- Descriptions complètes des endpoints
- Exemples de requêtes/réponses
- Validation des paramètres
- Codes de retour HTTP

### 10. Sécurité et Bonnes Pratiques

- Validation côté serveur
- Gestion d'erreurs complète
- Logs d'audit (timestamps automatiques)
- Soft delete avec GORM
- Transactions sécurisées

## Installation et Déploiement

1. **Prérequis** : wkhtmltopdf installé sur le système
2. **Base de données** : Migration automatique au démarrage
3. **Templates** : Placés dans `/templates/`
4. **Assets** : Logo dans `/templates/assets/`

## Utilisation avec le Frontend

Le système est prêt pour l'intégration frontend avec :
- API REST complète
- Documentation Swagger automatique
- Réponses JSON standardisées
- Gestion d'erreurs cohérente

Ce système de factures offre une solution complète et professionnelle pour la gestion des factures classiques et d'acompte, avec génération PDF automatique et API moderne.
