package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"net/http"
)

// CreateDevis godoc
// @Summary Créer un devis complet
// @Description Crée un devis avec les informations client, les dates et les lignes de devis
// @Tags Devis
// @Accept json
// @Produce json
// @Param devis body models.Devis true "Données du devis à créer"
// @Success 201 {object} models.Devis
// @Failure 400 {string} string "Requête invalide"
// @Failure 500 {string} string "Erreur serveur"
// @Router /devis [post]
func CreateDevis(w http.ResponseWriter, r *http.Request) {
	var devis models.Devis

	if err := json.NewDecoder(r.Body).Decode(&devis); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf("➡️ Devis reçu : %+v\n", devis) // 👈 ajoute ce log

	// Création du devis + lignes associées (cascade via GORM)
	if err := config.DB.Create(&devis).Error; err != nil {
		fmt.Printf("❌ ERREUR INSERT : %v\n", err) // 👈 log erreur
		http.Error(w, "Erreur lors de la création du devis", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(devis)
}
