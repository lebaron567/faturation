package auth

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var JwtSecret = []byte(os.Getenv("JWT_SECRET"))

// Génération d'un token JWT avec informations complètes
func GenerateJWT(entrepriseID uint, nom, email string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"entreprise_id": entrepriseID,
		"id":            entrepriseID, // Alias pour compatibilité frontend
		"nom":           nom,
		"email":         email,
		"exp":           time.Now().Add(time.Hour * 24).Unix(), // Expire après 24h
	})

	return token.SignedString(JwtSecret)
}
