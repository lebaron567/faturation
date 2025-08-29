# API FACTURES - Documentation Complete

## 1. Creer une facture classique
POST /factures

DONNEES A ENVOYER:
{
  "client_id": 1,
  "description": "Developpement site web",
  "type_facture": "classique",
  "date_emission": "2025-03-17T00:00:00Z",
  "date_echeance": "2025-04-17T00:00:00Z",
  "lieu_signature": "Paris",
  "date_signature": "17/03/2025",
  "lignes": [
    {
      "designation": "Developpement frontend",
      "unite": "jour",
      "quantite": 10,
      "prix_unitaire": 500.00,
      "tva": 20
    },
    {
      "designation": "Hebergement annuel",
      "unite": "forfait",
      "quantite": 1,
      "prix_unitaire": 200.00,
      "tva": 20
    }
  ]
}

REPONSE RECUE:
{
  "id": 1,
  "reference": "FAC-2025-001",
  "created_at": "2025-03-17T14:09:30.706109+01:00",
  "client_id": 1,
  "client": {
    "id": 1,
    "nom": "Entreprise ABC",
    "adresse": "123 Rue de la Paix, 75001 Paris",
    "email": "contact@abc.com",
    "telephone": "01 23 45 67 89"
  },
  "description": "Developpement site web",
  "type_facture": "classique",
  "date_emission": "2025-03-17T00:00:00Z",
  "date_echeance": "2025-04-17T00:00:00Z",
  "sous_total_ht": 5200.00,
  "total_tva": 1040.00,
  "total_ttc": 6240.00,
  "statut": "en_attente",
  "lieu_signature": "Paris",
  "date_signature": "17/03/2025",
  "lignes": [
    {
      "id": 1,
      "designation": "Developpement frontend",
      "unite": "jour",
      "quantite": 10,
      "prix_unitaire": 500.00,
      "montant_ht": 5000.00,
      "tva": 20,
      "montant_ttc": 6000.00
    },
    {
      "id": 2,
      "designation": "Hebergement annuel",
      "unite": "forfait",
      "quantite": 1,
      "prix_unitaire": 200.00,
      "montant_ht": 200.00,
      "tva": 20,
      "montant_ttc": 240.00
    }
  ]
}

## 2. Creer une facture d'acompte
POST /factures

DONNEES A ENVOYER:
{
  "client_id": 1,
  "description": "Acompte developpement site web",
  "type_facture": "acompte",
  "date_emission": "2025-03-17T00:00:00Z",
  "date_echeance": "2025-04-17T00:00:00Z",
  "devis_reference": "DEV-2025-001",
  "pourcentage_acompte": 50,
  "lieu_signature": "Paris",
  "date_signature": "17/03/2025",
  "lignes": [
    {
      "designation": "Acompte 50% developpement",
      "unite": "forfait",
      "quantite": 1,
      "prix_unitaire": 2500.00,
      "tva": 20
    }
  ]
}

## 3. Creer facture depuis un devis
POST /factures/from-devis/{devisId}

DONNEES A ENVOYER:
{
  "type_facture": "classique",
  "date_echeance": "2025-04-17T00:00:00Z",
  "lieu_signature": "Paris",
  "date_signature": "17/03/2025"
}

## 4. Recuperer toutes les factures
GET /factures

REPONSE:
[
  {
    "id": 1,
    "reference": "FAC-2025-001",
    "client_nom": "Entreprise ABC",
    "description": "Developpement site web",
    "type_facture": "classique",
    "total_ttc": 6240.00,
    "statut": "en_attente",
    "date_emission": "2025-03-17T00:00:00Z",
    "date_echeance": "2025-04-17T00:00:00Z"
  }
]

## 5. Recuperer une facture par ID
GET /factures/{id}

REPONSE: Facture complete avec toutes les lignes

## 6. Modifier une facture
PUT /factures/{id}

DONNEES A ENVOYER: Meme format que la creation, avec les champs a modifier

## 7. Supprimer une facture
DELETE /factures/{id}

REPONSE: { "message": "Facture supprimee avec succes" }

## 8. Generer PDF
GET /factures/{id}/pdf

REPONSE: PDF en ligne (Content-Type: application/pdf)

## 9. Telecharger PDF
GET /factures/{id}/download

REPONSE: Telechargement du PDF avec nom de fichier

## 10. Changer le statut
PUT /factures/{id}/statut

DONNEES A ENVOYER:
{
  "statut": "payee"
}

STATUTS POSSIBLES: "en_attente", "payee", "rejetee"

## 11. Rechercher des factures
GET /factures/search?q=ABC&statut=en_attente&annee=2025

PARAMETRES DE RECHERCHE:
- q : Terme de recherche (reference, client, description)
- statut : Filtrer par statut
- annee : Filtrer par annee

## 12. Factures par client
GET /factures/client/{clientId}

REPONSE: Liste des factures du client

## 13. Factures par statut
GET /factures/statut/{statut}

REPONSE: Liste des factures avec le statut donne

## TYPES DE FACTURES SUPPORTES:

1. Facture classique ("classique") : Facture complete normale
2. Facture d'acompte ("acompte") : Facture de paiement partiel avec pourcentage

## STRUCTURE COMPLETE D'UNE LIGNE DE FACTURE:

{
  "designation": "Description du service/produit",
  "unite": "jour/forfait/piece/heure",
  "quantite": 10.5,
  "prix_unitaire": 500.00,
  "tva": 20,
  "montant_ht": 5250.00,
  "montant_ttc": 6300.00
}

## CHAMPS OBLIGATOIRES POUR CREATION:

- client_id (obligatoire)
- description (obligatoire)
- type_facture (obligatoire: "classique" ou "acompte")
- date_emission (obligatoire)
- date_echeance (obligatoire)
- lignes (obligatoire, au moins une ligne)

## CHAMPS OPTIONNELS:

- lieu_signature
- date_signature
- devis_reference (pour les acomptes)
- pourcentage_acompte (pour les acomptes)

Toutes ces routes sont testees et fonctionnelles !
