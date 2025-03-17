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

// @Summary Lister toutes les factures
// @Description Retourne la liste complète des factures en base de données
// @Produce  json
// @Success 200 {array} models.Facture
// @Router /factures [get]
func GetFactures(w http.ResponseWriter, r *http.Request) {
	var facture []models.Facture
	config.DB.Find(&facture)
	json.NewEncoder(w).Encode(facture)
}

// @Summary Créer une facture
// @Description Ajoute une nouvelle facture en base de données
// @Accept  json
// @Produce  json
// @Param facture body models.Facture true "Détails de la facture"
// @Success 201 {object} models.Facture
// @Failure 400 {string} string "Requête invalide"
// @Failure 500 {string} string "Erreur serveur"
// @Router /factures [post]
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

// @Summary Récupérer une facture en PDF
// @Description Génère un PDF pour une facture donnée
// @Produce  application/pdf
// @Param id path int true "ID de la facture"
// @Success 200 {file} application/pdf
// @Failure 404 {string} string "Facture non trouvée"
// @Router /factures/{id}/pdf [get]
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
