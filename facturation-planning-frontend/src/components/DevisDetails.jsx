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

  const statusOptions = [
    { value: "brouillon", label: "Brouillon", color: "#6c757d" },
    { value: "envoyé", label: "Envoyé", color: "#007bff" },
    { value: "accepté", label: "Accepté", color: "#28a745" },
    { value: "refusé", label: "Refusé", color: "#dc3545" },
    { value: "expiré", label: "Expiré", color: "#fd7e14" }
  ];

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        console.log(`📝 Récupération du devis ${id}`);
        const response = await axios.get(`/devis/${id}`);
        console.log("📝 Devis récupéré:", response.data);
        setDevis(response.data);
      } catch (err) {
        console.error("❌ Erreur récupération devis:", err);
        setError("Impossible de charger le devis");
      } finally {
        setLoading(false);
      }
    };

    fetchDevis();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      console.log(`🔄 Changement de statut: ${devis.statut} → ${newStatus}`);
      await axios.patch(`/devis/${id}/statut`, { statut: newStatus });
      setDevis(prev => ({ ...prev, statut: newStatus }));
      alert(`✅ Statut mis à jour vers "${newStatus}"`);
    } catch (err) {
      console.error("❌ Erreur changement statut:", err);
      alert("❌ Erreur lors du changement de statut");
    }
  };

  const generatePDF = async (download = false) => {
    try {
      const endpoint = download ? 'download' : 'pdf';
      console.log(`📄 Génération PDF via API backend pour devis ${id}, endpoint: ${endpoint}`);

      const response = await axios.get(`/devis/${id}/${endpoint}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      console.log(`📄 PDF reçu du backend, taille: ${blob.size} bytes`);

      const url = window.URL.createObjectURL(blob);

      if (download) {
        // Téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `devis_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("📄 PDF téléchargé avec succès");
      } else {
        // Affichage dans un nouvel onglet
        window.open(url, '_blank');
        console.log("📄 PDF ouvert dans un nouvel onglet");
      }

      // Nettoyer l'URL après un délai
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    } catch (err) {
      console.error("❌ Erreur génération PDF:", err);
      console.error("❌ Détails de l'erreur:", err.response?.data || err.message);
      alert(`❌ Erreur lors de la génération du PDF: ${err.response?.status || err.message}`);
    }
  };

  const deleteDevis = async () => {
    if (!window.confirm("❌ Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.")) {
      return;
    }

    try {
      console.log(`🗑️ Suppression du devis ${id}`);
      await axios.delete(`/devis/${id}`);
      alert("🗑️ Devis supprimé avec succès");
      navigate("/gestion-documents");
    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      alert("❌ Erreur lors de la suppression du devis");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price) => {
    return price ? price.toFixed(2) + ' €' : '0.00 €';
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="devis-details-container">
        <p>Chargement du devis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="devis-details-container">
        <div className="error-message">
          <h3>❌ Erreur</h3>
          <p>{error}</p>
          <button onClick={() => navigate("/gestion-documents")}>
            ← Retour aux documents
          </button>
        </div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="devis-details-container">
        <p>Devis introuvable</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(devis.statut || 'brouillon');

  return (
    <div className="devis-details-container">
      {/* En-tête avec actions */}
      <div className="devis-header">
        <div className="header-left">
          <button onClick={() => navigate("/gestion-documents")} className="back-button">
            ← Retour
          </button>
          <div>
            <h2>📝 Devis #{devis.id}</h2>
            <p className="devis-subtitle">{devis.objet || "Sans objet"}</p>
          </div>
        </div>

        <div className="header-actions">
          <select
            value={devis.statut || 'brouillon'}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: statusInfo.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              marginRight: '1rem'
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value} style={{ backgroundColor: 'white', color: 'black' }}>
                {option.label}
              </option>
            ))}
          </select>

          <button onClick={() => generatePDF(false)} className="action-button primary">
            👁️ Voir PDF
          </button>
          <button onClick={() => generatePDF(true)} className="action-button success">
            ⬇️ Télécharger PDF
          </button>
          <button onClick={deleteDevis} className="action-button danger">
            🗑️ Supprimer
          </button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="devis-content">
        <div className="info-grid">
          {/* Informations du devis */}
          <div className="info-section">
            <h3>📄 Informations du devis</h3>
            <div className="info-row">
              <span className="label">Référence:</span>
              <span className="value">DEVIS-{String(devis.id).padStart(4, '0')}</span>
            </div>
            <div className="info-row">
              <span className="label">Date de création:</span>
              <span className="value">{formatDate(devis.date_devis)}</span>
            </div>
            <div className="info-row">
              <span className="label">Date d'expiration:</span>
              <span className="value">{formatDate(devis.date_expiration)}</span>
            </div>
            <div className="info-row">
              <span className="label">Statut:</span>
              <span
                className="value status-badge"
                style={{
                  backgroundColor: statusInfo.color,
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Informations client */}
          <div className="info-section">
            <h3>👤 Client</h3>
            {devis.client ? (
              <>
                <div className="info-row">
                  <span className="label">Nom:</span>
                  <span className="value">{devis.client.nom}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{devis.client.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Téléphone:</span>
                  <span className="value">{devis.client.telephone || "Non renseigné"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Adresse:</span>
                  <span className="value">{devis.client.adresse || "Non renseignée"}</span>
                </div>
              </>
            ) : (
              <p>Informations client non disponibles</p>
            )}
          </div>

          {/* Informations entreprise */}
          <div className="info-section">
            <h3>🏢 Entreprise</h3>
            {devis.entreprise ? (
              <>
                <div className="info-row">
                  <span className="label">Nom:</span>
                  <span className="value">{devis.entreprise.nom}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{devis.entreprise.email || "Non renseigné"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Téléphone:</span>
                  <span className="value">{devis.entreprise.telephone || "Non renseigné"}</span>
                </div>
              </>
            ) : (
              <p>Informations entreprise non disponibles</p>
            )}
          </div>

          {/* Totaux */}
          <div className="info-section">
            <h3>💰 Totaux</h3>
            <div className="info-row">
              <span className="label">Sous-total HT:</span>
              <span className="value">{formatPrice(devis.sous_total_ht || devis.SousTotalHT)}</span>
            </div>
            <div className="info-row">
              <span className="label">Total TVA:</span>
              <span className="value">{formatPrice(devis.total_tva || devis.TotalTVA)}</span>
            </div>
            <div className="info-row total-row">
              <span className="label">Total TTC:</span>
              <span className="value total-value">{formatPrice(devis.total_ttc || devis.TotalTTC)}</span>
            </div>
          </div>
        </div>

        {/* Lignes du devis */}
        {devis.Lignes && devis.Lignes.length > 0 && (
          <div className="lignes-section">
            <h3>📋 Lignes du devis</h3>
            <div className="table-container">
              <table className="lignes-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>TVA</th>
                    <th>Total HT</th>
                    <th>Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.Lignes.map((ligne, index) => {
                    const totalHT = ligne.quantite * ligne.prix_unitaire;
                    const totalTTC = totalHT * (1 + ligne.tva / 100);
                    return (
                      <tr key={index}>
                        <td>{ligne.description}</td>
                        <td>{ligne.quantite}</td>
                        <td>{formatPrice(ligne.prix_unitaire)}</td>
                        <td>{ligne.tva}%</td>
                        <td>{formatPrice(totalHT)}</td>
                        <td>{formatPrice(totalTTC)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conditions */}
        {devis.conditions && (
          <div className="conditions-section">
            <h3>📜 Conditions</h3>
            <div className="conditions-content">
              {devis.conditions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevisDetails;
