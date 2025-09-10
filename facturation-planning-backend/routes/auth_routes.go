package routes

import (
	"facturation-planning/controllers"

	"github.com/go-chi/chi/v5"
)

func AuthRoutes(r chi.Router) {
	r.Post("/auth/login", controllers.LoginEntreprise)
	r.Post("/auth/register", controllers.RegisterEntreprise)
}
