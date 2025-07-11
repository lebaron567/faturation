package models

import "time"

// Client représente un client lié à une entreprise
type Client struct {
	ID        uint       `json:"id" example:"1"`
	CreatedAt time.Time  `json:"created_at" example:"2025-06-10T10:00:00Z"`
	UpdatedAt time.Time  `json:"updated_at" example:"2025-06-10T10:00:00Z"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" swaggerignore:"true"`

	Nom          string `json:"nom" example:"ACME Corporation"`
	Email        string `json:"email" example:"contact@acme.com"`
	Telephone    string `json:"telephone" example:"+33123456789"`
	Adresse      string `json:"adresse" example:"123 rue de la Paix, 75001 Paris"`
	EntrepriseID uint   `json:"entreprise_id" example:"1"`
}
