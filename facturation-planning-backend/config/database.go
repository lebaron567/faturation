package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// Récupérer les infos de connexion
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	// Si pas de port défini, utiliser le port par défaut
	if port == "" {
		port = "5432"
	}

	log.Printf("🔗 Tentative de connexion à la base de données...")
	log.Printf("   Host: %s, Port: %s, User: %s, DB: %s", host, port, user, dbName)

	// Connexion directe à la base de données
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbName, port,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("❌ Erreur de connexion à la base de données: %v", err)
		log.Printf("   DSN utilisé: host=%s user=%s dbname=%s port=%s sslmode=disable", host, user, dbName, port)
		log.Fatal("❌ Impossible de se connecter à la base de données")
	}

	log.Println("✅ Connexion à la base de données réussie")
}
