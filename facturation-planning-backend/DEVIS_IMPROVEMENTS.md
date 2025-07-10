# Améliorations du système de devis PDF

## 🎯 Fonctionnalités ajoutées

### 1. **Génération PDF améliorée**
- ✅ Design moderne et professionnel
- ✅ Calculs automatiques des totaux (HT, TVA, TTC)
- ✅ Informations client complètes
- ✅ Configuration entreprise centralisée
- ✅ Template responsive et personnalisable

### 2. **Nouvelles fonctionnalités**
- ✅ Visualisation PDF en ligne (`/devis/{id}/pdf`)
- ✅ Téléchargement PDF (`/devis/{id}/download`)
- ✅ CRUD complet pour les devis
- ✅ Configuration centralisée de l'entreprise
- ✅ Calculs automatiques de TVA et totaux

### 3. **Améliorations techniques**
- ✅ Configuration PDF optimisée (DPI 300, format A4)
- ✅ Fonctions template personnalisées
- ✅ Gestion des erreurs améliorée
- ✅ Noms de fichiers dynamiques
- ✅ Structure de données enrichie

## 📋 Nouvelles routes API

```
GET    /devis                  - Liste tous les devis
POST   /devis                  - Créer un nouveau devis
GET    /devis/{id}             - Récupérer un devis spécifique
PUT    /devis/{id}             - Mettre à jour un devis
DELETE /devis/{id}             - Supprimer un devis
GET    /devis/{id}/pdf         - Visualiser le PDF en ligne
GET    /devis/{id}/download    - Télécharger le PDF
```

## 🏗️ Structure des données

### Devis
```go
type Devis struct {
    ID              uint
    ClientNom       string
    ClientAdresse   string
    ClientEmail     string
    ClientTelephone string
    DateDevis       time.Time
    DateExpiration  time.Time
    Conditions      string
    Lignes          []LigneDevis
}
```

### Ligne de devis
```go
type LigneDevis struct {
    ID           uint
    DevisID      uint
    Description  string
    Quantite     int
    PrixUnitaire float64
    TVA          float64
}
```

## 🎨 Template PDF

Le nouveau template include :
- **Header** avec logo et informations entreprise
- **Informations client** dans une section dédiée
- **Tableau des lignes** avec calculs automatiques
- **Totaux** (HT, TVA, TTC) dans un encadré
- **Footer** avec informations légales
- **Design responsive** et professionnel

## ⚙️ Configuration

### Configuration entreprise (`config/company.go`)
```go
type CompanyInfo struct {
    Name        string
    Address     string
    City        string
    PostalCode  string
    Phone       string
    Email       string
    SIRET       string
    // ... autres champs
}
```

### Configuration devis
```go
type DevisConfig struct {
    DefaultCity        string
    DefaultConditions  string
    DefaultTVA         float64
    ValidityDays       int
    NumberingPrefix    string
}
```

## 🧪 Tests

Exécuter les tests :
```bash
go run test_devis.go
```

## 📖 Exemples d'utilisation

### Créer un devis
```bash
curl -X POST http://localhost:8080/devis \
  -H "Content-Type: application/json" \
  -d '{
    "client_nom": "Entreprise Test",
    "client_adresse": "123 Rue Example",
    "client_email": "test@example.com",
    "client_telephone": "01 23 45 67 89",
    "date_devis": "2025-01-15T00:00:00Z",
    "date_expiration": "2025-02-15T00:00:00Z",
    "conditions": "Paiement sous 30 jours",
    "lignes": [
      {
        "description": "Service développement",
        "quantite": 1,
        "prix_unitaire": 2500.00,
        "tva": 20.0
      }
    ]
  }'
```

### Générer un PDF
```bash
# Visualiser en ligne
curl http://localhost:8080/devis/1/pdf

# Télécharger
curl http://localhost:8080/devis/1/download -o devis_001.pdf
```

## 🔧 Personnalisation

### Modifier les informations entreprise
Éditer `config/company.go` pour changer les informations affichées.

### Personnaliser le template
Modifier `templates/devis_improved.html` pour ajuster le design.

### Ajouter des champs
1. Mettre à jour les structures dans `models/devis.go`
2. Modifier le contrôleur `controllers/devis_controller.go`
3. Ajuster le template HTML

## 📈 Améliorations futures possibles

- [ ] Signature électronique
- [ ] Envoi automatique par email
- [ ] Conversion devis → facture
- [ ] Historique des modifications
- [ ] Export Excel/CSV
- [ ] Templates multiples
- [ ] Multilangue
- [ ] Codes-barres/QR codes
- [ ] Intégration comptabilité
- [ ] Workflow d'approbation
