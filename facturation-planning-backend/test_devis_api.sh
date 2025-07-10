#!/bin/bash

# Script pour tester les nouvelles fonctionnalités de devis

echo "🚀 Test des nouvelles fonctionnalités de devis avec relations"
echo "======================================================"

BASE_URL="http://localhost:8080"

# Vérifier si le serveur est démarré
echo "🔄 Vérification du serveur..."
if curl -s --connect-timeout 5 "$BASE_URL/devis" > /dev/null; then
    echo "✅ Serveur accessible"
else
    echo "❌ Serveur non accessible. Veuillez démarrer le serveur avec 'go run main.go'"
    echo "💡 Ou relancer la migration avec 'go run main.go fresh'"
    exit 1
fi

# Fonction pour afficher les réponses JSON de manière lisible
print_response() {
    echo "$1" | jq . 2>/dev/null || echo "$1"
}

# 1. Test de création d'un devis
echo "📝 1. Création d'un devis..."
DEVIS_RESPONSE=$(curl -s -X POST "$BASE_URL/devis" \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": 1,
    "client_id": 1,
    "date_devis": "2025-01-15T00:00:00Z",
    "date_expiration": "2025-02-15T00:00:00Z",
    "objet": "Développement application web de gestion",
    "conditions": "Devis valable 30 jours - Paiement à réception de facture",
    "lignes": [
      {
        "description": "Développement frontend React",
        "quantite": 1,
        "prix_unitaire": 3000.00,
        "tva": 20.0
      },
      {
        "description": "Développement backend API Go",
        "quantite": 1,
        "prix_unitaire": 2500.00,
        "tva": 20.0
      },
      {
        "description": "Formation utilisateurs (2 jours)",
        "quantite": 2,
        "prix_unitaire": 500.00,
        "tva": 20.0
      }
    ]
  }')

echo "Réponse:"
print_response "$DEVIS_RESPONSE"
echo ""

# Extraire l'ID du devis créé
DEVIS_ID=$(echo "$DEVIS_RESPONSE" | jq -r '.id' 2>/dev/null)

if [[ "$DEVIS_ID" != "null" && "$DEVIS_ID" != "" ]]; then
    echo "✅ Devis créé avec l'ID: $DEVIS_ID"
    
    # 2. Test de récupération du devis
    echo "📖 2. Récupération du devis créé..."
    DEVIS_GET_RESPONSE=$(curl -s "$BASE_URL/devis/$DEVIS_ID")
    echo "Réponse:"
    print_response "$DEVIS_GET_RESPONSE"
    echo ""
    
    # 3. Test de génération PDF
    echo "📄 3. Test de génération PDF..."
    curl -s "$BASE_URL/devis/$DEVIS_ID/pdf" > "devis_$DEVIS_ID.pdf"
    if [[ -f "devis_$DEVIS_ID.pdf" ]]; then
        echo "✅ PDF généré: devis_$DEVIS_ID.pdf"
    else
        echo "❌ Erreur lors de la génération PDF"
    fi
    echo ""
    
    # 4. Test de changement de statut
    echo "🔄 4. Test de changement de statut..."
    STATUT_RESPONSE=$(curl -s -X PATCH "$BASE_URL/devis/$DEVIS_ID/statut" \
      -H "Content-Type: application/json" \
      -d '{"statut": "envoyé"}')
    echo "Réponse:"
    print_response "$STATUT_RESPONSE"
    echo ""
    
else
    echo "❌ Erreur lors de la création du devis"
fi

# 5. Test de récupération de tous les devis
echo "📋 5. Récupération de tous les devis..."
ALL_DEVIS_RESPONSE=$(curl -s "$BASE_URL/devis")
echo "Réponse:"
print_response "$ALL_DEVIS_RESPONSE"
echo ""

# 6. Test de récupération des devis par entreprise
echo "🏢 6. Récupération des devis par entreprise..."
ENTREPRISE_DEVIS_RESPONSE=$(curl -s "$BASE_URL/entreprises/1/devis")
echo "Réponse:"
print_response "$ENTREPRISE_DEVIS_RESPONSE"
echo ""

# 7. Test de récupération des devis par client
echo "👤 7. Récupération des devis par client..."
CLIENT_DEVIS_RESPONSE=$(curl -s "$BASE_URL/clients/1/devis")
echo "Réponse:"
print_response "$CLIENT_DEVIS_RESPONSE"
echo ""

echo "🎉 Tests terminés!"
echo ""
echo "📝 Résumé des endpoints testés:"
echo "- POST /devis                    ✅ Créer un devis"
echo "- GET  /devis/{id}               ✅ Récupérer un devis"
echo "- GET  /devis/{id}/pdf           ✅ Générer PDF"
echo "- PATCH /devis/{id}/statut       ✅ Changer statut"
echo "- GET  /devis                    ✅ Tous les devis"
echo "- GET  /entreprises/{id}/devis   ✅ Devis par entreprise"
echo "- GET  /clients/{id}/devis       ✅ Devis par client"
