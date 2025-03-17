package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"net/http"
	"strings"
)

// @Summary Récupérer tous les salariés
// @Description Retourne la liste des salariés enregistrés
// @Produce  json
// @Success 200 {array} models.Salarie
// @Router /salaries [get]
func GetSalaries(w http.ResponseWriter, r *http.Request) {
	var salaries []models.Salarie
	config.DB.Find(&salaries)
	json.NewEncoder(w).Encode(salaries)
}

// @Summary Créer un salarié
// @Description Ajoute un nouveau salarié à la base de données
// @Accept  json
// @Produce  json
// @Param salarie body models.Salarie true "Détails du salarié"
// @Success 201 {object} models.Salarie
// @Failure 400 {string} string "Requête invalide"
// @Failure 500 {string} string "Erreur serveur"
// @Router /salaries [post]
func CreateSalarie(w http.ResponseWriter, r *http.Request) {
	var salarie models.Salarie

	// Décoder la requête JSON
	if err := json.NewDecoder(r.Body).Decode(&salarie); err != nil {
		http.Error(w, "Erreur de décodage JSON", http.StatusBadRequest)
		fmt.Println("❌ Erreur de décodage JSON:", err)
		return
	}

	// Vérifier si les champs obligatoires sont remplis
	if strings.TrimSpace(salarie.Nom) == "" || strings.TrimSpace(salarie.Email) == "" {
		http.Error(w, "Le nom et l'email sont obligatoires", http.StatusBadRequest)
		fmt.Println("❌ Champ vide détecté")
		return
	}

	// Insérer en base
	result := config.DB.Create(&salarie)
	if result.Error != nil {
		http.Error(w, "Erreur lors de l'enregistrement", http.StatusInternalServerError)
		fmt.Println("❌ Erreur SQL :", result.Error)
		return
	}

	fmt.Println("✅ Salarié créé avec succès :", salarie.Nom)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(salarie)
}
