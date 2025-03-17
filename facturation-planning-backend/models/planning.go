package models

import "gorm.io/gorm"

type Planning struct {
	gorm.Model
	Nom          string  `json:"nom"`
	DateDebut    string  `json:"date_debut"`
	DateFin      string  `json:"date_fin"`
	Description  string  `json:"description"`
	Statut       string  `json:"statut"` // "prévu", "en cours", "terminé"
	EntrepriseID uint    `json:"entreprise_id"`
	Facture      Facture `gorm:"foreignKey:PlanningID"`
}
