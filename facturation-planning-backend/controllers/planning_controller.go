package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"net/http"

	"log"
	"time"

	"github.com/go-chi/chi/v5"
)

// @Summary Récupérer tous les plannings
// @Description Retourne la liste complète des plannings enregistrés
// @Tags Planning
// @Produce json
// @Success 200 {array} models.Planning
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/plannings [get]
func GetPlannings(w http.ResponseWriter, r *http.Request) {
	var plannings []models.Planning
	config.DB.Preload("Salarie").Find(&plannings)
	json.NewEncoder(w).Encode(plannings)
}

// @Summary Créer un planning
// @Description Ajoute un nouveau planning en base de données
// @Tags Planning
// @Accept json
// @Produce json
// @Param planning body models.Planning true "Détails du planning"
// @Success 201 {object} models.Planning
// @Failure 400 {string} string "Requête invalide"
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/plannings [post]
func CreatePlanning(w http.ResponseWriter, r *http.Request) {
	var planning models.Planning
	if err := json.NewDecoder(r.Body).Decode(&planning); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if planning.NbRepetitions <= 0 {
		planning.NbRepetitions = 1
	}

	date, err := time.Parse("2006-01-02", planning.Date)
	if err != nil {
		http.Error(w, "Date invalide", http.StatusBadRequest)
		return
	}

	var createdPlannings []models.Planning

	for i := 0; i < planning.NbRepetitions; i++ {
		newDate := date.AddDate(0, 0, i*7)
		copyPlanning := planning
		copyPlanning.ID = 0
		copyPlanning.Date = newDate.Format("2006-01-02")

		if err := config.DB.Create(&copyPlanning).Error; err != nil {
			log.Println("❌ Erreur lors de la création répétée :", err)
			continue
		}

		createdPlannings = append(createdPlannings, copyPlanning)
	}

	// Renvoie tous les plannings créés
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdPlannings)
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
	fmt.Println("🧨 Suppression demandée pour l'ID :", id)

	// Suppression définitive sans passer par DeletedAt
	if err := config.DB.Unscoped().Delete(&models.Planning{}, id).Error; err != nil {
		fmt.Println("❌ Erreur de suppression :", err)
		http.Error(w, "Erreur lors de la suppression", http.StatusInternalServerError)
		return
	}

	fmt.Printf("🗑️ Planning supprimé ID %s\n", id)
	w.WriteHeader(http.StatusNoContent)
}

// @Summary Récupérer les types d'événements
// @Description Retourne la liste des types d'événements disponibles pour les plannings
// @Tags Planning
// @Produce json
// @Success 200 {array} string
// @Router /api/plannings/types-evenements [get]
func GetTypesEvenements(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	types := models.GetTypesEvenements()
	json.NewEncoder(w).Encode(types)
}
