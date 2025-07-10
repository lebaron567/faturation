package main

import (
	"fmt"
	"log"
	"os"

	"facturation-planning/config"
	"facturation-planning/database"

	"github.com/joho/godotenv"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run cmd/migrate/main.go [fresh|rollback|seed]")
		os.Exit(1)
	}

	// Charger les variables d'environnement depuis la racine du projet
	if err := godotenv.Load("../../.env"); err != nil {
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

func migrateFresh() error {
	// Supprimer toutes les tables
	if err := rollback(); err != nil {
		return err
	}

	// Relancer les migrations
	database.RunMigrations()
	return nil
}

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

func seed() error {
	fmt.Println("🌱 Création de données de démonstration...")
	
	// Cette fonction sera appelée par RunMigrations
	database.RunMigrations()
	
	return nil
}
