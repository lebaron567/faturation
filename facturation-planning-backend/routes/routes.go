package routes

import (
	//"net/http"

	"facturation-planning/controllers"
	"facturation-planning/middlewares"

	"github.com/go-chi/chi/v5"
)

func SetupRoutes() *chi.Mux {
	r := chi.NewRouter()

	// Auth
	AuthRoutes(r)
	FactureRoutes(r)

	// Autres routes (protégées après connexion)
	r.With(middlewares.JWTMiddleware).Get("/profile", controllers.GetProfile)

	// Entreprises
	r.Get("/entreprises", controllers.GetEntreprises)
	r.Post("/entreprises", controllers.CreateEntreprise)

	// Salariés
	r.Get("/salaries", controllers.GetSalaries)
	r.Post("/salaries", controllers.CreateSalarie)

	// Factures
	r.Get("/factures", controllers.GetAllFactures)
	r.Post("/factures", controllers.CreateFacture)

	r.Route("/clients", func(r chi.Router) {
		r.Get("/", controllers.GetClients)
		r.Post("/", controllers.CreateClient)
	})

	r.Get("/devis", controllers.GetAllDevis)
	r.Post("/devis", controllers.CreateDevis)
	r.Get("/devis/{id}", controllers.GetDevis)
	r.Put("/devis/{id}", controllers.UpdateDevis)
	r.Delete("/devis/{id}", controllers.DeleteDevis)
	r.Get("/devis/{id}/pdf", controllers.GenerateDevisPDF)
	r.Get("/devis/{id}/download", controllers.DownloadDevisPDF)
	r.Patch("/devis/{id}/statut", controllers.UpdateDevisStatut)

	// Devis par entreprise et client
	r.Get("/entreprises/{id}/devis", controllers.GetDevisByEntreprise)
	r.Get("/clients/{id}/devis", controllers.GetDevisByClient)

	// Plannings
	r.Route("/plannings", func(r chi.Router) {
		r.Use(middlewares.JWTMiddleware)
		r.Get("/", controllers.GetPlannings)
		r.Post("/", controllers.CreatePlanning)
		r.Put("/{id}", controllers.UpdatePlanning)
		r.Delete("/{id}", controllers.DeletePlanning)
	})

	return r
}
