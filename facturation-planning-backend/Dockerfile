# Étape 1: Build de l'application Go
FROM golang:1.21-alpine AS builder

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

# Installer wkhtmltopdf pour la génération PDF
RUN apk --no-cache add ca-certificates wkhtmltopdf xvfb ttf-dejavu

# Définir le répertoire de travail
WORKDIR /app

# Copier l'exécutable
COPY --from=builder /app/main .

# Copier les templates et assets
COPY --from=builder /app/templates ./templates/
COPY --from=builder /app/assets ./assets/

# Exposer le port
EXPOSE 8080

# Commande de démarrage
CMD ["./main"]
