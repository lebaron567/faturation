package models

import "gorm.io/gorm"

type Entreprise struct {
	gorm.Model
	Nom            string `json:"nom"`
	Adresse        string `json:"adresse"`
	Email          string `json:"email"`
	Telephone      string `json:"telephone"`
	SIRET          string `json:"siret"`
	TVA            string `json:"tva"`
	Responsable    string `json:"responsable"`
	Salariés       []Salarie `gorm:"foreignKey:EntrepriseID"`
	Factures       []Facture `gorm:"foreignKey:EntrepriseID"`
	Plannings      []Planning `gorm:"foreignKey:EntrepriseID"`
}
