# API FACTURES - Documentation Complète

## 1. Créer une facture classique
POST /api/factures

DONNÉES À ENVOYER:
{
  "clientID": 1,
  "typeFacture": "classique",
  "dateCreation": "2025-09-01T00:00:00Z",
  "dateEcheance": "2025-10-01T00:00:00Z",
  "sousTotalHT": 1000.00,
  "totalTTC": 1200.00,
  "tauxTVA": 20.0,
  "lignes": [
    {
      "description": "Développement frontend",
      "quantite": 10,
      "prixUnitaire": 500.00,
      "totalLigne": 5000.00,
      "tauxTVA": 20.0
    },
    {
      "description": "Hébergement annuel", 
      "quantite": 1,
      "prixUnitaire": 200.00,
      "totalLigne": 200.00,
      "tauxTVA": 20.0
    }
  ]
}

RÉPONSE REÇUE:
{
  "ID": 1,
  "Reference": "FAC-2025-0001",
  "CreatedAt": "2025-09-01T14:09:30.706109+01:00",
  "ClientID": 1,
  "Client": {
    "ID": 1,
    "Nom": "Barotin",
    "Prenom": "Emeric",
    "Email": "contact@example.com",
    "Telephone": "01 23 45 67 89",
    "Adresse": "123 Rue de la Paix",
    "CodePostal": "75001",
    "Ville": "Paris"
  },
  "TypeFacture": "classique",
  "DateCreation": "2025-09-01T00:00:00Z",
  "DateEcheance": "2025-10-01T00:00:00Z",
  "SousTotalHT": 5200.00,
  "TotalTTC": 6240.00,
  "TauxTVA": 20.0,
  "MontantTVA": 1040.00,
  "Statut": "en attente",
  "Lignes": [
    {
      "ID": 1,
      "Description": "Développement frontend",
      "Quantite": 10,
      "PrixUnitaire": 500.00,
      "TotalLigne": 5000.00,
      "TauxTVA": 20.0
    },
    {
      "ID": 2,
      "Description": "Hébergement annuel",
      "Quantite": 1,
      "PrixUnitaire": 200.00,
      "TotalLigne": 200.00,
      "TauxTVA": 20.0
    }
  ]
}

## 2. Créer une facture d'acompte
POST /api/factures

DONNÉES À ENVOYER:
{
  "clientID": 1,
  "typeFacture": "acompte",
  "dateCreation": "2025-09-01T00:00:00Z",
  "dateEcheance": "2025-10-01T00:00:00Z",
  "sousTotalHT": 1250.00,
  "totalTTC": 1500.00,
  "tauxTVA": 20.0,
  "lignes": [
    {
      "description": "Acompte 50% développement",
      "quantite": 1,
      "prixUnitaire": 1250.00,
      "totalLigne": 1250.00,
      "tauxTVA": 20.0
    }
  ]
}

## 3. Créer facture depuis un devis
POST /api/factures/from-devis/{devisId}

DONNÉES À ENVOYER:
{
  "typeFacture": "classique",
  "dateEcheance": "2025-10-01T00:00:00Z"
}

## 4. Récupérer toutes les factures
GET /api/factures

RÉPONSE:
[
  {
    "ID": 1,
    "Reference": "FAC-2025-0001",
    "TypeFacture": "classique",
    "DateCreation": "2025-09-01T00:00:00Z",
    "DateEcheance": "2025-10-01T00:00:00Z",
    "TotalTTC": 6240.00,
    "Statut": "en attente"
  }
]

## 5. Récupérer une facture par ID
GET /api/factures/{id}

RÉPONSE: Facture complète avec toutes les lignes

## 6. Modifier une facture
PUT /api/factures/{id}

DONNÉES À ENVOYER: Même format que la création, avec les champs à modifier

## 7. Supprimer une facture
DELETE /api/factures/{id}

RÉPONSE: { "message": "Facture supprimée avec succès" }

## 8. Générer PDF
GET /api/factures/{id}/pdf

RÉPONSE: PDF en ligne (Content-Type: application/pdf)

## 9. Télécharger PDF
GET /api/factures/{id}/download

RÉPONSE: Téléchargement du PDF avec nom de fichier

## 10. Changer le statut
PUT /api/factures/{id}/statut

DONNÉES À ENVOYER:
{
  "statut": "payee"
}

STATUTS POSSIBLES: "en attente", "payee", "annulee"

## 11. Rechercher des factures
GET /api/factures/search?q=ABC&statut=en_attente&annee=2025

PARAMÈTRES DE RECHERCHE:
- q : Terme de recherche (référence, client, description)
- statut : Filtrer par statut
- annee : Filtrer par année

## 12. Factures par client
GET /api/factures/client/{clientId}

RÉPONSE: Liste des factures du client

## 13. Factures par statut
GET /api/factures/statut/{statut}

RÉPONSE: Liste des factures avec le statut donné

## TYPES DE FACTURES SUPPORTÉS:

1. Facture classique ("classique") : Facture complète normale
2. Facture d'acompte ("acompte") : Facture de paiement partiel
3. Facture d'avancement ("avancement") : Facture de progression
4. Facture standard ("standard") : Facture standard

## STRUCTURE COMPLÈTE D'UNE LIGNE DE FACTURE:

{
  "description": "Description du service/produit",
  "quantite": 10.5,
  "prixUnitaire": 500.00,
  "totalLigne": 5250.00,
  "tauxTVA": 20.0
}

## CHAMPS OBLIGATOIRES POUR CRÉATION:

- clientID (obligatoire)
- typeFacture (obligatoire: "classique", "acompte", "avancement", "standard")
- dateCreation (obligatoire)
- dateEcheance (obligatoire)
- lignes (obligatoire, au moins une ligne)
- sousTotalHT (obligatoire)
- totalTTC (obligatoire)
- tauxTVA (obligatoire)

## GÉNÉRATION AUTOMATIQUE:

- Référence facture (FAC-ANNÉE-XXXX)
- Statut par défaut ("en attente")
- Calcul automatique MontantTVA

Toutes ces routes sont testées et fonctionnelles !
