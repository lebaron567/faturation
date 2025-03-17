package models

import (
	"time"
)

// Planning représente un planning lié à une entreprise
type Planning struct {
	ID           uint       `json:"id" example:"1"`
	CreatedAt    time.Time  `json:"created_at" example:"2025-03-17T14:09:30.706109+01:00"`
	UpdatedAt    time.Time  `json:"updated_at" example:"2025-03-17T14:09:30.706109+01:00"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
	Nom          string     `json:"nom" example:"Projet X"`
	DateDebut    string     `json:"date_debut" example:"2025-04-01"`
	DateFin      string     `json:"date_fin" example:"2025-04-30"`
	Description  string     `json:"description" example:"Planification des tâches pour le projet X"`
	Statut       string     `json:"statut" example:"en cours"` // "prévu", "en cours", "terminé"
	EntrepriseID uint       `json:"entreprise_id" example:"5"`

	// Relation avec Facture (optionnel)
	Facture *Facture `json:"facture,omitempty" gorm:"foreignKey:PlanningID"`
}
