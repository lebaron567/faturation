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

// @Summary Créer une entreprise (inscription)
// @Description Permet de créer un compte entreprise en renseignant un nom, un email et un mot de passe
// @Tags Authentification
// @Accept  json
// @Produce  json
// @Param entreprise body models.RegisterEntrepriseRequest true "Détails de l'entreprise"
// @Success 201 {object} map[string]string "Compte créé avec succès"
// @Failure 400 {string} string "Requête invalide"
// @Failure 409 {string} string "Email déjà utilisé"
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/register [post]
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

	// Vérifier si les champs sont remplis
	if input.Email == "" || input.Password == "" || input.Nom == "" {
		http.Error(w, "Tous les champs sont obligatoires", http.StatusBadRequest)
		return
	}

	// Vérifier si l'email existe déjà
	var existingEntreprise models.Entreprise
	fmt.Printf("🔍 Vérification de l'existence de l'email : %s\n", input.Email)

	if err := config.DB.Where("email = ?", input.Email).First(&existingEntreprise).Error; err == nil {
		http.Error(w, "Cet email est déjà utilisé", http.StatusConflict)
		fmt.Printf("❌ Email déjà utilisé : %s\n", input.Email)
		return
	}

	// Hash du mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erreur lors du hachage du mot de passe", http.StatusInternalServerError)
		return
	}

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
	fmt.Printf("✅ Compte enregistré : %s (%s)\n", entreprise.Nom, entreprise.Email)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Compte entreprise créé avec succès"})
}

// @Summary Connexion d'une entreprise
// @Description Permet de se connecter avec un email et un mot de passe pour récupérer un token JWT
// @Tags Authentification
// @Accept  json
// @Produce  json
// @Param credentials body models.LoginRequest true "Identifiants de connexion"
// @Success 200 {object} map[string]string "Token JWT généré"
// @Failure 400 {string} string "Requête invalide"
// @Failure 401 {string} string "Email ou mot de passe incorrect"
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/login [post]
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
		fmt.Println("❌ Compte non trouvé :", result.Error)
		return
	}

	// Supprimer les espaces invisibles du mot de passe fourni
	input.Password = strings.TrimSpace(input.Password)

	// Vérifier le mot de passe
	err = bcrypt.CompareHashAndPassword([]byte(entreprise.Password), []byte(input.Password))
	if err != nil {
		fmt.Println("❌ Comparaison échouée :", err)
		http.Error(w, "Mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Générer un token JWT avec toutes les informations
	token, err := auth.GenerateJWT(entreprise.ID, entreprise.Nom, entreprise.Email)
	if err != nil {
		http.Error(w, "Erreur lors de la génération du token", http.StatusInternalServerError)
		fmt.Println("❌ Erreur de génération du token :", err)
		return
	}
	fmt.Printf("✅ Token généré pour l'entreprise : %s\n", entreprise.Email)

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// @Summary Récupérer le profil de l'entreprise connectée
// @Description Retourne les informations de l'entreprise actuellement connectée
// @Security BearerAuth
// @Produce  json
// @Success 200 {object} models.Entreprise
// @Failure 401 {string} string "Non autorisé"
// @Router /profile [get]
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
