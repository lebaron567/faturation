package utils

import (
	"bytes"
	"fmt"
	"html/template"
	"os"

	"facturation-planning/models"
)

// GenerateInvoicePDF génère un fichier PDF à partir d'un template HTML
// TEMPORAIRE: Retourne le HTML au lieu du PDF car wkhtmltopdf n'est pas disponible
func GenerateInvoicePDF(facture models.Facture, useFilePath bool) (string, error) {
	fmt.Println("🚀 GenerateInvoicePDF appelée pour la facture :", facture.ID)

	// Charger le template HTML
	tmpl, err := template.ParseFiles("templates/facture.html")
	if err != nil {
		return "", fmt.Errorf("Erreur lors du chargement du template : %v", err)
	}

	// Remplir le template avec les données de la facture
	var tplBuffer bytes.Buffer
	err = tmpl.Execute(&tplBuffer, map[string]interface{}{
		"EntrepriseNom":       fmt.Sprintf("%d", facture.EntrepriseID),
		"EntrepriseAdresse":   "123 rue du Code", // Ajoute la vraie valeur depuis la struct
		"EntrepriseEmail":     "contact@maboite.com",
		"EntrepriseTelephone": "+33 6 12 34 56 78",
		"EntrepriseSIRET":     "12345678901234",
		"EntrepriseIBAN":      "FR7612345987650123456789014",
		"EntrepriseBIC":       "BIC12345",
		"ClientNom":           "Client XYZ",
		"Date":                facture.DateEmission,
		"Numero":              facture.Reference,
		"Description":         facture.Description,
		"MontantHT":           fmt.Sprintf("%.2f", facture.SousTotalHT),
		"TVA":                 fmt.Sprintf("%.2f", facture.TotalTVA),
		"MontantTTC":          fmt.Sprintf("%.2f", facture.TotalTTC),
		"UseFilePath":         useFilePath,
	})

	if err != nil {
		return "", fmt.Errorf("Erreur lors de l'exécution du template : %v", err)
	}

	fmt.Println("✅ HTML généré avec succès !")

	// Sauvegarde temporaire du HTML
	tempHTMLFile := "facture_temp.html"
	err = os.WriteFile(tempHTMLFile, tplBuffer.Bytes(), 0644)
	if err != nil {
		return "", fmt.Errorf("Erreur lors de l'écriture du fichier HTML temporaire : %v", err)
	}

	fmt.Printf("✅ Fichier HTML créé: %s\n", tempHTMLFile)
	return tempHTMLFile, nil
}
