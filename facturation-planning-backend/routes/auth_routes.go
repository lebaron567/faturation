package routes

import (
	"facturation-planning/controllers"

	"github.com/go-chi/chi/v5"
)

func AuthRoutes(r *chi.Mux) {
	r.Post("/register", controllers.RegisterEntreprise)
	r.Post("/login", controllers.LoginEntreprise)
}
