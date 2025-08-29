# Script de test pour les signatures

# Test création d'un devis avec signatures
$devisBody = @{
    entreprise_id   = 1
    client_id       = 1
    date_devis      = "2025-08-27T00:00:00Z"
    date_expiration = "2025-09-27T00:00:00Z"
    objet           = "Développement site web avec signatures"
    lieu_signature  = "Paris"
    date_signature  = "27/08/2025"
    conditions      = "Paiement sous 30 jours"
    lignes          = @(
        @{
            description   = "Développement frontend React"
            quantite      = 1
            prix_unitaire = 2000.0
            tva           = 20.0
        }
        @{
            description   = "Développement backend Go"
            quantite      = 1
            prix_unitaire = 1800.0
            tva           = 20.0
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "Création d'un devis avec informations de signature..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/devis" -Method POST -Body $devisBody -ContentType "application/json"
    Write-Host "Devis créé avec succès !" -ForegroundColor Green
    
    # Récupérer l'ID du devis créé
    $devisId = ($response.Content | ConvertFrom-Json).id
    Write-Host "ID du devis: $devisId" -ForegroundColor Cyan
    
    # Générer le PDF
    Write-Host "Génération du PDF avec signatures..." -ForegroundColor Yellow
    $pdfResponse = Invoke-WebRequest -Uri "http://localhost:8080/devis/$devisId/pdf" -Method GET -OutFile "devis_avec_signatures.pdf"
    
    Write-Host "PDF généré: devis_avec_signatures.pdf" -ForegroundColor Green
    
}
catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

# Test création d'une facture avec signatures  
$factureBody = @{
    client_id      = 1
    reference      = "F-2025-SIGN-001"
    date_emission  = "2025-08-27T00:00:00Z"
    date_echeance  = "2025-09-27T00:00:00Z"
    type_facture   = "classique"
    description    = "Développement application complète"
    sous_total_ht  = 3800.0
    total_tva      = 760.0
    total_ttc      = 4560.0
    lieu_signature = "Lyon"
    date_signature = "27/08/2025"
    statut         = "en_attente"
} | ConvertTo-Json -Depth 3

Write-Host "`nCréation d'une facture avec informations de signature..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/factures" -Method POST -Body $factureBody -ContentType "application/json"
    Write-Host "Facture créée avec succès !" -ForegroundColor Green
    
    # Récupérer l'ID de la facture créée
    $factureId = ($response.Content | ConvertFrom-Json).id
    Write-Host "ID de la facture: $factureId" -ForegroundColor Cyan
    
    # Générer le PDF
    Write-Host "Génération du PDF facture avec signatures..." -ForegroundColor Yellow
    $pdfResponse = Invoke-WebRequest -Uri "http://localhost:8080/factures/$factureId/pdf" -Method GET -OutFile "facture_avec_signatures.pdf"
    
    Write-Host "PDF généré: facture_avec_signatures.pdf" -ForegroundColor Green
    
}
catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

Write-Host "`n✨ Tests terminés ! Vérifiez les fichiers PDF générés." -ForegroundColor Magenta
