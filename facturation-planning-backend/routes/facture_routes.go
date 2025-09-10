package routes

import (
	"facturation-planning/controllers"

	"github.com/go-chi/chi/v5"
)

func FactureRoutes(r chi.Router) {
	// CRUD operations
	r.Post("/factures", controllers.CreateFacture)
	r.Post("/factures/from-devis/{devisId}", controllers.CreateFactureFromDevis)
	r.Get("/factures", controllers.GetAllFactures)
	r.Get("/factures/{id}", controllers.GetFactureByID)
	r.Put("/factures/{id}", controllers.UpdateFacture)
	r.Delete("/factures/{id}", controllers.DeleteFacture)

	// PDF generation
	r.Get("/factures/{id}/pdf", controllers.GenerateFacturePDF)
	r.Get("/factures/{id}/download", controllers.DownloadFacturePDF)

	// Status management
	r.Put("/factures/{id}/statut", controllers.UpdateFactureStatut)

	// Search and filters
	r.Get("/factures/search", controllers.SearchFactures)
	r.Get("/factures/client/{clientId}", controllers.GetFacturesByClient)
	r.Get("/factures/statut/{statut}", controllers.GetFacturesByStatut)
}
