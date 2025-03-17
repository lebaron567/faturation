package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"net/http"
)

func GetEntreprises(w http.ResponseWriter, r *http.Request) {
	var entreprises []models.Entreprise
	config.DB.Find(&entreprises)
	json.NewEncoder(w).Encode(entreprises)
}

func CreateEntreprise(w http.ResponseWriter, r *http.Request) {
	var entreprise models.Entreprise
	json.NewDecoder(r.Body).Decode(&entreprise)
	config.DB.Create(&entreprise)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entreprise)
}
