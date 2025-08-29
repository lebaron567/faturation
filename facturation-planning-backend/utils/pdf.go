package utils

import (
	"bytes"
	"fmt"
	"html/template"
	"os"

	"facturation-planning/models"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"
)

// GenerateInvoicePDF génère un fichier PDF à partir d'un template HTML
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

	// Si c'est pour Live Server, retourne juste le chemin HTML
	if !useFilePath {
		return tempHTMLFile, nil
	}

	// Création du PDF
	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		fmt.Println("❌ Erreur lors de la création du générateur PDF :", err)
		return "", fmt.Errorf("Erreur lors de la création du générateur PDF : %v", err)
	}

	pdfg.AddPage(wkhtmltopdf.NewPage(tempHTMLFile))
	fmt.Println("🔍 Conversion en PDF en cours...")

	err = pdfg.Create()
	if err != nil {
		fmt.Println("❌ Erreur lors de la création du PDF :", err)
		return "", fmt.Errorf("Erreur lors de la création du PDF : %v", err)
	}

	// Vérifier si le dossier "factures" existe
	factureDir := "factures"
	if _, err := os.Stat(factureDir); os.IsNotExist(err) {
		os.Mkdir(factureDir, 0755)
	}

	// Sauvegarde du PDF
	filePath := fmt.Sprintf("factures/facture_%d.pdf", facture.ID)
	err = pdfg.WriteFile(filePath)
	if err != nil {
		fmt.Println("❌ Erreur lors de la sauvegarde du PDF :", err)
		return "", fmt.Errorf("Erreur lors de la sauvegarde du PDF : %v", err)
	}

	fmt.Println("✅ PDF généré avec succès :", filePath)
	return filePath, nil
}
