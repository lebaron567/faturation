# 🚀 Guide d'utilisation - API Devis

## 📋 Commandes disponibles

### **Démarrer le serveur**
```bash
go run main.go
```

### **Commandes de migration**
```bash
# Migration complète (supprime et recrée tout)
go run main.go fresh

# Supprimer toutes les tables
go run main.go rollback

# Créer des données de test
go run main.go seed
```

## 🛠️ Procédure de test complète

### **1. Première installation**
```bash
# Nettoyer et créer la base de données
go run main.go fresh

# Démarrer le serveur
go run main.go
```

### **2. Tests automatisés**

#### **Windows (PowerShell)**
```powershell
.\test_devis_api.ps1
```

#### **Linux/Mac**
```bash
chmod +x test_devis_api.sh
./test_devis_api.sh
```

### **3. Tests manuels**

#### **Créer un devis**
```bash
curl -X POST http://localhost:8080/devis \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": 1,
    "client_id": 1,
    "date_devis": "2025-01-15T00:00:00Z",
    "date_expiration": "2025-02-15T00:00:00Z",
    "objet": "Développement application web",
    "conditions": "Paiement sous 30 jours",
    "lignes": [
      {
        "description": "Développement frontend",
        "quantite": 1,
        "prix_unitaire": 3000.00,
        "tva": 20.0
      }
    ]
  }'
```

#### **Générer un PDF**
```bash
curl http://localhost:8080/devis/1/pdf -o devis.pdf
```

## 🔧 Dépannage

### **Problème : Erreur de clé étrangère**
```bash
# Solution
go run main.go fresh
```

### **Problème : Port 8080 occupé**
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac  
lsof -i :8080
```

### **Problème : Pas de données de test**
```bash
go run main.go seed
```

## 📖 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/devis` | Liste tous les devis |
| `POST` | `/devis` | Créer un devis |
| `GET` | `/devis/{id}` | Récupérer un devis |
| `PUT` | `/devis/{id}` | Mettre à jour un devis |
| `DELETE` | `/devis/{id}` | Supprimer un devis |
| `PATCH` | `/devis/{id}/statut` | Changer le statut |
| `GET` | `/devis/{id}/pdf` | Visualiser le PDF |
| `GET` | `/devis/{id}/download` | Télécharger le PDF |
| `GET` | `/entreprises/{id}/devis` | Devis par entreprise |
| `GET` | `/clients/{id}/devis` | Devis par client |

## 🎯 Swagger UI

Interface de test disponible à :
```
http://localhost:8080/swagger/index.html
```

## 📊 Structure des données

### **Devis JSON**
```json
{
  "entreprise_id": 1,
  "client_id": 1,
  "date_devis": "2025-01-15T00:00:00Z",
  "date_expiration": "2025-02-15T00:00:00Z",
  "objet": "Développement application",
  "conditions": "Paiement sous 30 jours",
  "statut": "brouillon",
  "lignes": [
    {
      "description": "Développement frontend",
      "quantite": 1,
      "prix_unitaire": 3000.00,
      "tva": 20.0
    }
  ]
}
```

### **Réponse avec relations**
```json
{
  "id": 1,
  "entreprise": {
    "id": 1,
    "nom": "ODI SERVICE PRO",
    "email": "aide.odiservicepro@gmail.com"
  },
  "client": {
    "id": 1,
    "nom": "Entreprise Test SARL",
    "email": "contact@entreprise-test.fr"
  },
  "sous_total_ht": 3000.00,
  "total_tva": 600.00,
  "total_ttc": 3600.00
}
```

## ✅ Fonctionnalités

- ✅ Relations Entreprise ↔ Client ↔ Devis
- ✅ Validation des données (client appartient à l'entreprise)
- ✅ Calculs automatiques des totaux
- ✅ Génération PDF avec design épuré
- ✅ Gestion des statuts (brouillon, envoyé, accepté, refusé)
- ✅ API CRUD complète
- ✅ Documentation Swagger
- ✅ Tests automatisés

## 🎨 PDF Design

Le PDF généré utilise un design épuré style universitaire :
- Police Times New Roman
- Bordures noires simples
- Pas d'effets visuels
- Mise en page classique et professionnelle
