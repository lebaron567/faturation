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
		&models.LigneFacture{},
	)

	if err != nil {
		fmt.Println("❌ Erreur de migration des factures :", err)
		return
	}

	// Étape 4 : Migrer les tables devis (SANS suppression des données existantes)
	fmt.Println("🔄 Migration des tables devis...")
	err = config.DB.AutoMigrate(
		&models.Devis{},
		&models.LigneDevis{},
	)

	if err != nil {
		fmt.Println("❌ Erreur de migration des devis :", err)
		return
	}

	fmt.Println("✅ Migration réussie !")
}

// CleanDevisData nettoie les données et tables devis - ATTENTION: Supprime toutes les données devis !
// Cette fonction doit être appelée manuellement uniquement si vous voulez remettre à zéro les devis
func CleanDevisData() error {
	fmt.Println("⚠️  ATTENTION: Suppression de TOUTES les données devis...")

	// Supprimer les tables si elles existent avec l'ancien schéma
	// L'ordre est important : d'abord les tables dépendantes, puis les tables principales
	if err := config.DB.Exec("DROP TABLE IF EXISTS ligne_devis CASCADE").Error; err != nil {
		return fmt.Errorf("erreur lors de la suppression de la table ligne_devis : %v", err)
	}

	if err := config.DB.Exec("DROP TABLE IF EXISTS devis CASCADE").Error; err != nil {
		return fmt.Errorf("erreur lors de la suppression de la table devis : %v", err)
	}

	fmt.Println("🧹 Tables devis supprimées - Toutes les données devis ont été perdues !")
	return nil
}

// RunMigrations lance les migrations avec gestion des contraintes
func RunMigrations() {
	fmt.Println("🚀 Lancement des migrations...")
	MigrateDB()

	// Créer des données de test si nécessaire (seulement si aucune entreprise existe)
	if err := createTestData(); err != nil {
		fmt.Println("⚠️  Erreur lors de la création des données de test :", err)
	}
}

// createTestData crée des données de test pour démonstration (uniquement si la DB est vide)
func createTestData() error {
	// Vérifier si des entreprises existent déjà
	var count int64
	config.DB.Model(&models.Entreprise{}).Count(&count)

	if count == 0 {
		fmt.Println("🔄 Création de données de test (base de données vide)...")

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

		// Créer un devis de test
		devis := models.Devis{
			EntrepriseID: entreprise.ID,
			ClientID:     client.ID,
			Objet:        "Devis test - Développement application web",
			Statut:       "brouillon",
			Conditions:   "Paiement sous 30 jours",
		}

		if err := config.DB.Create(&devis).Error; err != nil {
			return fmt.Errorf("erreur lors de la création du devis de test : %v", err)
		}

		// Créer des lignes de devis de test
		lignes := []models.LigneDevis{
			{
				DevisID:      devis.ID,
				Description:  "Développement frontend React (5 jours)",
				Quantite:     1,
				PrixUnitaire: 2000,
				TVA:          20,
			},
			{
				DevisID:      devis.ID,
				Description:  "Développement backend Go (3 jours)",
				Quantite:     1,
				PrixUnitaire: 1350,
				TVA:          20,
			},
		}

		for _, ligne := range lignes {
			if err := config.DB.Create(&ligne).Error; err != nil {
				return fmt.Errorf("erreur lors de la création des lignes de devis : %v", err)
			}
		}

		fmt.Printf("✅ Devis de test créé - Devis ID: %d avec %d lignes\n", devis.ID, len(lignes))
	} else {
		fmt.Println("✅ Données existantes détectées - Pas de création de données de test")
	}

	return nil
}
