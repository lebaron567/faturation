package models

import "gorm.io/gorm"

type Facture struct {
	gorm.Model
	Numero       string  `json:"numero"`
	Type         string  `json:"type"` // "standard", "etat_avancement", "auto_liquidation"
	MontantHT    float64 `json:"montant_ht"`
	MontantTTC   float64 `json:"montant_ttc"`
	TauxTVA      float64 `json:"taux_tva"`
	DateEmission string  `json:"date_emission"`
	DateEcheance string  `json:"date_echeance"`
	Statut       string  `json:"statut"` // "payée", "en attente", "rejetée"
	Description  string  `json:"description"`
	EntrepriseID uint    `json:"entreprise_id"`
	PlanningID   *uint   `json:"planning_id"` // Lien avec le planning si applicable
}
