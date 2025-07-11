package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"net/http"
)

// GetClients retourne tous les clients
// @Summary Récupérer tous les clients
// @Description Retourne la liste complète de tous les clients
// @Tags Clients
// @Accept json
// @Produce json
// @Success 200 {array} models.Client
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/clients [get]
func GetClients(w http.ResponseWriter, r *http.Request) {
	var clients []models.Client
	result := config.DB.Find(&clients)

	if result.Error != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clients)
}

// CreateClient crée un nouveau client
// @Summary Créer un nouveau client
// @Description Crée un nouveau client avec les informations fournies
// @Tags Clients
// @Accept json
// @Produce json
// @Param client body models.Client true "Informations du client"
// @Success 201 {object} models.Client
// @Failure 400 {string} string "Requête invalide"
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/clients [post]
func CreateClient(w http.ResponseWriter, r *http.Request) {
	var client models.Client
	if err := json.NewDecoder(r.Body).Decode(&client); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}

	if err := config.DB.Create(&client).Error; err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(client)
}
