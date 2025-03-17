package models

import (
	"time"
)

// Entreprise représente une entreprise avec un compte
type Entreprise struct {
	ID           uint       `json:"id" example:"1"`
	CreatedAt    time.Time  `json:"created_at" example:"2025-03-17T14:09:30.706109+01:00"`
	UpdatedAt    time.Time  `json:"updated_at" example:"2025-03-17T14:09:30.706109+01:00"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
	Nom          string     `json:"nom" example:"MaBoite"`
	Adresse      string     `json:"adresse" example:"123 rue du Code"`
	Email        string     `json:"email" gorm:"unique" example:"contact@maboite.com"`
	Telephone    string     `json:"telephone" example:"+33123456789"`
	SIRET        string     `json:"siret" example:"12345678901234"`
	TVA          string     `json:"tva" example:"FR12345678901"`
	IBAN         string     `json:"iban" example:"FR7612345987650123456789014"`
	BIC          string     `json:"bic" example:"BIC12345"`
	Responsable  string     `json:"responsable" example:"Jean Dupont"`

	// Champs pour l'authentification
	Password string `json:"-"` // Ne pas exposer le mot de passe
}
