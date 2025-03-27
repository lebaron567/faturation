package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// @Summary Récupérer tous les plannings
// @Description Retourne la liste complète des plannings enregistrés
// @Produce json
// @Success 200 {array} models.Planning
// @Router /plannings [get]
func GetPlannings(w http.ResponseWriter, r *http.Request) {
	var plannings []models.Planning
	config.DB.Preload("Salarie").Find(&plannings)
	json.NewEncoder(w).Encode(plannings)
}

// @Summary Créer un planning
// @Description Ajoute un nouveau planning en base de données
// @Accept json
// @Produce json
// @Param planning body models.Planning true "Détails du planning"
// @Success 201 {object} models.Planning
// @Failure 400 {string} string "Requête invalide"
// @Failure 500 {string} string "Erreur serveur"
// @Router /plannings [post]
func CreatePlanning(w http.ResponseWriter, r *http.Request) {
	var planning models.Planning
	json.NewDecoder(r.Body).Decode(&planning)
	config.DB.Create(&planning)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(planning)
	if planning.SalarieID == 0 {
		http.Error(w, "Le salarie_id est obligatoire", http.StatusBadRequest)
		return
	}
	fmt.Printf("📥 Nouveau planning reçu : %+v\n", planning)

}

// @Summary Modifier un planning
// @Description Met à jour un planning existant par son ID
// @Accept json
// @Produce json
// @Param id path int true "ID du planning"
// @Param planning body models.Planning true "Nouvelles informations du planning"
// @Success 200 {object} models.Planning
// @Failure 400 {string} string "Requête invalide"
// @Failure 404 {string} string "Planning non trouvé"
// @Failure 500 {string} string "Erreur serveur"
// @Router /plannings/{id} [put]
func UpdatePlanning(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var planning models.Planning
	config.DB.First(&planning, id)

	if planning.ID == 0 {
		http.Error(w, "Planning non trouvé", http.StatusNotFound)
		return
	}

	json.NewDecoder(r.Body).Decode(&planning)
	config.DB.Save(&planning)
	json.NewEncoder(w).Encode(planning)
}

// @Summary Supprimer un planning
// @Description Supprime un planning par son ID
// @Param id path int true "ID du planning"
// @Success 204 "No Content"
// @Failure 404 {string} string "Planning non trouvé"
// @Failure 500 {string} string "Erreur serveur"
// @Router /plannings/{id} [delete]
func DeletePlanning(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	config.DB.Delete(&models.Planning{}, id)
	w.WriteHeader(http.StatusNoContent)
}
