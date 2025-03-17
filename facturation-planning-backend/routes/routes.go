package routes

import (
	//"net/http"

	"github.com/go-chi/chi/v5"
	"facturation-planning/controllers"
)

func SetupRoutes() *chi.Mux {
	r := chi.NewRouter()

	// Entreprises
	r.Get("/entreprises", controllers.GetEntreprises)
	r.Post("/entreprises", controllers.CreateEntreprise)

	// Salariés
	r.Get("/salaries", controllers.GetSalaries)
	r.Post("/salaries", controllers.CreateSalarie)

	// Factures
	r.Get("/factures", controllers.GetFactures)
	r.Post("/factures", controllers.CreateFacture)

	r.Get("/plannings", controllers.GetPlannings)
	r.Post("/plannings", controllers.CreatePlanning)
	r.Put("/plannings/{id}/convertir", controllers.ConvertPlanningToFacture)


	return r
}
