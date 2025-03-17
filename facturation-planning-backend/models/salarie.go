package models

import "gorm.io/gorm"

type Salarie struct {
	gorm.Model
	Nom          string `json:"nom"`
	Email        string `json:"email"`
	Telephone    string `json:"telephone"`
	EntrepriseID uint   `json:"entreprise_id"`
}
