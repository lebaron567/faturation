package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"net/http"
)

func GetSalaries(w http.ResponseWriter, r *http.Request) {
	var salarie []models.Salarie
	config.DB.Find(&salarie)
	json.NewEncoder(w).Encode(salarie)
}

func CreateSalarie(w http.ResponseWriter, r *http.Request) {
	var salaries models.Salarie
	json.NewDecoder(r.Body).Decode(&salaries)
	config.DB.Create(&salaries)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(salaries)
}
