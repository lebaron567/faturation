package models

import "time"

// Client représente un client lié à une entreprise
type Client struct {
	ID        uint       `json:"id" example:"1"`
	CreatedAt time.Time  `json:"created_at" example:"2025-06-10T10:00:00Z"`
	UpdatedAt time.Time  `json:"updated_at" example:"2025-06-10T10:00:00Z"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" swaggerignore:"true"`

	// Type de client: "particulier" ou "professionnel"
	TypeClient string `json:"type_client" example:"particulier" validate:"required,oneof=particulier professionnel"`

	// Champs pour clients particuliers
	Civilite *string `json:"civilite,omitempty" example:"M."`
	Nom      *string `json:"nom,omitempty" example:"Dupont"`
	Prenom   *string `json:"prenom,omitempty" example:"Jean"`

	// Champs pour clients professionnels
	NomOrganisme *string `json:"nom_organisme,omitempty" example:"ACME Corporation"`

	// Champs communs
	Adresse           string `json:"adresse" example:"123 rue de la Paix"`
	ComplementAdresse string `json:"complement_adresse" example:"Bâtiment A, 2ème étage"`
	CodePostal        string `json:"code_postal" example:"75001"`
	Ville             string `json:"ville" example:"Paris"`
	Telephone         string `json:"telephone" example:"+33123456789"`
	Email             string `json:"email" example:"contact@acme.com"`
	EntrepriseID      uint   `json:"entreprise_id" example:"1"`
}

// GetDisplayName retourne le nom d'affichage du client selon son type
func (c *Client) GetDisplayName() string {
	if c.TypeClient == "particulier" {
		if c.Civilite != nil && c.Nom != nil && c.Prenom != nil {
			return *c.Civilite + " " + *c.Prenom + " " + *c.Nom
		}
		if c.Nom != nil && c.Prenom != nil {
			return *c.Prenom + " " + *c.Nom
		}
		if c.Nom != nil {
			return *c.Nom
		}
		return "Client particulier"
	} else if c.TypeClient == "professionnel" {
		if c.NomOrganisme != nil {
			return *c.NomOrganisme
		}
		return "Organisme professionnel"
	}

	// Fallback pour les anciens clients ou données invalides
	if c.NomOrganisme != nil {
		return *c.NomOrganisme
	}
	if c.Nom != nil {
		return *c.Nom
	}
	return "Client sans nom"
}
