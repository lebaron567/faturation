echo "=== APPLICATION DE FACTURATION ==="
echo "Deploiement frontend uniquement (API en cours de debug)"
echo ""

docker-compose down 2>nul
docker-compose -f docker-compose.frontend-only.yml down 2>nul

echo "Lancement du frontend..."
docker-compose -f docker-compose.frontend-only.yml up --build -d

echo ""
echo "Attente du demarrage..."
timeout /t 10 /nobreak >nul

docker-compose -f docker-compose.frontend-only.yml ps

echo ""
echo "FRONTEND PRET!"
echo "Application disponible sur: http://localhost"
echo ""
echo "Note: L'API backend est en cours de configuration"
echo "Pour arreter: docker-compose -f docker-compose.frontend-only.yml down"

set /p response="Ouvrir dans le navigateur? (y/N): "
if /i "%response%"=="y" start http://localhost
