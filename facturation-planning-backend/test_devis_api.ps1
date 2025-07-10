# Script PowerShell pour tester l'API Devis

Write-Host "🚀 Test des nouvelles fonctionnalités de devis avec relations" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

# Vérifier si le serveur est démarré
$BaseUrl = "http://localhost:8080"

Write-Host "🔄 Vérification du serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/devis" -Method Get -TimeoutSec 5
    Write-Host "✅ Serveur accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Serveur non accessible. Veuillez démarrer le serveur avec 'go run main.go'" -ForegroundColor Red
    Write-Host "💡 Ou relancer la migration avec 'go run main.go fresh'" -ForegroundColor Cyan
    exit 1
}

# Fonction pour afficher les réponses JSON
function Show-JsonResponse {
    param($Response)
    if ($Response) {
        $Response | ConvertTo-Json -Depth 10
    }
}

# 1. Test de création d'un devis
Write-Host "📝 1. Création d'un devis..." -ForegroundColor Yellow

$DevisData = @{
    entreprise_id = 1
    client_id = 1
    date_devis = "2025-01-15T00:00:00Z"
    date_expiration = "2025-02-15T00:00:00Z"
    objet = "Développement application web de gestion"
    conditions = "Devis valable 30 jours - Paiement à réception de facture"
    lignes = @(
        @{
            description = "Développement frontend React"
            quantite = 1
            prix_unitaire = 3000.00
            tva = 20.0
        },
        @{
            description = "Développement backend API Go"
            quantite = 1
            prix_unitaire = 2500.00
            tva = 20.0
        },
        @{
            description = "Formation utilisateurs (2 jours)"
            quantite = 2
            prix_unitaire = 500.00
            tva = 20.0
        }
    )
}

$DevisJson = $DevisData | ConvertTo-Json -Depth 10

try {
    $DevisResponse = Invoke-RestMethod -Uri "$BaseUrl/devis" -Method Post -Body $DevisJson -ContentType "application/json"
    Write-Host "✅ Devis créé avec l'ID: $($DevisResponse.id)" -ForegroundColor Green
    Show-JsonResponse $DevisResponse
    
    $DevisId = $DevisResponse.id
    
    # 2. Test de récupération du devis
    Write-Host "`n📖 2. Récupération du devis créé..." -ForegroundColor Yellow
    $DevisGetResponse = Invoke-RestMethod -Uri "$BaseUrl/devis/$DevisId" -Method Get
    Show-JsonResponse $DevisGetResponse
    
    # 3. Test de génération PDF
    Write-Host "`n📄 3. Test de génération PDF..." -ForegroundColor Yellow
    $PdfResponse = Invoke-WebRequest -Uri "$BaseUrl/devis/$DevisId/pdf" -Method Get
    $PdfPath = "devis_$DevisId.pdf"
    [System.IO.File]::WriteAllBytes($PdfPath, $PdfResponse.Content)
    
    if (Test-Path $PdfPath) {
        Write-Host "✅ PDF généré: $PdfPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la génération PDF" -ForegroundColor Red
    }
    
    # 4. Test de changement de statut
    Write-Host "`n🔄 4. Test de changement de statut..." -ForegroundColor Yellow
    $StatutData = @{ statut = "envoyé" }
    $StatutJson = $StatutData | ConvertTo-Json
    $StatutResponse = Invoke-RestMethod -Uri "$BaseUrl/devis/$DevisId/statut" -Method Patch -Body $StatutJson -ContentType "application/json"
    Show-JsonResponse $StatutResponse
    
} catch {
    Write-Host "❌ Erreur lors des tests: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test de récupération de tous les devis
Write-Host "`n📋 5. Récupération de tous les devis..." -ForegroundColor Yellow
try {
    $AllDevisResponse = Invoke-RestMethod -Uri "$BaseUrl/devis" -Method Get
    Show-JsonResponse $AllDevisResponse
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Test de récupération des devis par entreprise
Write-Host "`n🏢 6. Récupération des devis par entreprise..." -ForegroundColor Yellow
try {
    $EntrepriseDevisResponse = Invoke-RestMethod -Uri "$BaseUrl/entreprises/1/devis" -Method Get
    Show-JsonResponse $EntrepriseDevisResponse
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Test de récupération des devis par client
Write-Host "`n👤 7. Récupération des devis par client..." -ForegroundColor Yellow
try {
    $ClientDevisResponse = Invoke-RestMethod -Uri "$BaseUrl/clients/1/devis" -Method Get
    Show-JsonResponse $ClientDevisResponse
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Green
Write-Host "`n📝 Résumé des endpoints testés:" -ForegroundColor Cyan
Write-Host "- POST /devis                    ✅ Créer un devis" -ForegroundColor White
Write-Host "- GET  /devis/{id}               ✅ Récupérer un devis" -ForegroundColor White
Write-Host "- GET  /devis/{id}/pdf           ✅ Générer PDF" -ForegroundColor White
Write-Host "- PATCH /devis/{id}/statut       ✅ Changer statut" -ForegroundColor White
Write-Host "- GET  /devis                    ✅ Tous les devis" -ForegroundColor White
Write-Host "- GET  /entreprises/{id}/devis   ✅ Devis par entreprise" -ForegroundColor White
Write-Host "- GET  /clients/{id}/devis       ✅ Devis par client" -ForegroundColor White
