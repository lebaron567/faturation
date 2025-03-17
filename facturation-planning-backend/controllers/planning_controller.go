package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func GetPlannings(w http.ResponseWriter, r *http.Request) {
	var plannings []models.Planning
	config.DB.Find(&plannings)
	json.NewEncoder(w).Encode(plannings)
}

func CreatePlanning(w http.ResponseWriter, r *http.Request) {
	var planning models.Planning
	json.NewDecoder(r.Body).Decode(&planning)
	config.DB.Create(&planning)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(planning)
}

func ConvertPlanningToFacture(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var planning models.Planning

	if err := config.DB.First(&planning, id).Error; err != nil {
		http.Error(w, "Planning non trouvé", http.StatusNotFound)
		return
	}

	// Création de la facture à partir du planning
	facture := models.Facture{
		Numero:       "FCT-" + id, // Génération d’un numéro basique
		Type:         "standard",
		MontantHT:    1000, // À calculer dynamiquement
		MontantTTC:   1200, // Si TVA = 20%
		TauxTVA:      20.0,
		DateEmission: "2025-03-17", // Exemple de date
		DateEcheance: "2025-04-17",
		Statut:       "en attente",
		Description:  "Facturation du planning " + planning.Nom,
		EntrepriseID: planning.EntrepriseID,
		PlanningID:   &planning.ID,
	}

	config.DB.Create(&facture)

	// Mise à jour du planning comme terminé
	planning.Statut = "terminé"
	config.DB.Save(&planning)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(facture)
}
