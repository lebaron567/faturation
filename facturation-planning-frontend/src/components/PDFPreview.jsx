import React, { useState, useEffect } from 'react';
import '../styles/PDFPreview.css';

const PDFPreview = ({ data, type = 'devis' }) => {
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (data) {
      setPreviewData(data);
    }
  }, [data]);

  if (!previewData) {
    return (
      <div className="pdf-preview-container">
        <div className="pdf-preview-placeholder">
          <div className="preview-icon">📄</div>
          <p>L'aperçu apparaîtra ici une fois le formulaire rempli</p>
        </div>
      </div>
    );
  }

  const calculateTotals = () => {
    if (!previewData.lignes || previewData.lignes.length === 0) return { ht: 0, tva: 0, ttc: 0 };

    const totalHT = previewData.lignes.reduce((sum, ligne) => {
      return sum + (parseFloat(ligne.quantite || 0) * parseFloat(ligne.prix_unitaire || 0));
    }, 0);

    const totalTVA = previewData.lignes.reduce((sum, ligne) => {
      const ligneHT = parseFloat(ligne.quantite || 0) * parseFloat(ligne.prix_unitaire || 0);
      return sum + (ligneHT * (parseFloat(ligne.tva || 0) / 100));
    }, 0);

    return {
      ht: totalHT,
      tva: totalTVA,
      ttc: totalHT + totalTVA
    };
  };

  const totals = calculateTotals();

  return (
    <div className="pdf-preview-container">
      <div className="pdf-preview-header">
        <h3>📄 Aperçu {type === 'devis' ? 'du devis' : 'de la facture'}</h3>
        <div className="preview-actions">
          <button className="btn-preview-action" title="Agrandir l'aperçu">
            🔍
          </button>
          <button className="btn-preview-action" title="Actualiser l'aperçu">
            🔄
          </button>
        </div>
      </div>

      <div className="pdf-preview-content">
        <div className="document-header">
          <div className="company-info">
            <h2 className="company-name">Votre Entreprise</h2>
            <p className="company-address">
              123 Rue de l'Exemple<br />
              75000 Paris<br />
              Tel: 01 23 45 67 89
            </p>
          </div>
          <div className="document-info">
            <h1 className="document-title">
              {type === 'devis' ? 'DEVIS' : 'FACTURE'}
            </h1>
            <div className="document-number">
              N° {type === 'devis' ? 'DEV' : 'FAC'}-{new Date().getFullYear()}-001
            </div>
            <div className="document-date">
              Date: {previewData.date_devis || previewData.date_facture || new Date().toLocaleDateString('fr-FR')}
            </div>
            {type === 'devis' && previewData.date_expiration && (
              <div className="expiration-date">
                Valide jusqu'au: {new Date(previewData.date_expiration).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        <div className="client-info">
          <h3>Facturer à:</h3>
          <div className="client-details">
            {previewData.client_nom || 'Nom du client'}
            {previewData.client_adresse && (
              <>
                <br />{previewData.client_adresse}
              </>
            )}
            {previewData.client_email && (
              <>
                <br />Email: {previewData.client_email}
              </>
            )}
          </div>
        </div>

        {previewData.objet && (
          <div className="document-object">
            <h3>Objet:</h3>
            <p>{previewData.objet}</p>
          </div>
        )}

        <div className="items-table">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>TVA</th>
                <th>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {previewData.lignes && previewData.lignes.length > 0 ? (
                previewData.lignes.map((ligne, index) => (
                  <tr key={index}>
                    <td>{ligne.description || '---'}</td>
                    <td>{ligne.quantite || 0}</td>
                    <td>{parseFloat(ligne.prix_unitaire || 0).toFixed(2)} €</td>
                    <td>{ligne.tva || 0}%</td>
                    <td>{(parseFloat(ligne.quantite || 0) * parseFloat(ligne.prix_unitaire || 0)).toFixed(2)} €</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-items">Aucune ligne ajoutée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="totals-section">
          <div className="totals-table">
            <div className="total-row">
              <span className="total-label">Total HT:</span>
              <span className="total-value">{totals.ht.toFixed(2)} €</span>
            </div>
            <div className="total-row">
              <span className="total-label">Total TVA:</span>
              <span className="total-value">{totals.tva.toFixed(2)} €</span>
            </div>
            <div className="total-row total-ttc">
              <span className="total-label">Total TTC:</span>
              <span className="total-value">{totals.ttc.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {previewData.conditions && (
          <div className="conditions-section">
            <h3>Conditions:</h3>
            <p>{previewData.conditions}</p>
          </div>
        )}

        <div className="document-footer">
          <p>
            {type === 'devis'
              ? 'Ce devis est valable 30 jours à compter de la date d\'émission.'
              : 'Facture payable sous 30 jours.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
