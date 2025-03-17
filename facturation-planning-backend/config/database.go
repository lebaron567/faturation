package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	_ "github.com/lib/pq" // Import pour SQL natif
)

var DB *gorm.DB

func ConnectDB() {
	// Récupérer les infos de connexion
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	// Connexion à PostgreSQL sans base spécifique pour créer la DB
	dsnWithoutDB := fmt.Sprintf(
		"host=%s user=%s password=%s port=%s sslmode=disable",
		host, user, password, port,
	)

	sqlDB, err := sql.Open("postgres", dsnWithoutDB)
	if err != nil {
		log.Fatal("❌ Erreur de connexion à PostgreSQL :", err)
	}
	defer sqlDB.Close()

	// Vérifier si la base existe
	var exists bool
	query := fmt.Sprintf("SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = '%s')", dbName)
	err = sqlDB.QueryRow(query).Scan(&exists)
	if err != nil {
		log.Fatal("❌ Erreur lors de la vérification de la base :", err)
	}

	// Si la base n'existe pas, on la crée
	if !exists {
		fmt.Println("⚠️  Base de données non trouvée. Création en cours...")
		_, err = sqlDB.Exec(fmt.Sprintf("CREATE DATABASE %s", dbName))
		if err != nil {
			log.Fatal("❌ Erreur lors de la création de la base :", err)
		}
		fmt.Println("✅ Base de données créée avec succès !")
	}

	// Connexion à la base créée
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbName, port,
	)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur de connexion à la base de données :", err)
	}

	fmt.Println("✅ Connexion à la base de données réussie")
}
