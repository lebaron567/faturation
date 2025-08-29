package models

import (
	"time"
)

// LigneFacture représente une ligne dans une facture
type LigneFacture struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty" gorm:"index"`
	FactureID    uint       `json:"facture_id"`
	Designation  string     `json:"designation" example:"Développement site web"`
	Unite        string     `json:"unite" example:"jour"`
	Quantite     float64    `json:"quantite" example:"10"`
	PrixUnitaire float64    `json:"prix_unitaire" example:"500.00"`
	MontantHT    float64    `json:"montant_ht" example:"5000.00"`
	TVA          float64    `json:"tva" example:"20"`
	MontantTTC   float64    `json:"montant_ttc" example:"6000.00"`
}

// Facture représente une facture générée
// @Description Structure d'une facture
type Facture struct {
	ID        uint       `json:"id" gorm:"primaryKey" example:"1"`
	CreatedAt time.Time  `json:"created_at" example:"2025-03-17T14:09:30.706109+01:00"`
	UpdatedAt time.Time  `json:"updated_at" example:"2025-03-17T14:09:30.706109+01:00"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`

	// Référence unique de la facture
	Reference string `json:"reference" gorm:"unique;not null" example:"FAC-2025-001"`

	// Informations client
	ClientID        uint   `json:"client_id" gorm:"not null" example:"1"`
	Client          Client `json:"client" gorm:"foreignKey:ClientID"`
	ClientNom       string `json:"client_nom" example:"Entreprise ABC"`
	ClientAdresse   string `json:"client_adresse" example:"123 Rue de la Paix, 75001 Paris"`
	ClientEmail     string `json:"client_email" example:"contact@abc.com"`
	ClientTelephone string `json:"client_telephone" example:"01 23 45 67 89"`

	// Dates
	DateEmission time.Time `json:"date_emission" example:"2025-03-17T00:00:00Z"`
	DateEcheance time.Time `json:"date_echeance" example:"2025-04-17T00:00:00Z"`

	// Contenu
	Description string `json:"description" example:"Développement site web"`
	TypeFacture string `json:"type_facture" example:"classique"` // "classique" ou "acompte"

	// Montants
	SousTotalHT float64 `json:"sous_total_ht" example:"1000.00"`
	TotalTVA    float64 `json:"total_tva" example:"200.00"`
	TotalTTC    float64 `json:"total_ttc" example:"1200.00"`

	// Statut et workflow
	Statut string `json:"statut" example:"en_attente"` // "en_attente", "payee", "rejetee"

	// Informations de signature
	LieuSignature string `json:"lieu_signature" example:"Paris"`
	DateSignature string `json:"date_signature" example:"17/03/2025"`

	// Champs optionnels pour les acomptes
	DevisReference     string `json:"devis_reference,omitempty" example:"DEV-2025-001"`
	PourcentageAcompte int    `json:"pourcentage_acompte,omitempty" example:"50"`

	// Legacy fields (pour compatibilité)
	EntrepriseID uint  `json:"entreprise_id,omitempty" example:"5"`
	PlanningID   *uint `json:"planning_id,omitempty" example:"3"`

	// Relations
	Lignes []LigneFacture `json:"lignes" gorm:"foreignKey:FactureID"`
}