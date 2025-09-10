package controllers

import (
	"bytes"
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"time"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// LigneFacture représente une ligne de facturation
type LigneFacture struct {
	Designation  string
	Unite        string
	Quantite     float64
	PrixUnitaire float64
	MontantHT    float64
	TVA          float64
	MontantTTC   float64
}

// FacturePDFData structure pour les données du template PDF
type FacturePDFData struct {
	Reference       string
	Numero          string // Alias pour Reference pour compatibilité template devis
	Ville           string
	DateEmission    string
	DateEcheance    string
	ClientNom       string
	ClientAdresse   string
	ClientEmail     string
	ClientTelephone string
	Description     string
	Lignes          []LigneFacture
	SousTotalHT     float64
	TotalTVA        float64
	TotalTTC        float64
	TypeFacture     string
	Statut          string
	Company         config.CompanyInfo
	LieuSignature   string
	DateSignature   string
}

// CreateFacture godoc
// @Summary Créer une nouvelle facture
// @Description Crée une nouvelle facture (standard ou d'avancement) avec validation
// @Tags Factures
// @Accept json
// @Produce json
// @Param facture body models.Facture true "Données de la facture à créer"
// @Success 201 {object} models.Facture "Facture créée avec succès"
// @Failure 400 {string} string "Erreur de validation des données"
// @Failure 500 {string} string "Erreur interne du serveur"
// @Router /api/factures [post]
func CreateFacture(w http.ResponseWriter, r *http.Request) {
	var facture models.Facture

	if err := json.NewDecoder(r.Body).Decode(&facture); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validation des données de la facture
	if err := validateFactureData(&facture); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Définir le statut par défaut si non spécifié
	if facture.Statut == "" {
		facture.Statut = "en attente"
	}

	// Générer un numéro de facture si non fourni
	if facture.Reference == "" {
		facture.Reference = generateFactureNumber()
	}

	if err := config.DB.Create(&facture).Error; err != nil {
		// log supprimé
		http.Error(w, "Erreur lors de la création de la facture", http.StatusInternalServerError)
		return
	}

	// log supprimé

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(facture)
}

// CreateFactureFromDevis godoc
// @Summary Créer une facture à partir d'un devis
// @Description Génère une facture en copiant les infos d'un devis existant
// @Tags Factures
// @Accept json
// @Produce json
// @Param devisId path string true "ID du devis à convertir en facture"
// @Success 201 {object} models.Facture "Facture créée depuis devis"
// @Failure 404 {string} string "Devis introuvable"
// @Failure 500 {string} string "Erreur interne du serveur"
// @Router /api/factures/from-devis/{devisId} [post]
func CreateFactureFromDevis(w http.ResponseWriter, r *http.Request) {
	devisId := chi.URLParam(r, "devisId")
	var devis models.Devis
	if err := config.DB.Preload("Lignes").Preload("Client").Preload("Entreprise").First(&devis, devisId).Error; err != nil {
		http.Error(w, "Devis introuvable", http.StatusNotFound)
		return
	}

	facture := models.Facture{
		Reference:       generateFactureNumber(),
		ClientID:        devis.ClientID,
		Client:          devis.Client,
		ClientNom:       devis.Client.GetDisplayName(),
		ClientAdresse:   devis.Client.Adresse,
		ClientEmail:     devis.Client.Email,
		ClientTelephone: devis.Client.Telephone,
		DateCreation:    time.Now(),
		DateEmission:    time.Now(),
		DateEcheance:    time.Now().AddDate(0, 0, 30),
		Description:     devis.Objet,
		TypeFacture:     "classique",
		SousTotalHT:     devis.SousTotalHT,
		TotalTVA:        devis.TotalTVA,
		TotalTTC:        devis.TotalTTC,
		Statut:          "en attente",
		LieuSignature:   devis.LieuSignature,
		DateSignature:   devis.DateSignature,
		EntrepriseID:    devis.EntrepriseID,
		DevisReference:  fmt.Sprintf("DEV-%04d", devis.ID),
	}

	// Copier les lignes du devis dans la facture
	for _, ligne := range devis.Lignes {
		facture.Lignes = append(facture.Lignes, models.LigneFacture{
			Description:  ligne.Description,
			Unite:        "unité",
			Quantite:     float64(ligne.Quantite),
			PrixUnitaire: ligne.PrixUnitaire,
			TotalLigne:   ligne.PrixUnitaire * float64(ligne.Quantite),
			TauxTVA:      ligne.TVA,
			MontantHT:    ligne.PrixUnitaire * float64(ligne.Quantite),
			MontantTTC:   ligne.PrixUnitaire * float64(ligne.Quantite) * (1 + ligne.TVA/100),
		})
	}

	if err := config.DB.Create(&facture).Error; err != nil {
		http.Error(w, "Erreur lors de la création de la facture", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(facture)
}

// GetAllFactures godoc
// @Summary Récupérer toutes les factures
// @Description Retourne la liste complète de toutes les factures
// @Tags Factures
// @Produce json
// @Success 200 {array} models.Facture "Liste de toutes les factures"
// @Failure 500 {string} string "Erreur lors de la récupération des factures"
// @Router /api/factures [get]
func GetAllFactures(w http.ResponseWriter, r *http.Request) {
	var factures []models.Facture

	if err := config.DB.Find(&factures).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération des factures", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(factures)
}

// GetFacture godoc
// @Summary Récupérer une facture par son ID
// @Description Récupère une facture spécifique avec ses détails
// @Tags Factures
// @Produce json
// @Param id path string true "ID de la facture à récupérer"
// @Success 200 {object} models.Facture "Facture trouvée"
// @Failure 404 {string} string "Facture introuvable"
// @Router /api/factures/{id} [get]
func GetFacture(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var facture models.Facture
	if err := config.DB.First(&facture, id).Error; err != nil {
		http.Error(w, "Facture introuvable", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(facture)
}

// UpdateFacture godoc
// @Summary Mettre à jour une facture existante
// @Description Met à jour une facture existante avec validation des données
// @Tags Factures
// @Accept json
// @Produce json
// @Param id path string true "ID de la facture à modifier"
// @Param facture body models.Facture true "Nouvelles données de la facture"
// @Success 200 {object} models.Facture "Facture mise à jour avec succès"
// @Failure 400 {string} string "Erreur de validation des données"
// @Failure 500 {string} string "Erreur lors de la mise à jour"
// @Router /api/factures/{id} [put]
func UpdateFacture(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var facture models.Facture

	if err := json.NewDecoder(r.Body).Decode(&facture); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validation des données de la facture
	if err := validateFactureData(&facture); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := config.DB.Model(&facture).Where("id = ?", id).Updates(facture).Error; err != nil {
		http.Error(w, "Erreur lors de la mise à jour de la facture", http.StatusInternalServerError)
		return
	}

	// Récupérer la facture mise à jour
	if err := config.DB.First(&facture, id).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération de la facture", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(facture)
}

// DeleteFacture godoc
// @Summary Supprimer une facture
// @Description Supprime définitivement une facture du système
// @Tags Factures
// @Param id path string true "ID de la facture à supprimer"
// @Success 204 "Facture supprimée avec succès"
// @Failure 500 {string} string "Erreur lors de la suppression"
// @Router /api/factures/{id} [delete]
func DeleteFacture(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := config.DB.Delete(&models.Facture{}, id).Error; err != nil {
		http.Error(w, "Erreur lors de la suppression de la facture", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GenerateFacturePDF godoc
// @Summary Générer un PDF de facture pour affichage
// @Description Génère une facture au format PDF pour affichage dans le navigateur
// @Tags Factures
// @Produce application/pdf
// @Param id path string true "ID de la facture à convertir en PDF"
// @Success 200 {file} file "Fichier PDF généré pour affichage"
// @Failure 404 {string} string "Facture introuvable"
// @Failure 500 {string} string "Erreur lors de la génération du PDF"
// @Router /api/factures/{id}/pdf [get]
func GenerateFacturePDF(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var facture models.Facture
	if err := config.DB.Preload("Client").Preload("Lignes").First(&facture, id).Error; err != nil {
		http.Error(w, "Facture introuvable", http.StatusNotFound)
		return
	}

	// Préparer les données pour le template
	data := prepareFacturePDFData(facture)

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

	// Choisir le template selon le type de facture
	templateName := "facture_final.html"
	if facture.TypeFacture == "acompte" {
		templateName = "facture_final.html" // même template avec mention du type
	}

	tmpl, err := template.New(templateName).Funcs(funcMap).ParseFiles("templates/" + templateName)
	if err != nil {
		http.Error(w, "Erreur chargement template", http.StatusInternalServerError)
		return
	}

	var htmlBuffer bytes.Buffer
	if err := tmpl.Execute(&htmlBuffer, data); err != nil {
		http.Error(w, "Erreur exécution template", http.StatusInternalServerError)
		return
	}

	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		http.Error(w, "Erreur PDF", http.StatusInternalServerError)
		return
	}

	// Configuration du PDF
	pdfg.Dpi.Set(300)
	pdfg.Orientation.Set(wkhtmltopdf.OrientationPortrait)
	pdfg.Grayscale.Set(false)
	pdfg.PageSize.Set(wkhtmltopdf.PageSizeA4)

	page := wkhtmltopdf.NewPageReader(bytes.NewReader(htmlBuffer.Bytes()))
	page.DisableSmartShrinking.Set(true)
	page.EnableLocalFileAccess.Set(true)
	pdfg.AddPage(page)

	if err := pdfg.Create(); err != nil {
		http.Error(w, "Erreur création PDF", http.StatusInternalServerError)
		return
	}

	// Nom de fichier personnalisé
	filename := fmt.Sprintf("facture_%s.pdf", facture.Reference)
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", filename))
	io.Copy(w, bytes.NewReader(pdfg.Bytes()))
}

// DownloadFacturePDF godoc
// @Summary Télécharger une facture en PDF
// @Description Génère et force le téléchargement d'une facture au format PDF
// @Tags Factures
// @Produce application/pdf
// @Param id path string true "ID de la facture à télécharger"
// @Success 200 {file} file "Fichier PDF à télécharger"
// @Failure 404 {string} string "Facture introuvable"
// @Failure 500 {string} string "Erreur lors de la génération du PDF"
// @Router /api/factures/{id}/download [get]
func DownloadFacturePDF(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var facture models.Facture
	if err := config.DB.Preload("Client").Preload("Lignes").First(&facture, id).Error; err != nil {
		http.Error(w, "Facture introuvable", http.StatusNotFound)
		return
	}

	// Préparer les données pour le template
	data := prepareFacturePDFData(facture)

	funcMap := template.FuncMap{
		"add": func(a, b int) int { return a + b },
		"formatPrice": func(price float64) string {
			return fmt.Sprintf("%.2f €", price)
		},
		"formatPercent": func(percent float64) string {
			return fmt.Sprintf("%.1f%%", percent)
		},
	}

	// Choisir le template selon le type de facture
	templateName := "facture.html"
	if facture.TypeFacture == "acompte" {
		templateName = "facture_acompte.html"
	}

	tmpl, err := template.New(templateName).Funcs(funcMap).ParseFiles("templates/" + templateName)
	if err != nil {
		http.Error(w, "Erreur chargement template", http.StatusInternalServerError)
		return
	}

	var htmlBuffer bytes.Buffer
	if err := tmpl.Execute(&htmlBuffer, data); err != nil {
		http.Error(w, "Erreur exécution template", http.StatusInternalServerError)
		return
	}

	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		http.Error(w, "Erreur PDF", http.StatusInternalServerError)
		return
	}

	pdfg.Dpi.Set(300)
	pdfg.Orientation.Set(wkhtmltopdf.OrientationPortrait)
	pdfg.Grayscale.Set(false)
	pdfg.PageSize.Set(wkhtmltopdf.PageSizeA4)

	page := wkhtmltopdf.NewPageReader(bytes.NewReader(htmlBuffer.Bytes()))
	page.DisableSmartShrinking.Set(true)
	page.EnableLocalFileAccess.Set(true)
	pdfg.AddPage(page)

	if err := pdfg.Create(); err != nil {
		http.Error(w, "Erreur création PDF", http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("facture_%s.pdf", facture.Reference)
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	io.Copy(w, bytes.NewReader(pdfg.Bytes()))
}

// GetFacturesByEntreprise godoc
// @Summary Récupérer toutes les factures d'une entreprise
// @Description Récupère la liste de toutes les factures appartenant à une entreprise spécifique
// @Tags Factures
// @Produce json
// @Param id path string true "ID de l'entreprise"
// @Success 200 {array} models.Facture "Liste des factures de l'entreprise"
// @Failure 400 {string} string "ID entreprise manquant"
// @Failure 500 {string} string "Erreur lors de la récupération"
// @Router /api/entreprises/{id}/factures [get]
func GetFacturesByEntreprise(w http.ResponseWriter, r *http.Request) {
	entrepriseID := chi.URLParam(r, "id")

	if entrepriseID == "" {
		http.Error(w, "ID entreprise manquant", http.StatusBadRequest)
		return
	}

	var factures []models.Facture
	if err := config.DB.Where("entreprise_id = ?", entrepriseID).Find(&factures).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(factures)
}

// GetFacturesByPlanning godoc
// @Summary Récupérer les factures liées à un planning
// @Description Récupère la liste des factures associées à un planning spécifique
// @Tags Factures
// @Produce json
// @Param id path string true "ID du planning"
// @Success 200 {array} models.Facture "Liste des factures du planning"
// @Failure 400 {string} string "ID planning manquant"
// @Failure 500 {string} string "Erreur lors de la récupération"
// @Router /api/plannings/{id}/factures [get]
func GetFacturesByPlanning(w http.ResponseWriter, r *http.Request) {
	planningID := chi.URLParam(r, "id")

	if planningID == "" {
		http.Error(w, "ID planning manquant", http.StatusBadRequest)
		return
	}

	var factures []models.Facture
	if err := config.DB.Where("planning_id = ?", planningID).Find(&factures).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(factures)
}

// UpdateFactureStatut godoc
// @Summary Mettre à jour le statut d'une facture
// @Description Met à jour uniquement le statut d'une facture (payée, en attente, rejetée)
// @Tags Factures
// @Accept json
// @Produce json
// @Param id path string true "ID de la facture"
// @Param statut body object{statut=string} true "Nouveau statut de la facture"
// @Success 200 {object} models.Facture "Facture avec statut mis à jour"
// @Failure 400 {string} string "Statut invalide"
// @Failure 500 {string} string "Erreur lors de la mise à jour du statut"
// @Router /api/factures/{id}/statut [patch]
func UpdateFactureStatut(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var requestData struct {
		Statut string `json:"statut"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Valider le statut
	validStatuts := []string{"payée", "en attente", "rejetée"}
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
	if err := config.DB.Model(&models.Facture{}).Where("id = ?", id).Update("statut", requestData.Statut).Error; err != nil {
		http.Error(w, "Erreur lors de la mise à jour du statut", http.StatusInternalServerError)
		return
	}

	// Récupérer la facture mise à jour
	var facture models.Facture
	if err := config.DB.First(&facture, id).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération de la facture", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(facture)
}

// GetFactureByID récupère une facture par son ID
// @Summary Récupérer une facture par ID
// @Description Récupère les détails d'une facture spécifique
// @Tags Factures
// @Accept json
// @Produce json
// @Param id path int true "ID de la facture"
// @Success 200 {object} models.Facture
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /factures/{id} [get]
func GetFactureByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var facture models.Facture
	if err := config.DB.Preload("Client").First(&facture, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Facture non trouvée", http.StatusNotFound)
			return
		}
		http.Error(w, "Erreur lors de la récupération de la facture", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(facture)
}

// SearchFactures recherche des factures selon des critères
// @Summary Rechercher des factures
// @Description Recherche des factures par référence, client ou description
// @Tags Factures
// @Accept json
// @Produce json
// @Param q query string true "Terme de recherche"
// @Success 200 {array} models.Facture
// @Failure 500 {object} map[string]string
// @Router /factures/search [get]
func SearchFactures(w http.ResponseWriter, r *http.Request) {
	searchTerm := r.URL.Query().Get("q")
	if searchTerm == "" {
		http.Error(w, "Terme de recherche requis", http.StatusBadRequest)
		return
	}

	var factures []models.Facture
	query := config.DB.Preload("Client").Where(
		"reference ILIKE ? OR client_nom ILIKE ? OR description ILIKE ?",
		"%"+searchTerm+"%", "%"+searchTerm+"%", "%"+searchTerm+"%",
	)

	if err := query.Find(&factures).Error; err != nil {
		http.Error(w, "Erreur lors de la recherche", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(factures)
}

// GetFacturesByClient récupère toutes les factures d'un client
// @Summary Récupérer les factures d'un client
// @Description Récupère toutes les factures associées à un client
// @Tags Factures
// @Accept json
// @Produce json
// @Param clientId path int true "ID du client"
// @Success 200 {array} models.Facture
// @Failure 500 {object} map[string]string
// @Router /factures/client/{clientId} [get]
func GetFacturesByClient(w http.ResponseWriter, r *http.Request) {
	clientID := chi.URLParam(r, "clientId")

	var factures []models.Facture
	if err := config.DB.Preload("Client").Where("client_id = ?", clientID).Find(&factures).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération des factures", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(factures)
}

// GetFacturesByStatut récupère les factures par statut
// @Summary Récupérer les factures par statut
// @Description Récupère toutes les factures ayant un statut spécifique
// @Tags Factures
// @Accept json
// @Produce json
// @Param statut path string true "Statut des factures" Enums(en_attente, payee, rejetee)
// @Success 200 {array} models.Facture
// @Failure 500 {object} map[string]string
// @Router /factures/statut/{statut} [get]
func GetFacturesByStatut(w http.ResponseWriter, r *http.Request) {
	statut := chi.URLParam(r, "statut")

	// Valider le statut
	validStatuts := map[string]bool{
		"en_attente": true,
		"payee":      true,
		"rejetee":    true,
	}

	if !validStatuts[statut] {
		http.Error(w, "Statut invalide", http.StatusBadRequest)
		return
	}

	var factures []models.Facture
	if err := config.DB.Preload("Client").Where("statut = ?", statut).Find(&factures).Error; err != nil {
		http.Error(w, "Erreur lors de la récupération des factures", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(factures)
}

// prepareFacturePDFData prépare les données pour le template PDF
func prepareFacturePDFData(facture models.Facture) FacturePDFData {
	// Formatage des dates
	var dateEmission, dateEcheance string
	if !facture.DateEmission.IsZero() {
		dateEmission = facture.DateEmission.Format("02 janvier 2006")
	} else if !facture.DateCreation.IsZero() {
		dateEmission = facture.DateCreation.Format("02 janvier 2006")
	} else {
		dateEmission = time.Now().Format("02 janvier 2006")
	}

	if !facture.DateEcheance.IsZero() {
		dateEcheance = facture.DateEcheance.Format("02 janvier 2006")
	} else {
		dateEcheance = time.Now().AddDate(0, 1, 0).Format("02 janvier 2006")
	}

	// Calculer les montants TVA si nécessaire
	montantTVA := facture.TotalTVA
	if montantTVA == 0 && facture.TotalTTC > 0 && facture.SousTotalHT > 0 {
		montantTVA = facture.TotalTTC - facture.SousTotalHT
	}

	// Informations de l'entreprise
	company := config.GetCompanyInfo()
	devisConfig := config.GetDevisConfig()

	// Informations client
	var clientNom, clientAdresse, clientEmail, clientTelephone string
	if facture.Client.ID != 0 {
		clientNom = facture.Client.GetDisplayName()
		clientAdresse = facture.Client.Adresse
		clientEmail = facture.Client.Email
		clientTelephone = facture.Client.Telephone
	}

	// Préparer les lignes de facture
	var lignes []LigneFacture
	for _, ligne := range facture.Lignes {
		lignes = append(lignes, LigneFacture{
			Designation:  ligne.Description,
			Unite:        ligne.Unite,
			Quantite:     ligne.Quantite,
			PrixUnitaire: ligne.PrixUnitaire,
			MontantHT:    ligne.MontantHT,
			TVA:          ligne.TauxTVA,
			MontantTTC:   ligne.MontantTTC,
		})
	}

	return FacturePDFData{
		Reference:       facture.Reference,
		Numero:          facture.Reference, // Alias pour compatibilité
		Ville:           devisConfig.DefaultCity,
		DateEmission:    dateEmission,
		DateEcheance:    dateEcheance,
		ClientNom:       clientNom,
		ClientAdresse:   clientAdresse,
		ClientEmail:     clientEmail,
		ClientTelephone: clientTelephone,
		Description:     facture.Description,
		Lignes:          lignes,
		SousTotalHT:     facture.SousTotalHT,
		TotalTVA:        montantTVA,
		TotalTTC:        facture.TotalTTC,
		TypeFacture:     facture.TypeFacture,
		Statut:          facture.Statut,
		Company:         company,
		LieuSignature:   facture.LieuSignature,
		DateSignature:   facture.DateSignature,
	}
}

// validateFactureData valide les données d'une facture
func validateFactureData(facture *models.Facture) error {
	// Vérifier que l'entreprise existe seulement si l'ID n'est pas 0
	if facture.EntrepriseID != 0 {
		var entreprise models.Entreprise
		if err := config.DB.First(&entreprise, facture.EntrepriseID).Error; err != nil {
			return fmt.Errorf("entreprise introuvable")
		}
	}

	// Vérifier le type de facture
	validTypes := []string{"classique", "acompte", "avancement", "standard"}
	typeValide := false
	for _, t := range validTypes {
		if t == facture.TypeFacture {
			typeValide = true
			break
		}
	}

	if !typeValide {
		return fmt.Errorf("type de facture invalide")
	}

	// Vérifier les montants
	if facture.SousTotalHT < 0 || facture.TotalTTC < 0 {
		return fmt.Errorf("les montants ne peuvent pas être négatifs")
	}

	return nil
}

// generateFactureNumber génère un numéro de facture unique
func generateFactureNumber() string {
	year := time.Now().Year()

	// Rechercher la dernière référence de l'année pour éviter les doublons
	var maxNumber int = 0

	// Chercher toutes les factures de l'année et extraire le plus grand numéro
	var factures []models.Facture
	config.DB.Where("reference LIKE ?", fmt.Sprintf("FAC-%d-%%", year)).Find(&factures)

	for _, facture := range factures {
		// Extraire le numéro de la référence (format: FAC-2025-XXXX)
		var num int
		if _, err := fmt.Sscanf(facture.Reference, "FAC-%d-%d", &year, &num); err == nil {
			if num > maxNumber {
				maxNumber = num
			}
		}
	}

	return fmt.Sprintf("FAC-%d-%04d", year, maxNumber+1)
}
