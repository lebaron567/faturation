package database

import (
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
)

func MigrateDB() {
	err := config.DB.AutoMigrate(
		&models.Entreprise{},
		&models.Salarie{},
		&models.Facture{},
		&models.Planning{},
		&models.Client{},
		&models.Devis{},
		&models.LigneDevis{},
	)

	if err != nil {
		fmt.Println("❌ Erreur de migration :", err)
	} else {
		fmt.Println("✅ Migration réussie !")
	}
}
