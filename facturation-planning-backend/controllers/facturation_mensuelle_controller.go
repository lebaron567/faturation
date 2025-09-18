package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"facturation-planning/config"
	"facturation-planning/models"
)

// FacturationMensuelleRequest représente la demande de facturation mensuelle
type FacturationMensuelleRequest struct {
	Mois      int    `json:"mois" binding:"required,min=1,max=12"`
	Annee     int    `json:"annee" binding:"required,min=2020,max=2030"`
	ClientIDs []uint `json:"client_ids"` // Optionnel, vide = tous les clients
}

// PrestationFacturable représente une prestation qui peut être facturée
type PrestationFacturable struct {
	Date            string  `json:"date"`
	ClientID        uint    `json:"client_id"`
	ClientNom       string  `json:"client_nom"`
	Prestation      string  `json:"prestation"`
	Objet           string  `json:"objet"`
	Duree           float64 `json:"duree"`
	TauxHoraire     float64 `json:"taux_horaire"`
	ForfaitHT       float64 `json:"forfait_ht"`
	TypeFacturation string  `json:"type_facturation"` // "horaire" ou "forfait"
	MontantHT       float64 `json:"montant_ht"`
	MontantTTC      float64 `json:"montant_ttc"`
	TauxTVA         float64 `json:"taux_tva"`
}

// ClientFacturation représente la facturation d'un client
type ClientFacturation struct {
	ClientID    uint                   `json:"client_id"`
	ClientNom   string                 `json:"client_nom"`
	NbHeures    float64                `json:"nb_heures"`
	NbForfaits  int                    `json:"nb_forfaits"`
	TotalHT     float64                `json:"total_ht"`
	TotalTTC    float64                `json:"total_ttc"`
	Prestations []PrestationFacturable `json:"prestations"`
}

// FacturationMensuelleResponse représente la réponse d'aperçu
type FacturationMensuelleResponse struct {
	Mois               int                 `json:"mois"`
	NomMois            string              `json:"nom_mois"`
	Annee              int                 `json:"annee"`
	NbClients          int                 `json:"nb_clients"`
	NbPrestations      int                 `json:"nb_prestations"`
	TotalGeneralHT     float64             `json:"total_general_ht"`
	TotalGeneralTTC    float64             `json:"total_general_ttc"`
	ClientsFacturation []ClientFacturation `json:"clients_facturation"`
}

// FacturationMensuelleCreateResponse représente la réponse de création
type FacturationMensuelleCreateResponse struct {
	FacturesCreees []FactureCreee `json:"factures_creees"`
	NbFactures     int            `json:"nb_factures"`
	TotalHT        float64        `json:"total_ht"`
	TotalTTC       float64        `json:"total_ttc"`
}

// FactureCreee représente une facture créée
type FactureCreee struct {
	ID        uint    `json:"id"`
	Reference string  `json:"reference"`
	ClientNom string  `json:"client_nom"`
	TotalHT   float64 `json:"total_ht"`
	TotalTTC  float64 `json:"total_ttc"`
}

var nomsMois = []string{
	"", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
	"Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
}

// GetFacturationMensuellePreview génère un aperçu de la facturation mensuelle
func GetFacturationMensuellePreview(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req FacturationMensuelleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Erreur de parsing JSON: %v", err), http.StatusBadRequest)
		return
	}

	log.Printf("🔍 Preview facturation mensuelle: mois=%d, année=%d, clients=%v", req.Mois, req.Annee, req.ClientIDs)

	// Valider les paramètres
	if req.Mois < 1 || req.Mois > 12 {
		http.Error(w, "Le mois doit être entre 1 et 12", http.StatusBadRequest)
		return
	}
	if req.Annee < 2020 || req.Annee > 2030 {
		http.Error(w, "L'année doit être entre 2020 et 2030", http.StatusBadRequest)
		return
	}

	// Calculer les dates de début et fin du mois
	dateDebut := time.Date(req.Annee, time.Month(req.Mois), 1, 0, 0, 0, 0, time.UTC)
	dateFin := dateDebut.AddDate(0, 1, -1).Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	log.Printf("📅 Période: %v à %v", dateDebut.Format("2006-01-02"), dateFin.Format("2006-01-02"))

	// Requête pour récupérer les plannings facturables
	query := config.DB.Table("plannings").
		Select(`
			plannings.date,
			plannings.client_id,
			clients.nom as client_nom,
			clients.prenom as client_prenom,
			clients.raison_sociale,
			clients.type_client,
			plannings.prestation,
			plannings.objet,
			plannings.duree,
			plannings.taux_horaire,
			plannings.forfait_ht,
			plannings.type_evenement
		`).
		Joins("JOIN clients ON plannings.client_id = clients.id").
		Where("plannings.date >= ? AND plannings.date <= ?", dateDebut, dateFin).
		Where("plannings.type_evenement IN (?)", []string{"Intervention", "Formation", "Divers"}).
		Where("(plannings.taux_horaire IS NOT NULL AND plannings.taux_horaire > 0) OR (plannings.forfait_ht IS NOT NULL AND plannings.forfait_ht > 0)")

	// Filtrer par clients si spécifié
	if len(req.ClientIDs) > 0 {
		query = query.Where("plannings.client_id IN (?)", req.ClientIDs)
	}

	// Exécuter la requête
	rows, err := query.Rows()
	if err != nil {
		log.Printf("❌ Erreur requête plannings: %v", err)
		http.Error(w, fmt.Sprintf("Erreur base de données: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	clientsMap := make(map[uint]*ClientFacturation)
	var totalGeneralHT, totalGeneralTTC float64
	var nbPrestationsTotal int

	// Traiter chaque ligne
	for rows.Next() {
		var date time.Time
		var clientID uint
		var clientNom, clientPrenom, raisonSociale, typeClient, prestation, objet, typeEvenement string
		var duree, tauxHoraire, forfaitHT *float64

		err := rows.Scan(&date, &clientID, &clientNom, &clientPrenom, &raisonSociale, &typeClient,
			&prestation, &objet, &duree, &tauxHoraire, &forfaitHT, &typeEvenement)
		if err != nil {
			log.Printf("❌ Erreur scan ligne: %v", err)
			continue
		}

		// Calculer le nom du client
		var nomComplet string
		if typeClient == "professionnel" && raisonSociale != "" {
			nomComplet = raisonSociale
		} else {
			nomComplet = fmt.Sprintf("%s %s", clientPrenom, clientNom)
		}

		// Déterminer le type de facturation et calculer le montant
		var typeFacturation string
		var montantHT float64

		if tauxHoraire != nil && *tauxHoraire > 0 && duree != nil && *duree > 0 {
			typeFacturation = "horaire"
			montantHT = *tauxHoraire * *duree
		} else if forfaitHT != nil && *forfaitHT > 0 {
			typeFacturation = "forfait"
			montantHT = *forfaitHT
		} else {
			log.Printf("⚠️ Prestation non facturable: clientID=%d, date=%v", clientID, date)
			continue
		}

		tauxTVA := 20.0 // TVA par défaut
		montantTTC := montantHT * (1 + tauxTVA/100)

		// Créer la prestation
		prestationFacturable := PrestationFacturable{
			Date:            date.Format("2006-01-02"),
			ClientID:        clientID,
			ClientNom:       nomComplet,
			Prestation:      prestation,
			Objet:           objet,
			Duree:           getFloat64Value(duree),
			TauxHoraire:     getFloat64Value(tauxHoraire),
			ForfaitHT:       getFloat64Value(forfaitHT),
			TypeFacturation: typeFacturation,
			MontantHT:       montantHT,
			MontantTTC:      montantTTC,
			TauxTVA:         tauxTVA,
		}

		// Ajouter au client
		if clientsMap[clientID] == nil {
			clientsMap[clientID] = &ClientFacturation{
				ClientID:    clientID,
				ClientNom:   nomComplet,
				Prestations: []PrestationFacturable{},
			}
		}

		client := clientsMap[clientID]
		client.Prestations = append(client.Prestations, prestationFacturable)
		client.TotalHT += montantHT
		client.TotalTTC += montantTTC

		if typeFacturation == "horaire" {
			client.NbHeures += getFloat64Value(duree)
		} else {
			client.NbForfaits++
		}

		totalGeneralHT += montantHT
		totalGeneralTTC += montantTTC
		nbPrestationsTotal++
	}

	// Convertir la map en slice
	var clientsFacturation []ClientFacturation
	for _, client := range clientsMap {
		clientsFacturation = append(clientsFacturation, *client)
	}

	response := FacturationMensuelleResponse{
		Mois:               req.Mois,
		NomMois:            nomsMois[req.Mois],
		Annee:              req.Annee,
		NbClients:          len(clientsFacturation),
		NbPrestations:      nbPrestationsTotal,
		TotalGeneralHT:     totalGeneralHT,
		TotalGeneralTTC:    totalGeneralTTC,
		ClientsFacturation: clientsFacturation,
	}

	log.Printf("✅ Preview généré: %d clients, %d prestations, %.2f€ TTC",
		response.NbClients, response.NbPrestations, response.TotalGeneralTTC)

	json.NewEncoder(w).Encode(response)
}

// CreateFacturationMensuelle crée les factures pour le mois sélectionné
func CreateFacturationMensuelle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req FacturationMensuelleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Erreur de parsing JSON: %v", err), http.StatusBadRequest)
		return
	}

	log.Printf("💰 Création facturation mensuelle: mois=%d, année=%d, clients=%v", req.Mois, req.Annee, req.ClientIDs)

	// Récupérer d'abord l'aperçu pour avoir les données
	preview, err := getFacturationMensuelleData(req)
	if err != nil {
		log.Printf("❌ Erreur récupération données: %v", err)
		http.Error(w, fmt.Sprintf("Erreur récupération données: %v", err), http.StatusInternalServerError)
		return
	}

	if preview.NbClients == 0 {
		response := FacturationMensuelleCreateResponse{
			FacturesCreees: []FactureCreee{},
			NbFactures:     0,
			TotalHT:        0,
			TotalTTC:       0,
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	var facturesCreees []FactureCreee
	var totalHT, totalTTC float64

	// Créer une facture pour chaque client
	for _, clientFacturation := range preview.ClientsFacturation {
		// Récupérer les informations complètes du client
		var client models.Client
		if err := config.DB.First(&client, clientFacturation.ClientID).Error; err != nil {
			log.Printf("❌ Erreur récupération client %d: %v", clientFacturation.ClientID, err)
			continue
		}

		// Générer une référence unique
		reference := fmt.Sprintf("FAC-%d-%02d-%03d", req.Annee, req.Mois, clientFacturation.ClientID)

		// Créer la facture avec les bons champs
		facture := models.Facture{
			Reference:       reference,
			ClientID:        client.ID,
			ClientNom:       clientFacturation.ClientNom,
			ClientAdresse:   fmt.Sprintf("%s, %s %s", client.Adresse, client.CodePostal, client.Ville),
			ClientEmail:     client.Email,
			ClientTelephone: client.Telephone,
			DateCreation:    time.Now(),
			DateEmission:    time.Now(),
			DateEcheance:    time.Now().AddDate(0, 0, 30), // 30 jours
			Description:     fmt.Sprintf("Facturation %s %d", nomsMois[req.Mois], req.Annee),
			TypeFacture:     "classique",
			SousTotalHT:     clientFacturation.TotalHT,
			TauxTVA:         20.0,
			TotalTVA:        clientFacturation.TotalHT * 0.2,
			TotalTTC:        clientFacturation.TotalTTC,
			MontantTVA:      clientFacturation.TotalHT * 0.2,
			Statut:          "en_attente",
			LieuSignature:   "Paris",
			DateSignature:   time.Now().Format("02/01/2006"),
		}

		// Sauvegarder la facture
		if err := config.DB.Create(&facture).Error; err != nil {
			log.Printf("❌ Erreur création facture pour client %d: %v", client.ID, err)
			continue
		}

		// Créer les lignes de facture
		for _, prestation := range clientFacturation.Prestations {
			ligne := models.LigneFacture{
				FactureID:    facture.ID,
				Description:  fmt.Sprintf("%s - %s (%s)", prestation.Prestation, prestation.Objet, prestation.Date),
				Unite:        "prestation",
				Quantite:     1,
				PrixUnitaire: prestation.MontantHT,
				TotalLigne:   prestation.MontantHT,
				TauxTVA:      prestation.TauxTVA,
				MontantHT:    prestation.MontantHT,
				MontantTTC:   prestation.MontantTTC,
			}

			if err := config.DB.Create(&ligne).Error; err != nil {
				log.Printf("❌ Erreur création ligne facture: %v", err)
			}
		}

		factureCreee := FactureCreee{
			ID:        facture.ID,
			Reference: facture.Reference,
			ClientNom: facture.ClientNom,
			TotalHT:   facture.SousTotalHT,
			TotalTTC:  facture.TotalTTC,
		}

		facturesCreees = append(facturesCreees, factureCreee)
		totalHT += facture.SousTotalHT
		totalTTC += facture.TotalTTC

		log.Printf("✅ Facture créée: %s pour %s (%.2f€ TTC)", facture.Reference, facture.ClientNom, facture.TotalTTC)
	}

	response := FacturationMensuelleCreateResponse{
		FacturesCreees: facturesCreees,
		NbFactures:     len(facturesCreees),
		TotalHT:        totalHT,
		TotalTTC:       totalTTC,
	}

	log.Printf("🎉 Facturation mensuelle terminée: %d factures créées, %.2f€ TTC total",
		response.NbFactures, response.TotalTTC)

	json.NewEncoder(w).Encode(response)
}

// getFacturationMensuelleData récupère les données de facturation (fonction helper)
func getFacturationMensuelleData(req FacturationMensuelleRequest) (*FacturationMensuelleResponse, error) {
	// Calculer les dates de début et fin du mois
	dateDebut := time.Date(req.Annee, time.Month(req.Mois), 1, 0, 0, 0, 0, time.UTC)
	dateFin := dateDebut.AddDate(0, 1, -1).Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	// Requête pour récupérer les plannings facturables
	query := config.DB.Table("plannings").
		Select(`
			plannings.date,
			plannings.client_id,
			clients.nom as client_nom,
			clients.prenom as client_prenom,
			clients.raison_sociale,
			clients.type_client,
			plannings.prestation,
			plannings.objet,
			plannings.duree,
			plannings.taux_horaire,
			plannings.forfait_ht
		`).
		Joins("JOIN clients ON plannings.client_id = clients.id").
		Where("plannings.date >= ? AND plannings.date <= ?", dateDebut, dateFin).
		Where("plannings.type_evenement IN (?)", []string{"Intervention", "Formation", "Divers"}).
		Where("(plannings.taux_horaire IS NOT NULL AND plannings.taux_horaire > 0) OR (plannings.forfait_ht IS NOT NULL AND plannings.forfait_ht > 0)")

	if len(req.ClientIDs) > 0 {
		query = query.Where("plannings.client_id IN (?)", req.ClientIDs)
	}

	rows, err := query.Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	clientsMap := make(map[uint]*ClientFacturation)
	var totalGeneralHT, totalGeneralTTC float64
	var nbPrestationsTotal int

	for rows.Next() {
		var date time.Time
		var clientID uint
		var clientNom, clientPrenom, raisonSociale, typeClient, prestation, objet string
		var duree, tauxHoraire, forfaitHT *float64

		err := rows.Scan(&date, &clientID, &clientNom, &clientPrenom, &raisonSociale, &typeClient,
			&prestation, &objet, &duree, &tauxHoraire, &forfaitHT)
		if err != nil {
			continue
		}

		var nomComplet string
		if typeClient == "professionnel" && raisonSociale != "" {
			nomComplet = raisonSociale
		} else {
			nomComplet = fmt.Sprintf("%s %s", clientPrenom, clientNom)
		}

		var typeFacturation string
		var montantHT float64

		if tauxHoraire != nil && *tauxHoraire > 0 && duree != nil && *duree > 0 {
			typeFacturation = "horaire"
			montantHT = *tauxHoraire * *duree
		} else if forfaitHT != nil && *forfaitHT > 0 {
			typeFacturation = "forfait"
			montantHT = *forfaitHT
		} else {
			continue
		}

		tauxTVA := 20.0
		montantTTC := montantHT * (1 + tauxTVA/100)

		prestationFacturable := PrestationFacturable{
			Date:            date.Format("2006-01-02"),
			ClientID:        clientID,
			ClientNom:       nomComplet,
			Prestation:      prestation,
			Objet:           objet,
			Duree:           getFloat64Value(duree),
			TauxHoraire:     getFloat64Value(tauxHoraire),
			ForfaitHT:       getFloat64Value(forfaitHT),
			TypeFacturation: typeFacturation,
			MontantHT:       montantHT,
			MontantTTC:      montantTTC,
			TauxTVA:         tauxTVA,
		}

		if clientsMap[clientID] == nil {
			clientsMap[clientID] = &ClientFacturation{
				ClientID:    clientID,
				ClientNom:   nomComplet,
				Prestations: []PrestationFacturable{},
			}
		}

		client := clientsMap[clientID]
		client.Prestations = append(client.Prestations, prestationFacturable)
		client.TotalHT += montantHT
		client.TotalTTC += montantTTC

		if typeFacturation == "horaire" {
			client.NbHeures += getFloat64Value(duree)
		} else {
			client.NbForfaits++
		}

		totalGeneralHT += montantHT
		totalGeneralTTC += montantTTC
		nbPrestationsTotal++
	}

	var clientsFacturation []ClientFacturation
	for _, client := range clientsMap {
		clientsFacturation = append(clientsFacturation, *client)
	}

	return &FacturationMensuelleResponse{
		Mois:               req.Mois,
		NomMois:            nomsMois[req.Mois],
		Annee:              req.Annee,
		NbClients:          len(clientsFacturation),
		NbPrestations:      nbPrestationsTotal,
		TotalGeneralHT:     totalGeneralHT,
		TotalGeneralTTC:    totalGeneralTTC,
		ClientsFacturation: clientsFacturation,
	}, nil
}

// getFloat64Value retourne la valeur d'un pointeur float64 ou 0 si nil
func getFloat64Value(ptr *float64) float64 {
	if ptr == nil {
		return 0
	}
	return *ptr
}
