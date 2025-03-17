package models

// RegisterEntrepriseRequest représente la structure pour l'inscription d'une entreprise
type RegisterEntrepriseRequest struct {
	Nom      string `json:"nom" example:"MaBoite"`
	Email    string `json:"email" example:"contact@maboite.com"`
	Password string `json:"password" example:"securepass"`
}

// LoginRequest représente la structure pour la connexion d'une entreprise
type LoginRequest struct {
	Email    string `json:"email" example:"contact@maboite.com"`
	Password string `json:"password" example:"securepass"`
}
