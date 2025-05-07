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
	r.Get("/factures", controllers.GetFactures)
	r.Post("/factures", controllers.CreateFacture)

	r.Route("/clients", func(r chi.Router) {
		r.Get("/", controllers.GetClients)
		r.Post("/", controllers.CreateClient)
	})

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
