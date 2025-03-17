package models

import (
	"time"
)

// Salarie représente un salarié appartenant à une entreprise
type Salarie struct {
	ID           uint       `json:"id" example:"1"`
	CreatedAt    time.Time  `json:"created_at" example:"2025-03-17T14:09:30.706109+01:00"`
	UpdatedAt    time.Time  `json:"updated_at" example:"2025-03-17T14:09:30.706109+01:00"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
	Nom          string     `json:"nom" example:"Jean Dupont"`
	Email        string     `json:"email" example:"jean.dupont@example.com"`
	Telephone    string     `json:"telephone" example:"+33123456789"`
	EntrepriseID uint       `json:"entreprise_id" example:"5"`
}
