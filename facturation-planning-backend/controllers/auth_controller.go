package controllers

import (
	"encoding/json"
	"facturation-planning/auth"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// Enregistrement d'une entreprise (création du compte)
func RegisterEntreprise(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Nom      string `json:"nom"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Erreur de décodage JSON", http.StatusBadRequest)
		return
	}

		// Afficher les données reçues
		fmt.Println("📌 Données reçues:", input)

	// Vérifier si les champs sont remplis
	if input.Email == "" || input.Password == "" || input.Nom == "" {
		http.Error(w, "Tous les champs sont obligatoires", http.StatusBadRequest)
		return
	}

	// Vérifier si l'email existe déjà
	var existingEntreprise models.Entreprise
	if err := config.DB.Where("email = ?", input.Email).First(&existingEntreprise).Error; err == nil {
		http.Error(w, "Cet email est déjà utilisé", http.StatusConflict)
		return
	}

	fmt.Println("📌 Mot de passe en clair avant hashage:", input.Password)

	// Hash du mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erreur lors du hachage du mot de passe", http.StatusInternalServerError)
		return
	}

	// Afficher le mot de passe haché pour vérification
	fmt.Println("📌 Mot de passe haché avant stockage:", string(hashedPassword))

	// Créer l'entreprise avec les données validées
	entreprise := models.Entreprise{
		Nom:      input.Nom,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	// Enregistrer en base
	result := config.DB.Create(&entreprise)
	if result.Error != nil {
		http.Error(w, "Erreur lors de la création du compte", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Compte entreprise créé avec succès"})
}

// Connexion d'une entreprise
func LoginEntreprise(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Erreur de décodage JSON", http.StatusBadRequest)
		return
	}

	// Vérifier si les champs sont remplis
	if input.Email == "" || input.Password == "" {
		http.Error(w, "Email et mot de passe sont obligatoires", http.StatusBadRequest)
		return
	}

	// Vérifier si l'entreprise existe
	var entreprise models.Entreprise
	result := config.DB.Where("email = ?", input.Email).First(&entreprise)
	if result.Error != nil {
		http.Error(w, "Compte non trouvé", http.StatusUnauthorized)
		return
	}

	// Afficher les valeurs pour debug
	fmt.Println("📌 Mot de passe stocké en base:", entreprise.Password)
	fmt.Println("📌 Mot de passe fourni:", input.Password)

	// Supprimer les espaces invisibles du mot de passe fourni
	input.Password = strings.TrimSpace(input.Password)

	// Vérifier le mot de passe
	err = bcrypt.CompareHashAndPassword([]byte(entreprise.Password), []byte(input.Password))
	if err != nil {
		fmt.Println("❌ Comparaison échouée :", err)
		http.Error(w, "Mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Générer un token JWT
	token, err := auth.GenerateJWT(entreprise.ID)
	if err != nil {
		http.Error(w, "Erreur lors de la génération du token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// Récupération du profil de l'entreprise connectée
func GetProfile(w http.ResponseWriter, r *http.Request) {
	entrepriseID, ok := r.Context().Value("entrepriseID").(float64)
	if !ok {
		http.Error(w, "Erreur d'authentification", http.StatusUnauthorized)
		return
	}

	var entreprise models.Entreprise
	result := config.DB.First(&entreprise, uint(entrepriseID))
	if result.Error != nil {
		http.Error(w, "Entreprise non trouvée", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(entreprise)
}
