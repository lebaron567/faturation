package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"net/http"
)

// GetEntreprises retourne toutes les entreprises
// @Summary Récupérer toutes les entreprises
// @Description Retourne la liste complète de toutes les entreprises
// @Tags Entreprises
// @Accept json
// @Produce json
// @Success 200 {array} models.Entreprise
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/entreprises [get]
func GetEntreprises(w http.ResponseWriter, r *http.Request) {
	var entreprises []models.Entreprise
	config.DB.Find(&entreprises)
	json.NewEncoder(w).Encode(entreprises)
}

// CreateEntreprise crée une nouvelle entreprise
// @Summary Créer une nouvelle entreprise
// @Description Crée une nouvelle entreprise avec les informations fournies
// @Tags Entreprises
// @Accept json
// @Produce json
// @Param entreprise body models.Entreprise true "Informations de l'entreprise"
// @Success 201 {object} models.Entreprise
// @Failure 400 {string} string "Requête invalide"
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/entreprises [post]
func CreateEntreprise(w http.ResponseWriter, r *http.Request) {
	var entreprise models.Entreprise
	json.NewDecoder(r.Body).Decode(&entreprise)
	config.DB.Create(&entreprise)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entreprise)
}
