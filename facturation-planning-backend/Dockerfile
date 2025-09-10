# Étape 1: Build de l'application Go
FROM golang:1.23-alpine AS builder

# Installer git pour télécharger les dépendances
RUN apk add --no-cache git

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY go.mod go.sum ./

# Télécharger les dépendances
RUN go mod download

# Copier le code source
COPY . .

# Build de l'application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Étape 2: Image finale
FROM alpine:latest

# Installer les outils nécessaires (sans wkhtmltopdf pour l'instant)
RUN apk --no-cache add ca-certificates wget fontconfig ttf-dejavu \
    && fc-cache -fv

# Définir le répertoire de travail
WORKDIR /app

# Copier l'exécutable
COPY --from=builder /app/main .

# Copier les templates et assets (avec vérification)
COPY --from=builder /app/templates ./templates/
COPY --from=builder /app/assets ./assets/

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S golang && \
    adduser -S golang -u 1001

# Changer les permissions
RUN chown -R golang:golang /app
USER golang

# Exposer le port
EXPOSE 8080

# Variables d'environnement par défaut
ENV PORT=8080
ENV ENV=production

# Commande de démarrage
CMD ["./main"]
