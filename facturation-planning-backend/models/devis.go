package models

import (
	"time"

	"gorm.io/gorm"
)

// Devis représente un devis complet
type Devis struct {
	gorm.Model
	ClientNom       string       `json:"client_nom" example:"Entreprise Dupont"`
	ClientAdresse   string       `json:"client_adresse" example:"123 rue du Général"`
	ClientEmail     string       `json:"client_email" example:"contact@dupont.fr"`
	ClientTelephone string       `json:"client_telephone" example:"0601020304"`
	DateDevis       time.Time    `json:"date_devis" example:"2025-06-10T00:00:00Z"`
	DateExpiration  time.Time    `json:"date_expiration" example:"2025-07-10T00:00:00Z"`
	Conditions      string       `json:"conditions" example:"Paiement sous 30 jours"`
	Lignes          []LigneDevis `json:"lignes"`
}


// LigneDevis représente une ligne de produit ou service dans un devis
type LigneDevis struct {
	gorm.Model
	DevisID      uint    `json:"-"`
	Description  string  `json:"description" example:"Développement site web"`
	Quantite     int     `json:"quantite" example:"1"`
	PrixUnitaire float64 `json:"prix_unitaire" example:"1500"`
	TVA          float64 `json:"tva" example:"20"`
}
