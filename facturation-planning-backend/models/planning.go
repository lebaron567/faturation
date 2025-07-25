package models

import (
	"time"
)

// Planning représente un planning lié à une entreprise
type Planning struct {
	ID        uint       `json:"id" example:"1"`
	CreatedAt time.Time  `json:"created_at" example:"2025-06-10T10:00:00Z"`
	UpdatedAt time.Time  `json:"updated_at" example:"2025-06-10T10:00:00Z"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" swaggerignore:"true"`

	Date          string  `json:"date" example:"2025-06-15"`
	HeureDebut    string  `json:"heure_debut" example:"09:00"`
	HeureFin      string  `json:"heure_fin" example:"17:00"`
	TypeEvenement string  `json:"type_evenement" example:"Intervention"`
	SalarieID     uint    `json:"salarie_id" example:"1"`
	Salarie       Salarie `json:"salarie" gorm:"foreignKey:SalarieID"` // ✅ Corrigé

	ClientID uint   `json:"client_id" example:"1"`
	Client   Client `json:"client" gorm:"foreignKey:ClientID"` // <-- ajoute cette ligne

	Objet         string  `json:"objet" example:"Maintenance système"`
	Prestation    string  `json:"prestation" example:"Support technique"`
	Facturation   string  `json:"facturation" example:"À facturer"`
	TauxHoraire   float64 `json:"taux_horaire" example:"45.50"`
	ForfaitHT     float64 `json:"forfait_ht" example:"0"`
	EntrepriseID  uint    `json:"entreprise_id" example:"1"`
	Periodicite   int     `json:"periodicite" example:"0"`
	NbRepetitions int     `json:"nb_repetitions"` // combien de fois on le répète

	Facture *Facture `json:"facture,omitempty" gorm:"foreignKey:PlanningID"`
}
