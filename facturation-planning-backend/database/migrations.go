package database

import (
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
)

func MigrateDB() {
	// Migration en plusieurs étapes pour éviter les conflits de clés étrangères
	
	// Étape 1 : Migrer les tables sans dépendances
	fmt.Println("🔄 Migration des tables de base...")
	err := config.DB.AutoMigrate(
		&models.Entreprise{},
		&models.Salarie{},
		&models.Client{},
	)
	
	if err != nil {
		fmt.Println("❌ Erreur de migration des tables de base :", err)
		return
	}
	
	// Étape 2 : Migrer les tables avec dépendances simples
	fmt.Println("🔄 Migration des tables avec dépendances...")
	err = config.DB.AutoMigrate(
		&models.Planning{},
	)
	
	if err != nil {
		fmt.Println("❌ Erreur de migration des tables avec dépendances :", err)
		return
	}
	
	// Étape 3 : Migrer les tables avec dépendances complexes
	fmt.Println("🔄 Migration des tables avec dépendances complexes...")
	err = config.DB.AutoMigrate(
		&models.Facture{},
	)
	
	if err != nil {
		fmt.Println("❌ Erreur de migration des factures :", err)
		return
	}
	
	// Étape 4 : Nettoyer les données existantes dans devis
	fmt.Println("🔄 Nettoyage des données devis existantes...")
	if err := cleanExistingDevisData(); err != nil {
		fmt.Println("❌ Erreur lors du nettoyage :", err)
		return
	}
	
	// Étape 5 : Migrer les tables devis
	fmt.Println("🔄 Migration des tables devis...")
	err = config.DB.AutoMigrate(
		&models.Devis{},
		&models.LigneDevis{},
	)

	if err != nil {
		fmt.Println("❌ Erreur de migration des tables devis :", err)
		return
	}
	
	fmt.Println("✅ Migration réussie !")
}

// cleanExistingDevisData nettoie les données et tables existantes qui pourraient violer les contraintes
func cleanExistingDevisData() error {
	// Supprimer les tables si elles existent avec l'ancien schéma
	// L'ordre est important : d'abord les tables dépendantes, puis les tables principales
	if err := config.DB.Exec("DROP TABLE IF EXISTS ligne_devis CASCADE").Error; err != nil {
		return fmt.Errorf("erreur lors de la suppression de la table ligne_devis : %v", err)
	}
	
	if err := config.DB.Exec("DROP TABLE IF EXISTS devis CASCADE").Error; err != nil {
		return fmt.Errorf("erreur lors de la suppression de la table devis : %v", err)
	}
	
	fmt.Println("🧹 Tables devis existantes supprimées (si elles existaient)")
	return nil
}

// RunMigrations lance les migrations avec gestion des contraintes
func RunMigrations() {
	fmt.Println("🚀 Lancement des migrations...")
	MigrateDB()
	
	// Créer des données de test si nécessaire
	if err := createTestData(); err != nil {
		fmt.Println("⚠️  Erreur lors de la création des données de test :", err)
	}
}

// createTestData crée des données de test pour démonstration
func createTestData() error {
	// Vérifier si des entreprises existent déjà
	var count int64
	config.DB.Model(&models.Entreprise{}).Count(&count)
	
	if count == 0 {
		fmt.Println("🔄 Création de données de test...")
		
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
	}
	
	return nil
}
