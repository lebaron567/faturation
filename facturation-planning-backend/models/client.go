package models

import "time"

// Client représente un client lié à une entreprise
type Client struct {
	ID         uint       `json:"id"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	DeletedAt  *time.Time `json:"deleted_at,omitempty"`

	Nom        string `json:"nom"`
	Email      string `json:"email"`
	Telephone  string `json:"telephone"`
	Adresse    string `json:"adresse"`
	EntrepriseID uint `json:"entreprise_id"`
}
