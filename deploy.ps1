# Script de deploiement PowerShell pour l'application de facturation
Write-Host "Deploiement de l'application de facturation" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Verifier que Docker est en marche
try {
    docker info *>$null
    Write-Host "Docker est operationnel" -ForegroundColor Green
}
catch {
    Write-Host "Docker n'est pas demarre. Veuillez lancer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verifier les fichiers requis
$requiredFiles = @(".env", "docker-compose.yml", "Caddyfile")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "Fichier manquant: $file" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Tous les fichiers requis sont presents" -ForegroundColor Green

# Verifier les Dockerfiles
$dockerfiles = @(
    "facturation-planning-backend\Dockerfile",
    "facturation-planning-frontend\Dockerfile"
)
foreach ($dockerfile in $dockerfiles) {
    if (-not (Test-Path $dockerfile)) {
        Write-Host "Dockerfile manquant: $dockerfile" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Tous les Dockerfiles sont presents" -ForegroundColor Green

# Arreter les containers existants
Write-Host "Arret des containers existants..." -ForegroundColor Yellow
docker-compose down

# Nettoyer les images orphelines
Write-Host "Nettoyage des images orphelines..." -ForegroundColor Yellow
docker image prune -f

# Lancer le build et demarrage
Write-Host "Build et demarrage des services..." -ForegroundColor Cyan
docker-compose up --build -d

# Attendre un peu que les services demarrent
Write-Host "Attente du demarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verifier le statut
Write-Host "Statut des services:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Deploiement termine!" -ForegroundColor Green
Write-Host "Application disponible sur: http://localhost" -ForegroundColor Cyan
Write-Host "Logs en temps reel: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "Arreter l'application: docker-compose down" -ForegroundColor Yellow

# Optionnel: Ouvrir le navigateur
$response = Read-Host "Voulez-vous ouvrir l'application dans le navigateur? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Start-Process "http://localhost"
}
