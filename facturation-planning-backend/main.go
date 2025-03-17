package main

import (
	"fmt"
	"log"
	"net/http"

	"facturation-planning/config"
	"facturation-planning/database"
	"facturation-planning/routes"

	_ "facturation-planning/docs" // Import des docs générées

	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Facturation API
// @version 1.0
// @description API pour gérer la facturation et les plannings
// @host localhost:8080
// @BasePath /
func main() {
	// Charger les variables d'environnement
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Erreur de chargement du fichier .env")
	}

	// Connexion à la base de données
	config.ConnectDB()
	database.MigrateDB()

	// Initialiser le routeur
	r := routes.SetupRoutes()

	// Ajouter la route Swagger
	r.Get("/swagger/*", httpSwagger.WrapHandler)

	// Démarrer le serveur
	port := ":8080"
	fmt.Println("🚀 Serveur démarré sur http://localhost" + port)
	fmt.Println("📖 Documentation Swagger : http://localhost" + port + "/swagger/index.html")

	log.Fatal(http.ListenAndServe(port, r))
}
