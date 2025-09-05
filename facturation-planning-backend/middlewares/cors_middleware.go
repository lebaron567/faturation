package middlewares

import (
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/cors"
)

// GetCORSOptions retourne la configuration CORS adaptée à l'environnement
func GetCORSOptions() cors.Options {
	// Origines autorisées par défaut (développement)
	allowedOrigins := []string{
		"http://localhost:3000", // React dev server
		"http://localhost:3001", // Alternative React port
		"http://127.0.0.1:3000", // Alternative localhost
		"http://0.0.0.0:3000",   // Docker frontend
	}

	// Ajouter les origines personnalisées depuis les variables d'environnement
	if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
		customOrigins := strings.Split(envOrigins, ",")
		for _, origin := range customOrigins {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				allowedOrigins = append(allowedOrigins, origin)
			}
		}
	}

	// Configuration plus stricte pour la production
	if os.Getenv("GO_ENV") == "production" {
		return cors.Options{
			AllowedOrigins: allowedOrigins,
			AllowedMethods: []string{
				"GET", "POST", "PUT", "DELETE", "OPTIONS",
			},
			AllowedHeaders: []string{
				"Accept",
				"Authorization",
				"Content-Type",
				"X-CSRF-Token",
			},
			ExposedHeaders: []string{
				"Content-Length",
				"Content-Type",
			},
			AllowCredentials: true,
			MaxAge:           86400, // 24 heures
		}
	}

	// Configuration plus permissive pour le développement
	return cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD",
		},
		AllowedHeaders: []string{
			"*", // Plus permissif en développement
		},
		ExposedHeaders: []string{
			"Link",
			"Content-Length",
			"Content-Type",
			"X-Total-Count",
		},
		AllowCredentials: true,
		MaxAge:           300,  // 5 minutes en développement pour faciliter les tests
		Debug:            true, // Logs CORS en développement
	}
}

// CORSMiddleware retourne le middleware CORS configuré
func CORSMiddleware() func(http.Handler) http.Handler {
	return cors.Handler(GetCORSOptions())
}
