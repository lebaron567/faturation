package utils

import (
	"facturation-planning/models"
	"fmt"

	"github.com/jung-kurt/gofpdf"
)

// Générer une facture PDF
func GenerateInvoicePDF(facture models.Facture) (string, error) {
	fileName := fmt.Sprintf("facture_%d.pdf", facture.ID)

	// Création du PDF
	pdf := gofpdf.New("P", "mm", "A4", "")

	// Ajouter une page
	pdf.AddPage()

	// Police
	pdf.SetFont("Arial", "B", 16)

	// En-tête de la facture
	pdf.Cell(40, 10, "Facture")
	pdf.Ln(10)

	// Détails de l'entreprise
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Entreprise: %d", facture.EntrepriseID))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Montant HT: %.2f EUR", facture.MontantHT))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Montant TTC: %.2f EUR", facture.MontantTTC))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Statut: %s", facture.Statut))
	pdf.Ln(10)

	// Sauvegarde du fichier PDF
	err := pdf.OutputFileAndClose(fileName)
	if err != nil {
		return "", err
	}

	return fileName, nil
}
