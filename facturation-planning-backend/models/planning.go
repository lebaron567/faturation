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
	Date         string  `json:"date"`
	HeureDebut   string  `json:"heure_debut"`
	HeureFin     string  `json:"heure_fin"`
	TypeEvenement string  `json:"type_evenement"` // "Intervention", "Réunion", etc.
	SalarieID    uint    `json:"salarie_id"`
	ClientID     uint    `json:"client_id"`
	Objet        string  `json:"objet"`
	Prestation   string  `json:"prestation"`
	Facturation  string  `json:"facturation"` // "Comptabilisé" / "Non Comptabilisé"
	TauxHoraire  float64 `json:"taux_horaire"`
	ForfaitHT    float64 `json:"forfait_ht"`
	EntrepriseID uint       `json:"entreprise_id" example:"5"`

	// Relation avec Facture (optionnel)
	Facture *Facture `json:"facture,omitempty" gorm:"foreignKey:PlanningID"`
}
