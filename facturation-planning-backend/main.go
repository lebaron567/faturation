package main

import (
	"log"
	//"os"

	"facturation-planning/config"
	"facturation-planning/database"
	"facturation-planning/routes"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	// Charger les variables d'environnement
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erreur de chargement du fichier .env")
	}

	// Connexion à la base de données
	config.ConnectDB()
	database.MigrateDB()

	r := routes.SetupRoutes()
	http.ListenAndServe(":8080", r)
}
