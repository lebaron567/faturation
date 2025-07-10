import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axiosInstance";
import "../styles/DevisDetails.css";

const DevisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const response = await axios.get(`/devis/${id}`);
        setDevis(response.data);
      } catch (err) {
        setError("Impossible de charger le devis");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevis();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`/devis/${id}/statut`, { statut: newStatus });
      setDevis(prev => ({ ...prev, statut: newStatus }));
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors du changement de statut");
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.get(`/devis/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors du téléchargement du PDF");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'brouillon': return '#6c757d';
      case 'envoyé': return '#007bff';
      case 'accepté': return '#28a745';
      case 'refusé': return '#dc3545';
      case 'expiré': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  if (loading) return <div className="loading">Chargement du devis...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!devis) return <div className="error">Devis non trouvé</div>;

  return (
    <div className="devis-details">
      <div className="devis-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Retour
        </button>
        <h1>Devis #{devis.ID}</h1>
        <div className="status-section">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(devis.statut) }}
          >
            {devis.statut || 'brouillon'}
          </span>
          <select
            value={devis.statut || 'brouillon'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-select"
          >
            <option value="brouillon">Brouillon</option>
            <option value="envoyé">Envoyé</option>
            <option value="accepté">Accepté</option>
            <option value="refusé">Refusé</option>
            <option value="expiré">Expiré</option>
          </select>
        </div>
      </div>

      <div className="devis-content">
        <div className="devis-info-section">
          <h2>Informations générales</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Objet:</strong>
              <span>{devis.objet}</span>
            </div>
            <div className="info-item">
              <strong>Client:</strong>
              <span>{devis.Client?.nom || 'Client non trouvé'}</span>
            </div>
            <div className="info-item">
              <strong>Email client:</strong>
              <span>{devis.Client?.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Date de création:</strong>
              <span>{new Date(devis.date_devis).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <strong>Date d'expiration:</strong>
              <span>{new Date(devis.date_expiration).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <strong>Entreprise:</strong>
              <span>{devis.Entreprise?.nom || 'N/A'}</span>
            </div>
          </div>
        </div>

        {devis.conditions && (
          <div className="conditions-section">
            <h2>Conditions</h2>
            <p>{devis.conditions}</p>
          </div>
        )}

        <div className="lignes-section">
          <h2>Détail des prestations</h2>
          <div className="lignes-table">
            <div className="table-header">
              <span>Description</span>
              <span>Quantité</span>
              <span>Prix unitaire HT</span>
              <span>TVA</span>
              <span>Total HT</span>
              <span>Total TTC</span>
            </div>
            {devis.lignes?.map((ligne, index) => (
              <div key={index} className="table-row">
                <span>{ligne.description}</span>
                <span>{ligne.quantite}</span>
                <span>{ligne.prix_unitaire.toFixed(2)} €</span>
                <span>{ligne.tva}%</span>
                <span>{(ligne.prix_unitaire * ligne.quantite).toFixed(2)} €</span>
                <span>{(ligne.prix_unitaire * ligne.quantite * (1 + ligne.tva / 100)).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>

        <div className="totals-section">
          <h2>Récapitulatif</h2>
          <div className="totals-grid">
            <div className="total-row">
              <span>Total HT:</span>
              <span>{devis.total_ht?.toFixed(2) || "0.00"} €</span>
            </div>
            <div className="total-row">
              <span>Total TVA:</span>
              <span>{devis.total_tva?.toFixed(2) || "0.00"} €</span>
            </div>
            <div className="total-row total-ttc">
              <span>Total TTC:</span>
              <span>{devis.total_ttc?.toFixed(2) || "0.00"} €</span>
            </div>
          </div>
        </div>

        <div className="actions-section">
          <button onClick={downloadPDF} className="primary-btn">
            📥 Télécharger PDF
          </button>
          <button
            onClick={() => window.open(`/devis/${id}/pdf`, '_blank')}
            className="secondary-btn"
          >
            👁️ Visualiser PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevisDetails;
