package routes

import (
	"facturation-planning/controllers"

	"github.com/go-chi/chi/v5"
)

func FactureRoutes(r *chi.Mux) {
	r.Get("/factures/{id}/pdf", controllers.GenerateFacturePDF)
}
