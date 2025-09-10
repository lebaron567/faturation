import jsPDF from "jspdf";
import { getClientDisplayName } from '../utils/clientUtils';

/**
 * Générateur PDF simplifié pour tester
 */
export const SimplePDFGenerator = {
  generateTestPDF: async (devis, download = false) => {
    try {
      console.log("🧪 Test PDF - Données reçues:", devis);

      // Créer un PDF de test très simple
      const pdf = new jsPDF();

      pdf.setFontSize(20);
      pdf.text("TEST PDF GENERATOR", 20, 30);

      pdf.setFontSize(12);
      pdf.text("Ceci est un test de génération PDF", 20, 50);

      if (devis) {
        pdf.text(`Devis ID: ${devis.id || 'Non défini'}`, 20, 70);
        if (devis.client) {
          pdf.text(`Client: ${getClientDisplayName(devis.client) || 'Non défini'}`, 20, 90);
        }
        if (devis.entreprise) {
          pdf.text(`Entreprise: ${devis.entreprise.nom || 'Non défini'}`, 20, 110);
        }
      }

      // Générer le PDF
      const blob = pdf.output('blob');
      console.log("🧪 Blob généré, taille:", blob.size);

      if (blob.size === 0) {
        throw new Error("Le PDF généré est vide");
      }

      const url = URL.createObjectURL(blob);
      console.log("🧪 URL créée:", url);

      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test-devis.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.location.href = url;
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        } else {
          // Si le popup est bloqué, utiliser une approche alternative
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      }

      return true;
    } catch (error) {
      console.error("❌ Erreur test PDF:", error);
      alert(`❌ Erreur test PDF: ${error.message}`);
      return false;
    }
  }
};

export default SimplePDFGenerator;
