package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"net/http"
)

func GetFactures(w http.ResponseWriter, r *http.Request) {
	var facture []models.Facture
	config.DB.Find(&facture)
	json.NewEncoder(w).Encode(facture)
}

func CreateFacture(w http.ResponseWriter, r *http.Request) {
	var facture models.Facture
	json.NewDecoder(r.Body).Decode(&facture)
	config.DB.Create(&facture)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(facture)
}
