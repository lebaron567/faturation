package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"facturation-planning/utils"
	"fmt"
	"net/http"

	"github.com/go-chi/chi"
)

func GetFactures(w http.ResponseWriter, r *http.Request) {
	var facture []models.Facture
	config.DB.Find(&facture)
	json.NewEncoder(w).Encode(facture)
}

func CreateFacture(w http.ResponseWriter, r *http.Request) {
	var facture models.Facture
	json.NewDecoder(r.Body).Decode(&facture)

	// Insérer en base
	result := config.DB.Create(&facture)
	if result.Error != nil {
		http.Error(w, "Erreur lors de l'insertion de la facture", http.StatusInternalServerError)
		fmt.Println("❌ Erreur lors de l'insertion :", result.Error)
		return
	}

	fmt.Println("✅ Facture insérée avec ID :", facture.ID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(facture)
}

// Générer un PDF pour une facture spécifique
func GenerateFacturePDF(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Récupérer la facture depuis la base de données
	var facture models.Facture
	result := config.DB.First(&facture, id)
	if result.Error != nil {
		http.Error(w, "Facture non trouvée", http.StatusNotFound)
		return
	}

	// Générer le fichier PDF
	fileName, err := utils.GenerateInvoicePDF(facture)
	if err != nil {
		http.Error(w, "Erreur lors de la génération du PDF", http.StatusInternalServerError)
		return
	}

	// Retourner le PDF en réponse HTTP
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
	w.Header().Set("Content-Type", "application/pdf")
	http.ServeFile(w, r, fileName)
}
