package models

import "gorm.io/gorm"

type Entreprise struct {
	gorm.Model
	Nom         string `json:"nom"`
	Adresse     string `json:"adresse"`
	Email       string `json:"email" gorm:"unique"`
	Telephone   string `json:"telephone"`
	SIRET       string `json:"siret"`
	TVA         string `json:"tva"`
	IBAN        string `json:"iban"`
	BIC         string `json:"bic"`
	Responsable string `json:"responsable"`

	// Champs pour l'authentification
	Password string `json:"-"` // Ne pas exposer le mot de passe
}
