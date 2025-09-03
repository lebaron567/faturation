package models

import (
	"time"
)

// LigneFacture représente une ligne dans une facture
type LigneFacture struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	DeletedAt    *time.Time `json:"deletedAt,omitempty" gorm:"index"`
	FactureID    uint       `json:"factureID"`
	Description  string     `json:"description" example:"Développement site web"`
	Unite        string     `json:"unite" example:"jour"`
	Quantite     float64    `json:"quantite" example:"10"`
	PrixUnitaire float64    `json:"prixUnitaire" example:"500.00"`
	TotalLigne   float64    `json:"totalLigne" example:"5000.00"`
	TauxTVA      float64    `json:"tauxTVA" example:"20"`
	MontantHT    float64    `json:"montantHT" example:"5000.00"`
	MontantTTC   float64    `json:"montantTTC" example:"6000.00"`
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
	ClientID        uint   `json:"clientID" gorm:"not null" example:"1"`
	Client          Client `json:"client" gorm:"foreignKey:ClientID"`
	ClientNom       string `json:"clientNom" example:"Entreprise ABC"`
	ClientAdresse   string `json:"clientAdresse" example:"123 Rue de la Paix, 75001 Paris"`
	ClientEmail     string `json:"clientEmail" example:"contact@abc.com"`
	ClientTelephone string `json:"clientTelephone" example:"01 23 45 67 89"`

	// Dates
	DateCreation time.Time `json:"dateCreation" example:"2025-03-17T00:00:00Z"`
	DateEmission time.Time `json:"dateEmission" example:"2025-03-17T00:00:00Z"`
	DateEcheance time.Time `json:"dateEcheance" example:"2025-04-17T00:00:00Z"`

	// Contenu
	Description string `json:"description" example:"Développement site web"`
	TypeFacture string `json:"typeFacture" example:"classique"` // "classique" ou "acompte"

	// Montants
	SousTotalHT float64 `json:"sousTotalHT" example:"1000.00"`
	TotalTVA    float64 `json:"totalTVA" example:"200.00"`
	TotalTTC    float64 `json:"totalTTC" example:"1200.00"`
	TauxTVA     float64 `json:"tauxTVA" example:"20.0"`
	MontantTVA  float64 `json:"montantTVA" example:"200.00"`

	// Statut et workflow
	Statut string `json:"statut" example:"en_attente"` // "en_attente", "payee", "rejetee"

	// Informations de signature
	LieuSignature string `json:"lieuSignature" example:"Paris"`
	DateSignature string `json:"dateSignature" example:"17/03/2025"`

	// Champs optionnels pour les acomptes
	DevisReference     string `json:"devisReference,omitempty" example:"DEV-2025-001"`
	PourcentageAcompte int    `json:"pourcentageAcompte,omitempty" example:"50"`

	// Legacy fields (pour compatibilité)
	EntrepriseID uint  `json:"entrepriseID,omitempty" example:"5"`
	PlanningID   *uint `json:"planningID,omitempty" example:"3"`

	// Relations
	Lignes []LigneFacture `json:"lignes" gorm:"foreignKey:FactureID"`
}
