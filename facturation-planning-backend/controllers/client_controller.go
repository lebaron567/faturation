package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"net/http"
)

// GetClients retourne tous les clients
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
