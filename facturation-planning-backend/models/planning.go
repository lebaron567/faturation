package models

import (
	"time"
)

// Planning représente un planning lié à une entreprise
type Planning struct {
	ID        uint       `json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`

	Date          string  `json:"date"`
	HeureDebut    string  `json:"heure_debut"`
	HeureFin      string  `json:"heure_fin"`
	TypeEvenement string  `json:"type_evenement"`
	SalarieID     uint    `json:"salarie_id"`
	Salarie       Salarie `json:"salarie" gorm:"foreignKey:SalarieID"` // ✅ Corrigé

	ClientID uint   `json:"client_id"`
	Client   Client `json:"client" gorm:"foreignKey:ClientID"` // <-- ajoute cette ligne

	Objet        string  `json:"objet"`
	Prestation   string  `json:"prestation"`
	Facturation  string  `json:"facturation"`
	TauxHoraire  float64 `json:"taux_horaire"`
	ForfaitHT    float64 `json:"forfait_ht"`
	EntrepriseID uint    `json:"entreprise_id"`
	Periodicite int `json:"periodicite"`
	NbRepetitions  int `json:"nb_repetitions"`  // combien de fois on le répète

	Facture *Facture `json:"facture,omitempty" gorm:"foreignKey:PlanningID"`
}
