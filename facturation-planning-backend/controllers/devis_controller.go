package controllers

import (
	"bytes"
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"html/template"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// CreateDevis godoc
// @Summary Créer un nouveau devis
// @Description Crée un nouveau devis avec validation des données d'entreprise et de client
// @Tags Devis
// @Accept json
// @Produce json
// @Param devis body models.Devis true "Données du devis à créer"
// @Success 201 {object} models.Devis "Devis créé avec succès"
// @Failure 400 {string} string "Erreur de validation des données"
// @Failure 500 {string} string "Erreur interne du serveur"
// @Router devis [post]
func CreateDevis(w http.ResponseWriter, r *http.Request) {
	var devis models.Devis

	if err := json.NewDecoder(r.Body).Decode(&devis); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validation des données du devis
	if err := validateDevisData(&devis); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Définir le statut par défaut si non spécifié
	if devis.Statut == "" {
		devis.Statut = "brouillon"
	}

	if err := config.DB.Create(&devis).Error; err != nil {
		http.Error(w, "Erreur lors de la création du devis", http.StatusInternalServerError)
		return
	}

	// Récupérer le devis créé avec les relations
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").First(&devis, devis.ID).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération du devis créé", http.StatusInternalServerError)
		return
	}

	// Calculer les totaux
	calculateTotals(&devis)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(devis)
}

// GetAllDevis godoc
// @Summary Récupérer tous les devis
// @Description Récupère la liste complète de tous les devis avec leurs lignes, entreprises et clients
// @Tags Devis
// @Produce json
// @Success 200 {array} models.Devis "Liste de tous les devis avec totaux calculés"
// @Failure 500 {string} string "Erreur lors de la récupération des devis"
// @Router devis [get]
// DevisResponse structure de réponse avec compatibilité ID
type DevisResponse struct {
	models.Devis
	ID_Compat uint `json:"ID"` // Compatibilité frontend (majuscule)
}

// convertToResponse convertit un devis en réponse compatible
func convertToResponse(devis models.Devis) DevisResponse {
	return DevisResponse{
		Devis:     devis,
		ID_Compat: devis.ID,
	}
}

// convertToResponseSlice convertit une liste de devis
func convertToResponseSlice(devis []models.Devis) []DevisResponse {
	responses := make([]DevisResponse, len(devis))
	for i, d := range devis {
		responses[i] = convertToResponse(d)
	}
	return responses
}

func GetAllDevis(w http.ResponseWriter, r *http.Request) {
	var devis []models.Devis

	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").Find(&devis).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération des devis", http.StatusInternalServerError)
		return
	}

	// Calculer les totaux pour chaque devis
	for i := range devis {
		calculateTotals(&devis[i])
	}

	// Convertir en réponse compatible
	responses := convertToResponseSlice(devis)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// TestDevisJSON - Endpoint de test pour débugger le JSON
func TestDevisJSON(w http.ResponseWriter, r *http.Request) {
	var devis []models.Devis
	config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").Find(&devis)

	// Créer un devis test simple avec ID explicite
	testDevis := models.Devis{
		ID:     999,
		Statut: "test",
		Objet:  "Test Devis",
	}

	response := map[string]interface{}{
		"devis_db":   devis,
		"test_devis": testDevis,
		"count":      len(devis),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type LigneDevis struct {
	Designation  string
	Unite        string
	Quantite     float64
	PrixUnitaire float64
	MontantHT    float64
	TVA          float64
	MontantTTC   float64
}

type DevisPDFData struct {
	Reference       string
	Ville           string
	DateEdition     string
	DateExpiration  string
	ClientNom       string
	ClientAdresse   string
	ClientEmail     string
	ClientTelephone string
	Conditions      string
	LieuSignature   string
	DateSignature   string
	Lignes          []LigneDevis
	SousTotalHT     float64
	TotalTVA        float64
	TotalTTC        float64
	Objet           string
	Company         config.CompanyInfo
}

// GenerateDevisPDF godoc
// @Summary Générer un PDF de devis pour affichage
// @Description Génère un devis au format PDF pour affichage dans le navigateur
// @Tags Devis
// @Produce application/pdf
// @Param id path string true "ID du devis à convertir en PDF"
// @Success 200 {file} file "Fichier PDF généré pour affichage"
// @Failure 404 {string} string "Devis introuvable"
// @Failure 500 {string} string "Erreur lors de la génération du PDF"
// @Router devis/{id}/pdf [get]
func GenerateDevisPDF(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Validation de l'ID
	if id == "" || id == "undefined" || id == "null" {
		http.Error(w, "ID de devis invalide", http.StatusBadRequest)
		return
	}

	var devis models.Devis
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").First(&devis, id).Error; err != nil {
		http.Error(w, "Devis introuvable", http.StatusNotFound)
		return
	}

	// Transformation pour le template avec calculs
	var lignes []LigneDevis
	var sousTotalHT, totalTVA, totalTTC float64

	for _, l := range devis.Lignes {
		montantHT := float64(l.Quantite) * l.PrixUnitaire
		montantTVA := montantHT * (l.TVA / 100)
		montantTTC := montantHT + montantTVA

		lignes = append(lignes, LigneDevis{
			Designation:  l.Description,
			Unite:        "U", // Unité par défaut, peut être modifiée
			Quantite:     float64(l.Quantite),
			PrixUnitaire: l.PrixUnitaire,
			MontantHT:    montantHT,
			TVA:          l.TVA,
			MontantTTC:   montantTTC,
		})

		sousTotalHT += montantHT
		totalTVA += montantTVA
		totalTTC += montantTTC
	}

	// Formatage des dates
	dateEdition := devis.DateDevis.Format("02 janvier 2006")
	dateExpiration := devis.DateExpiration.Format("02 janvier 2006")

	// Génération de l'objet du devis
	objet := devis.Objet
	if objet == "" {
		objet = fmt.Sprintf("Devis pour %s", devis.Client.GetDisplayName())
	}

	// Informations de l'entreprise
	company := config.GetCompanyInfo()
	devisConfig := config.GetDevisConfig()

	data := DevisPDFData{
		Reference:       fmt.Sprintf("%s%04d", devisConfig.NumberingPrefix, devis.ID),
		Ville:           devisConfig.DefaultCity,
		DateEdition:     dateEdition,
		DateExpiration:  dateExpiration,
		ClientNom:       devis.Client.GetDisplayName(),
		ClientAdresse:   devis.Client.Adresse,
		ClientEmail:     devis.Client.Email,
		ClientTelephone: devis.Client.Telephone,
		Conditions:      devis.Conditions,
		LieuSignature:   devis.LieuSignature,
		DateSignature:   devis.DateSignature,
		Lignes:          lignes,
		SousTotalHT:     sousTotalHT,
		TotalTVA:        totalTVA,
		TotalTTC:        totalTTC,
		Objet:           objet,
		Company:         company,
	}

	// Template FuncMap avec fonctions utiles
	funcMap := template.FuncMap{
		"add": func(a, b int) int { return a + b },
		"formatPrice": func(price float64) string {
			return fmt.Sprintf("%.2f €", price)
		},
		"formatPercent": func(percent float64) string {
			return fmt.Sprintf("%.1f%%", percent)
		},
	}

	tmpl, err := template.New("devis_improved.html").Funcs(funcMap).ParseFiles("templates/devis_improved.html")
	if err != nil {
		http.Error(w, "Erreur chargement template", http.StatusInternalServerError)
		return
	}

	var htmlBuffer bytes.Buffer
	if err := tmpl.Execute(&htmlBuffer, data); err != nil {
		http.Error(w, "Erreur exécution template", http.StatusInternalServerError)
		return
	}

	// TEMPORAIRE: Retourner du HTML au lieu du PDF car wkhtmltopdf n'est pas disponible
	filename := fmt.Sprintf("devis_%s.html", data.Reference)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", filename))
	w.Write(htmlBuffer.Bytes())
}

// DownloadDevisPDF godoc
// @Summary Télécharger un devis en PDF
// @Description Génère et force le téléchargement d'un devis au format PDF
// @Tags Devis
// @Produce application/pdf
// @Param id path string true "ID du devis à télécharger"
// @Success 200 {file} file "Fichier PDF à télécharger"
// @Failure 404 {string} string "Devis introuvable"
// @Failure 500 {string} string "Erreur lors de la génération du PDF"
// @Router devis/{id}/download [get]
func DownloadDevisPDF(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Validation de l'ID
	if id == "" || id == "undefined" || id == "null" {
		http.Error(w, "ID de devis invalide", http.StatusBadRequest)
		return
	}

	var devis models.Devis
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").First(&devis, id).Error; err != nil {
		http.Error(w, "Devis introuvable", http.StatusNotFound)
		return
	}

	// Réutiliser la même logique que GenerateDevisPDF
	var lignes []LigneDevis
	var sousTotalHT, totalTVA, totalTTC float64

	for _, l := range devis.Lignes {
		montantHT := float64(l.Quantite) * l.PrixUnitaire
		montantTVA := montantHT * (l.TVA / 100)
		montantTTC := montantHT + montantTVA

		lignes = append(lignes, LigneDevis{
			Designation:  l.Description,
			Unite:        "U",
			Quantite:     float64(l.Quantite),
			PrixUnitaire: l.PrixUnitaire,
			MontantHT:    montantHT,
			TVA:          l.TVA,
			MontantTTC:   montantTTC,
		})

		sousTotalHT += montantHT
		totalTVA += montantTVA
		totalTTC += montantTTC
	}

	dateEdition := devis.DateDevis.Format("02 janvier 2006")
	dateExpiration := devis.DateExpiration.Format("02 janvier 2006")

	objet := devis.Objet
	if objet == "" {
		objet = fmt.Sprintf("Devis pour %s", devis.Client.GetDisplayName())
	}

	// Informations de l'entreprise
	company := config.GetCompanyInfo()
	devisConfig := config.GetDevisConfig()

	data := DevisPDFData{
		Reference:       fmt.Sprintf("%s%04d", devisConfig.NumberingPrefix, devis.ID),
		Ville:           devisConfig.DefaultCity,
		DateEdition:     dateEdition,
		DateExpiration:  dateExpiration,
		ClientNom:       devis.Client.GetDisplayName(),
		ClientAdresse:   devis.Client.Adresse,
		ClientEmail:     devis.Client.Email,
		ClientTelephone: devis.Client.Telephone,
		Conditions:      devis.Conditions,
		LieuSignature:   devis.LieuSignature,
		DateSignature:   devis.DateSignature,
		Lignes:          lignes,
		SousTotalHT:     sousTotalHT,
		TotalTVA:        totalTVA,
		TotalTTC:        totalTTC,
		Objet:           objet,
		Company:         company,
	}

	funcMap := template.FuncMap{
		"add": func(a, b int) int { return a + b },
		"formatPrice": func(price float64) string {
			return fmt.Sprintf("%.2f €", price)
		},
		"formatPercent": func(percent float64) string {
			return fmt.Sprintf("%.1f%%", percent)
		},
	}

	tmpl, err := template.New("devis_improved.html").Funcs(funcMap).ParseFiles("templates/devis_improved.html")
	if err != nil {
		http.Error(w, "Erreur chargement template", http.StatusInternalServerError)
		return
	}

	var htmlBuffer bytes.Buffer
	if err := tmpl.Execute(&htmlBuffer, data); err != nil {
		http.Error(w, "Erreur exécution template", http.StatusInternalServerError)
		return
	}

	// TEMPORAIRE: Retourner du HTML au lieu du PDF car wkhtmltopdf n'est pas disponible
	filename := fmt.Sprintf("devis_%s.html", data.Reference)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	w.Write(htmlBuffer.Bytes())
}

// GetDevis godoc
// @Summary Récupérer un devis par son ID
// @Description Récupère un devis spécifique avec ses lignes, entreprise et client
// @Tags Devis
// @Produce json
// @Param id path string true "ID du devis à récupérer"
// @Success 200 {object} models.Devis "Devis trouvé avec totaux calculés"
// @Failure 404 {string} string "Devis introuvable"
// @Router devis/{id} [get]
func GetDevis(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Validation de l'ID
	if id == "" || id == "undefined" || id == "null" {
		http.Error(w, "ID de devis invalide", http.StatusBadRequest)
		return
	}

	var devis models.Devis
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").First(&devis, id).Error; err != nil {
		http.Error(w, "Devis introuvable", http.StatusNotFound)
		return
	}

	// Calculer les totaux
	calculateTotals(&devis)

	// Convertir en réponse compatible
	response := convertToResponse(devis)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// UpdateDevis godoc
// @Summary Mettre à jour un devis existant
// @Description Met à jour un devis existant avec validation des données
// @Tags Devis
// @Accept json
// @Produce json
// @Param id path string true "ID du devis à modifier"
// @Param devis body models.Devis true "Nouvelles données du devis"
// @Success 200 {object} models.Devis "Devis mis à jour avec succès"
// @Failure 400 {string} string "Erreur de validation des données"
// @Failure 500 {string} string "Erreur lors de la mise à jour"
// @Router devis/{id} [put]
func UpdateDevis(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Validation de l'ID
	if id == "" || id == "undefined" || id == "null" {
		http.Error(w, "ID de devis invalide", http.StatusBadRequest)
		return
	}

	var devis models.Devis

	if err := json.NewDecoder(r.Body).Decode(&devis); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validation des données du devis
	if err := validateDevisData(&devis); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := config.DB.Model(&devis).Where("id = ?", id).Updates(devis).Error; err != nil {
		http.Error(w, "Erreur lors de la mise à jour du devis", http.StatusInternalServerError)
		return
	}

	// Récupérer le devis mis à jour avec les relations
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").First(&devis, id).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération du devis", http.StatusInternalServerError)
		return
	}

	// Calculer les totaux
	calculateTotals(&devis)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(devis)
}

// DeleteDevis godoc
// @Summary Supprimer un devis
// @Description Supprime définitivement un devis du système
// @Tags Devis
// @Param id path string true "ID du devis à supprimer"
// @Success 204 "Devis supprimé avec succès"
// @Failure 500 {string} string "Erreur lors de la suppression"
// @Router devis/{id} [delete]
func DeleteDevis(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Validation de l'ID
	if id == "" || id == "undefined" || id == "null" {
		http.Error(w, "ID de devis invalide", http.StatusBadRequest)
		return
	}

	if err := config.DB.Delete(&models.Devis{}, id).Error; err != nil {
		http.Error(w, "Erreur lors de la suppression du devis", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetDevisByEntreprise godoc
// @Summary Récupérer tous les devis d'une entreprise
// @Description Récupère la liste de tous les devis appartenant à une entreprise spécifique
// @Tags Devis
// @Produce json
// @Param id path string true "ID de l'entreprise"
// @Success 200 {array} models.Devis "Liste des devis de l'entreprise"
// @Failure 400 {string} string "ID entreprise manquant"
// @Failure 500 {string} string "Erreur lors de la récupération"
// @Router entreprises/{id}/devis [get]
func GetDevisByEntreprise(w http.ResponseWriter, r *http.Request) {
	entrepriseID := chi.URLParam(r, "id")

	// Vérifier que l'ID n'est pas vide
	if entrepriseID == "" {
		http.Error(w, "ID entreprise manquant", http.StatusBadRequest)
		return
	}

	var devis []models.Devis
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").
		Where("entreprise_id = ?", entrepriseID).Find(&devis).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Calculer les totaux pour chaque devis
	for i := range devis {
		calculateTotals(&devis[i])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(devis)
}

// GetDevisByClient godoc
// @Summary Récupérer tous les devis d'un client
// @Description Récupère la liste de tous les devis appartenant à un client spécifique
// @Tags Devis
// @Produce json
// @Param id path string true "ID du client"
// @Success 200 {array} models.Devis "Liste des devis du client"
// @Failure 400 {string} string "ID client manquant"
// @Failure 500 {string} string "Erreur lors de la récupération"
// @Router clients/{id}/devis [get]
func GetDevisByClient(w http.ResponseWriter, r *http.Request) {
	clientID := chi.URLParam(r, "id")

	// Vérifier que l'ID n'est pas vide
	if clientID == "" {
		http.Error(w, "ID client manquant", http.StatusBadRequest)
		return
	}

	var devis []models.Devis
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").
		Where("client_id = ?", clientID).Find(&devis).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Calculer les totaux pour chaque devis
	for i := range devis {
		calculateTotals(&devis[i])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(devis)
}

// UpdateDevisStatut godoc
// @Summary Mettre à jour le statut d'un devis
// @Description Met à jour uniquement le statut d'un devis (brouillon, envoyé, accepté, refusé, expiré)
// @Tags Devis
// @Accept json
// @Produce json
// @Param id path string true "ID du devis"
// @Param statut body object{statut=string} true "Nouveau statut du devis"
// @Success 200 {object} models.Devis "Devis avec statut mis à jour"
// @Failure 400 {string} string "Statut invalide"
// @Failure 500 {string} string "Erreur lors de la mise à jour du statut"
// @Router devis/{id}/statut [patch]
func UpdateDevisStatut(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Validation de l'ID
	if id == "" || id == "undefined" || id == "null" {
		http.Error(w, "ID de devis invalide", http.StatusBadRequest)
		return
	}

	var requestData struct {
		Statut string `json:"statut"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Valider le statut
	validStatuts := []string{"brouillon", "envoyé", "accepté", "refusé", "expiré"}
	statutValide := false
	for _, s := range validStatuts {
		if s == requestData.Statut {
			statutValide = true
			break
		}
	}

	if !statutValide {
		http.Error(w, "Statut invalide", http.StatusBadRequest)
		return
	}

	// Mettre à jour le statut
	if err := config.DB.Model(&models.Devis{}).Where("id = ?", id).Update("statut", requestData.Statut).Error; err != nil {
		http.Error(w, "Erreur lors de la mise à jour du statut", http.StatusInternalServerError)
		return
	}

	// Récupérer le devis mis à jour
	var devis models.Devis
	if err := config.DB.Preload("Lignes").Preload("Entreprise").Preload("Client").First(&devis, id).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération du devis", http.StatusInternalServerError)
		return
	}

	// Calculer les totaux
	calculateTotals(&devis)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(devis)
}

// calculateTotals calcule les totaux pour un devis
// Fonction utilitaire interne pour calculer automatiquement les montants HT, TVA et TTC
func calculateTotals(devis *models.Devis) {
	var sousTotalHT, totalTVA, totalTTC float64

	for _, ligne := range devis.Lignes {
		montantHT := float64(ligne.Quantite) * ligne.PrixUnitaire
		montantTVA := montantHT * (ligne.TVA / 100)
		montantTTC := montantHT + montantTVA

		sousTotalHT += montantHT
		totalTVA += montantTVA
		totalTTC += montantTTC
	}

	devis.SousTotalHT = sousTotalHT
	devis.TotalTVA = totalTVA
	devis.TotalTTC = totalTTC
}

// validateDevisData valide les données d'un devis
// Fonction utilitaire interne pour valider l'existence de l'entreprise et du client
func validateDevisData(devis *models.Devis) error {
	// Vérifier que l'entreprise existe
	var entreprise models.Entreprise
	if err := config.DB.First(&entreprise, devis.EntrepriseID).Error; err != nil {
		return fmt.Errorf("entreprise introuvable")
	}

	// Vérifier que le client existe et appartient à l'entreprise
	var client models.Client
	if err := config.DB.First(&client, devis.ClientID).Error; err != nil {
		return fmt.Errorf("client introuvable")
	}

	if client.EntrepriseID != devis.EntrepriseID {
		return fmt.Errorf("le client n'appartient pas à cette entreprise")
	}

	return nil
}
