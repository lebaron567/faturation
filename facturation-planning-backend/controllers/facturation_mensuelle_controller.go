package controllers

import (
	"encoding/json"
	"facturation-planning/config"
	"facturation-planning/models"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

// FacturationMensuelleRequest représente la demande de facturation mensuelle
type FacturationMensuelleRequest struct {
	Mois      int    `json:"mois" validate:"required,min=1,max=12"`
	Annee     int    `json:"annee" validate:"required,min=2020"`
	ClientIDs []uint `json:"client_ids"` // Si vide, tous les clients
}

// PrestationFacturable représente une prestation facturable
type PrestationFacturable struct {
	PlanningID      uint      `json:"planning_id"`
	Date            time.Time `json:"date"`
	Objet           string    `json:"objet"`
	Prestation      string    `json:"prestation"`
	TypeFacturation string    `json:"type_facturation"` // "horaire" ou "forfait"
	TauxHoraire     *float64  `json:"taux_horaire,omitempty"`
	ForfaitHT       *float64  `json:"forfait_ht,omitempty"`
	Duree           float64   `json:"duree,omitempty"` // en heures
	MontantHT       float64   `json:"montant_ht"`
	TVA             float64   `json:"tva"`
	MontantTTC      float64   `json:"montant_ttc"`
}

// ClientFacturation représente les données de facturation pour un client
type ClientFacturation struct {
	ClientID    uint                    `json:"client_id"`
	ClientNom   string                  `json:"client_nom"`
	Prestations []PrestationFacturable  `json:"prestations"`
	TotalHT     float64                 `json:"total_ht"`
	TotalTVA    float64                 `json:"total_tva"`
	TotalTTC    float64                 `json:"total_ttc"`
	NbHeures    float64                 `json:"nb_heures"`
	NbForfaits  int                     `json:"nb_forfaits"`
}

// FacturationMensuelleResponse représente la réponse de facturation mensuelle
type FacturationMensuelleResponse struct {
	Mois               int                  `json:"mois"`
	Annee              int                  `json:"annee"`
	NomMois            string               `json:"nom_mois"`
	NbClients          int                  `json:"nb_clients"`
	NbPrestations      int                  `json:"nb_prestations"`
	TotalGeneralHT     float64              `json:"total_general_ht"`
	TotalGeneralTVA    float64              `json:"total_general_tva"`
	TotalGeneralTTC    float64              `json:"total_general_ttc"`
	ClientsFacturation []ClientFacturation  `json:"clients_facturation"`
	FacturesCreees     []uint               `json:"factures_creees,omitempty"`
}

// @Summary Aperçu de la facturation mensuelle
// @Description Génère un aperçu des factures à créer pour un mois donné
// @Tags Facturation
// @Accept json
// @Produce json
// @Param request body FacturationMensuelleRequest true "Paramètres de facturation"
// @Success 200 {object} FacturationMensuelleResponse
// @Failure 400 {string} string "Paramètres invalides"
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/facturation-mensuelle/preview [post]
func GetFacturationMensuellePreview(w http.ResponseWriter, r *http.Request) {
	var request FacturationMensuelleRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Paramètres invalides", http.StatusBadRequest)
		return
	}

	// Validation
	if request.Mois < 1 || request.Mois > 12 {
		http.Error(w, "Mois invalide (1-12)", http.StatusBadRequest)
		return
	}
	if request.Annee < 2020 {
		http.Error(w, "Année invalide", http.StatusBadRequest)
		return
	}

	response, err := generateFacturationMensuelle(request, false)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// @Summary Créer la facturation mensuelle
// @Description Crée effectivement toutes les factures pour un mois donné
// @Tags Facturation
// @Accept json
// @Produce json
// @Param request body FacturationMensuelleRequest true "Paramètres de facturation"
// @Success 201 {object} FacturationMensuelleResponse
// @Failure 400 {string} string "Paramètres invalides"
// @Failure 500 {string} string "Erreur serveur"
// @Router /api/facturation-mensuelle/create [post]
func CreateFacturationMensuelle(w http.ResponseWriter, r *http.Request) {
	var request FacturationMensuelleRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Paramètres invalides", http.StatusBadRequest)
		return
	}

	// Validation
	if request.Mois < 1 || request.Mois > 12 {
		http.Error(w, "Mois invalide (1-12)", http.StatusBadRequest)
		return
	}
	if request.Annee < 2020 {
		http.Error(w, "Année invalide", http.StatusBadRequest)
		return
	}

	response, err := generateFacturationMensuelle(request, true)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateFacturationMensuelle(request FacturationMensuelleRequest, createFactures bool) (*FacturationMensuelleResponse, error) {
	// Calculer les dates du mois
	startDate := time.Date(request.Annee, time.Month(request.Mois), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, -1)
	endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 0, time.UTC)

	fmt.Printf("🔍 Recherche plannings du %s au %s\n", startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))

	// Construire la requête pour récupérer les plannings facturables
	query := config.DB.Where("date >= ? AND date <= ?", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Where("type_evenement IN (?)", []string{"Intervention", "Formation", "Divers"}).
		Where("(taux_horaire IS NOT NULL AND taux_horaire > 0) OR (forfait_ht IS NOT NULL AND forfait_ht > 0)").
		Preload("Client")

	// Filtrer par clients si spécifié
	if len(request.ClientIDs) > 0 {
		query = query.Where("client_id IN (?)", request.ClientIDs)
	}

	var plannings []models.Planning
	if err := query.Find(&plannings).Error; err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des plannings: %v", err)
	}

	fmt.Printf("📋 Trouvé %d plannings facturables\n", len(plannings))

	// Grouper par client
	clientsMap := make(map[uint]*ClientFacturation)

	for _, planning := range plannings {
		if planning.ClientID == 0 {
			continue // Ignorer les plannings sans client
		}

		// Créer l'item client s'il n'existe pas
		if _, exists := clientsMap[planning.ClientID]; !exists {
			clientName := "Client inconnu"
			if planning.Client.GetDisplayName() != "" {
				clientName = planning.Client.GetDisplayName()
			}

			clientsMap[planning.ClientID] = &ClientFacturation{
				ClientID:    planning.ClientID,
				ClientNom:   clientName,
				Prestations: []PrestationFacturable{},
			}
		}

		// Calculer la prestation facturable
		prestation, err := calculatePrestationFacturable(&planning)
		if err != nil {
			fmt.Printf("⚠️ Erreur calcul prestation planning %d: %v\n", planning.ID, err)
			continue
		}

		client := clientsMap[planning.ClientID]
		client.Prestations = append(client.Prestations, prestation)

		// Mettre à jour les totaux
		client.TotalHT += prestation.MontantHT
		client.TotalTVA += prestation.TVA
		client.TotalTTC += prestation.MontantTTC

		if prestation.TypeFacturation == "horaire" {
			client.NbHeures += prestation.Duree
		} else {
			client.NbForfaits++
		}
	}

	// Convertir en slice et calculer les totaux généraux
	var clientsFacturation []ClientFacturation
	var totalGeneralHT, totalGeneralTVA, totalGeneralTTC float64
	var nbPrestationsTotales int

	for _, client := range clientsMap {
		clientsFacturation = append(clientsFacturation, *client)
		totalGeneralHT += client.TotalHT
		totalGeneralTVA += client.TotalTVA
		totalGeneralTTC += client.TotalTTC
		nbPrestationsTotales += len(client.Prestations)
	}

	response := &FacturationMensuelleResponse{
		Mois:               request.Mois,
		Annee:              request.Annee,
		NomMois:            getMonthName(request.Mois),
		NbClients:          len(clientsFacturation),
		NbPrestations:      nbPrestationsTotales,
		TotalGeneralHT:     roundFloat(totalGeneralHT, 2),
		TotalGeneralTVA:    roundFloat(totalGeneralTVA, 2),
		TotalGeneralTTC:    roundFloat(totalGeneralTTC, 2),
		ClientsFacturation: clientsFacturation,
	}

	// Créer les factures si demandé
	if createFactures && len(clientsFacturation) > 0 {
		facturesCreees, err := createFacturesFromFacturation(request, clientsFacturation)
		if err != nil {
			return nil, fmt.Errorf("erreur lors de la création des factures: %v", err)
		}
		response.FacturesCreees = facturesCreees
		fmt.Printf("✅ %d factures créées\n", len(facturesCreees))
	}

	return response, nil
}

func calculatePrestationFacturable(planning *models.Planning) (PrestationFacturable, error) {
	var montantHT, tva, montantTTC float64
	var duree float64
	var typeFacturation string

	// Calculer la durée si on a une heure de fin
	if planning.HeureFin != "" && planning.HeureDebut != "" {
		debut, err1 := time.Parse("15:04", planning.HeureDebut)
		fin, err2 := time.Parse("15:04", planning.HeureFin)
		if err1 == nil && err2 == nil {
			duree = fin.Sub(debut).Hours()
			if duree < 0 {
				duree += 24 // Cas où la fin est le lendemain
			}
		}
	}

	// Déterminer le type de facturation et calculer le montant
	if planning.ForfaitHT != nil && *planning.ForfaitHT > 0 {
		typeFacturation = "forfait"
		montantHT = *planning.ForfaitHT
		duree = 0 // Pas de durée pour un forfait
	} else if planning.TauxHoraire != nil && *planning.TauxHoraire > 0 && duree > 0 {
		typeFacturation = "horaire"
		montantHT = *planning.TauxHoraire * duree
	} else {
		return PrestationFacturable{}, fmt.Errorf("aucune méthode de facturation valide")
	}

	// Calcul TVA (20% par défaut)
	tauxTVA := 20.0
	tva = montantHT * tauxTVA / 100
	montantTTC = montantHT + tva

	// Préparer les libellés
	objet := "Prestation"
	if planning.Objet != nil && *planning.Objet != "" {
		objet = *planning.Objet
	}

	prestation := planning.TypeEvenement
	if planning.Prestation != nil && *planning.Prestation != "" {
		prestation = *planning.Prestation
	}

	// Parser la date
	dateTime, err := time.Parse("2006-01-02", planning.Date)
	if err != nil {
		dateTime = time.Now()
	}

	return PrestationFacturable{
		PlanningID:      planning.ID,
		Date:            dateTime,
		Objet:           objet,
		Prestation:      prestation,
		TypeFacturation: typeFacturation,
		TauxHoraire:     planning.TauxHoraire,
		ForfaitHT:       planning.ForfaitHT,
		Duree:           roundFloat(duree, 2),
		MontantHT:       roundFloat(montantHT, 2),
		TVA:             roundFloat(tva, 2),
		MontantTTC:      roundFloat(montantTTC, 2),
	}, nil
}

func createFacturesFromFacturation(request FacturationMensuelleRequest, clientsFacturation []ClientFacturation) ([]uint, error) {
	var facturesCreees []uint

	for _, client := range clientsFacturation {
		if len(client.Prestations) == 0 {
			continue
		}

		// Créer la facture
		facture := models.Facture{
			ClientID:     client.ClientID,
			DateFacture:  time.Now().Format("2006-01-02"),
			DateEcheance: time.Now().AddDate(0, 0, 30).Format("2006-01-02"), // 30 jours
			Conditions:   "Paiement sous 30 jours",
			Objet:        fmt.Sprintf("Facturation %s %d", getMonthName(request.Mois), request.Annee),
			Statut:       "emise",
			SousTotalHT:  client.TotalHT,
			TotalTVA:     client.TotalTVA,
			TotalTTC:     client.TotalTTC,
		}

		if err := config.DB.Create(&facture).Error; err != nil {
			return nil, fmt.Errorf("erreur création facture pour client %d: %v", client.ClientID, err)
		}

		fmt.Printf("📄 Facture créée #%d pour client %d (%.2f€ TTC)\n", facture.ID, client.ClientID, client.TotalTTC)

		// Créer les lignes de facture (groupées par type si plusieurs prestations similaires)
		prestationsGroupees := groupPrestations(client.Prestations)
		
		for description, details := range prestationsGroupees {
			quantite := float64(len(details.prestations))
			prixUnitaire := details.totalHT / quantite

			ligne := models.LigneFacture{
				FactureID:    facture.ID,
				Description:  description,
				Quantite:     quantite,
				PrixUnitaire: roundFloat(prixUnitaire, 2),
				TVA:          20, // 20% par défaut
			}

			if err := config.DB.Create(&ligne).Error; err != nil {
				return nil, fmt.Errorf("erreur création ligne facture: %v", err)
			}
		}

		facturesCreees = append(facturesCreees, facture.ID)
	}

	return facturesCreees, nil
}

type prestationGroup struct {
	prestations []PrestationFacturable
	totalHT     float64
}

func groupPrestations(prestations []PrestationFacturable) map[string]prestationGroup {
	groups := make(map[string]prestationGroup)

	for _, prestation := range prestations {
		// Créer une clé de groupement basée sur le type de prestation
		key := fmt.Sprintf("%s - %s", prestation.Prestation, prestation.Objet)
		if prestation.TypeFacturation == "horaire" {
			key += " (horaire)"
		} else {
			key += " (forfait)"
		}

		if group, exists := groups[key]; exists {
			group.prestations = append(group.prestations, prestation)
			group.totalHT += prestation.MontantHT
			groups[key] = group
		} else {
			groups[key] = prestationGroup{
				prestations: []PrestationFacturable{prestation},
				totalHT:     prestation.MontantHT,
			}
		}
	}

	return groups
}

func getMonthName(mois int) string {
	months := []string{
		"", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
		"Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
	}
	if mois >= 1 && mois <= 12 {
		return months[mois]
	}
	return "Mois inconnu"
}

func roundFloat(val float64, precision int) float64 {
	ratio := float64(1)
	for i := 0; i < precision; i++ {
		ratio *= 10
	}
	return float64(int(val*ratio+0.5)) / ratio
}
