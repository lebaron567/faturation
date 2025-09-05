echo "Deploiement de l'application de facturation..."
echo "=============================================="

docker-compose down
docker image prune -f
docker-compose up --build -d

echo "Attente du demarrage..."
timeout /t 15 /nobreak >nul

docker-compose ps

echo ""
echo "Application disponible sur: http://localhost"
echo "Logs: docker-compose logs -f"
echo "Arreter: docker-compose down"

set /p response="Ouvrir dans le navigateur? (y/N): "
if /i "%response%"=="y" start http://localhost
