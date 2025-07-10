package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"facturation-planning/config"
	"facturation-planning/database"
	"facturation-planning/models"
	"facturation-planning/routes"

	_ "facturation-planning/docs" // Import des docs générées

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Facturation API
// @version 1.0
// @description API pour gérer la facturation et les plannings
// @host localhost:8080
// @BasePath /
func main() {
	// Vérifier si des arguments sont fournis pour les commandes de migration
	if len(os.Args) > 1 {
		handleMigrationCommand()
		return
	}

	// Charger les variables d'environnement
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Erreur de chargement du fichier .env")
	}

	// Connexion à la base de données
	config.ConnectDB()
	database.RunMigrations()

	// 🔥 Créer un nouveau routeur Chi
	r := chi.NewRouter()

	// ✅ Ajouter CORS **AVANT** d'enregistrer les routes
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// ✅ Enregistrer les routes après avoir défini les middlewares
	r.Mount("/", routes.SetupRoutes())

	// ✅ Ajouter la route Swagger
	r.Get("/swagger/*", httpSwagger.WrapHandler)

	// ✅ Démarrer le serveur
	port := ":8080"
	fmt.Println("🚀 Serveur démarré sur http://localhost" + port)
	fmt.Println("📖 Documentation Swagger : http://localhost" + port + "/swagger/index.html")

	log.Fatal(http.ListenAndServe(port, r))
}

// handleMigrationCommand gère les commandes de migration
func handleMigrationCommand() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run main.go [fresh|rollback|seed]")
		os.Exit(1)
	}

	// Charger les variables d'environnement
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Erreur de chargement du fichier .env")
	}

	// Connexion à la base de données
	config.ConnectDB()

	command := os.Args[1]

	switch command {
	case "fresh":
		fmt.Println("🔄 Migration fresh - Suppression et recréation de toutes les tables...")
		if err := migrateFresh(); err != nil {
			log.Fatal("❌ Erreur lors de la migration fresh:", err)
		}
		fmt.Println("✅ Migration fresh terminée!")

	case "rollback":
		fmt.Println("🔄 Rollback - Suppression de toutes les tables...")
		if err := rollback(); err != nil {
			log.Fatal("❌ Erreur lors du rollback:", err)
		}
		fmt.Println("✅ Rollback terminé!")

	case "seed":
		fmt.Println("🔄 Seeding - Création de données de test...")
		if err := seed(); err != nil {
			log.Fatal("❌ Erreur lors du seeding:", err)
		}
		fmt.Println("✅ Seeding terminé!")

	default:
		fmt.Println("❌ Commande inconnue. Utilisez: fresh, rollback, ou seed")
		os.Exit(1)
	}
}

// migrateFresh supprime et recrée toutes les tables
func migrateFresh() error {
	// Supprimer toutes les tables
	if err := rollback(); err != nil {
		return err
	}

	// Relancer les migrations
	database.RunMigrations()
	return nil
}

// rollback supprime toutes les tables
func rollback() error {
	// Supprimer toutes les tables dans l'ordre inverse des dépendances
	tables := []string{
		"ligne_devis",
		"devis",
		"factures",
		"plannings",
		"clients",
		"salaries",
		"entreprises",
	}

	for _, table := range tables {
		if err := config.DB.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s CASCADE", table)).Error; err != nil {
			return fmt.Errorf("erreur lors de la suppression de %s: %v", table, err)
		}
		fmt.Printf("🗑️  Table %s supprimée\n", table)
	}

	return nil
}

// seed crée des données de test
func seed() error {
	fmt.Println("🌱 Création de données de démonstration...")

	// Vérifier si des entreprises existent déjà
	var count int64
	config.DB.Model(&models.Entreprise{}).Count(&count)

	if count == 0 {
		// Créer une entreprise de test
		entreprise := models.Entreprise{
			Nom:         "ODI SERVICE PRO",
			Adresse:     "23 RUE ERIC TABARLY",
			Email:       "aide.odiservicepro@gmail.com",
			Telephone:   "02 51 99 36 91",
			SIRET:       "83377432600023",
			TVA:         "FR92833774326",
			Responsable: "Émeric",
		}

		if err := config.DB.Create(&entreprise).Error; err != nil {
			return fmt.Errorf("erreur lors de la création de l'entreprise : %v", err)
		}

		// Créer un client de test
		client := models.Client{
			Nom:          "Entreprise Test SARL",
			Adresse:      "456 Avenue de la République\n44000 Nantes",
			Email:        "contact@entreprise-test.fr",
			Telephone:    "02 40 98 76 54",
			EntrepriseID: entreprise.ID,
		}

		if err := config.DB.Create(&client).Error; err != nil {
			return fmt.Errorf("erreur lors de la création du client : %v", err)
		}

		fmt.Printf("✅ Données de test créées - Entreprise ID: %d, Client ID: %d\n", entreprise.ID, client.ID)
	} else {
		fmt.Println("ℹ️  Données de test déjà existantes")
	}

	return nil
}
