package models

import (
	"time"

	"gorm.io/gorm"
)

// Devis représente un devis complet
type Devis struct {
	// Champs GORM
	ID        uint            `json:"id" example:"1"`
	CreatedAt time.Time       `json:"created_at" example:"2025-06-10T10:00:00Z"`
	UpdatedAt time.Time       `json:"updated_at" example:"2025-06-10T10:00:00Z"`
	DeletedAt *gorm.DeletedAt `json:"deleted_at,omitempty" swaggerignore:"true" gorm:"index"`

	EntrepriseID   uint         `json:"entreprise_id"`
	ClientID       uint         `json:"client_id"`
	DateDevis      time.Time    `json:"date_devis" example:"2025-06-10T00:00:00Z"`
	DateExpiration time.Time    `json:"date_expiration" example:"2025-07-10T00:00:00Z"`
	Conditions     string       `json:"conditions" example:"Paiement sous 30 jours"`
	Objet          string       `json:"objet" example:"Développement application web"`
	Statut         string       `json:"statut" example:"brouillon" gorm:"default:brouillon"` // brouillon, envoyé, accepté, refusé
	LieuSignature  string       `json:"lieu_signature" example:"Paris"`
	DateSignature  string       `json:"date_signature" example:"10/06/2025"`
	Lignes         []LigneDevis `json:"lignes"`

	// Relations
	Entreprise Entreprise `json:"entreprise" gorm:"foreignKey:EntrepriseID"`
	Client     Client     `json:"client" gorm:"foreignKey:ClientID"`

	// Champs calculés (ne pas stocker en base)
	SousTotalHT float64 `json:"sous_total_ht" gorm:"-"`
	TotalTVA    float64 `json:"total_tva" gorm:"-"`
	TotalTTC    float64 `json:"total_ttc" gorm:"-"`
}

// LigneDevis représente une ligne de produit ou service dans un devis
type LigneDevis struct {
	// Champs GORM
	ID        uint            `json:"id" example:"1"`
	CreatedAt time.Time       `json:"created_at" example:"2025-06-10T10:00:00Z"`
	UpdatedAt time.Time       `json:"updated_at" example:"2025-06-10T10:00:00Z"`
	DeletedAt *gorm.DeletedAt `json:"deleted_at,omitempty" swaggerignore:"true" gorm:"index"`

	DevisID      uint    `json:"-"`
	Description  string  `json:"description" example:"Développement site web"`
	Quantite     int     `json:"quantite" example:"1"`
	PrixUnitaire float64 `json:"prix_unitaire" example:"1500"`
	TVA          float64 `json:"tva" example:"20"`
}
