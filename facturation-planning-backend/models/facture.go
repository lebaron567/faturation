package models

import (
	"time"
)

// Facture représente une facture générée
type Facture struct {
	ID           uint       `json:"id" example:"1"`
	CreatedAt    time.Time  `json:"created_at" example:"2025-03-17T14:09:30.706109+01:00"`
	UpdatedAt    time.Time  `json:"updated_at" example:"2025-03-17T14:09:30.706109+01:00"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
	Numero       string     `json:"numero" example:"FAC-2025-001"`
	Type         string     `json:"type" example:"standard"` // "standard", "etat_avancement", "auto_liquidation"
	MontantHT    float64    `json:"montant_ht" example:"1000.50"`
	MontantTTC   float64    `json:"montant_ttc" example:"1200.60"`
	TauxTVA      float64    `json:"taux_tva" example:"20"`
	DateEmission string     `json:"date_emission" example:"2025-03-17"`
	DateEcheance string     `json:"date_echeance" example:"2025-04-17"`
	Statut       string     `json:"statut" example:"en attente"` // "payée", "en attente", "rejetée"
	Description  string     `json:"description" example:"Facture pour prestation de services"`
	EntrepriseID uint       `json:"entreprise_id" example:"5"`
	PlanningID   *uint      `json:"planning_id,omitempty" example:"3"` // Lien avec le planning si applicable
}
