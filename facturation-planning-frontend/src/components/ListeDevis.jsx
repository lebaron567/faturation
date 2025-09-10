import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { getClientDisplayName } from "../utils/clientUtils";
import "../styles/ListeDevis.css";

const ListeDevis = () => {
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        setLoading(true);
        console.log("🔍 Tentative de récupération des devis...");

        // Vérifier que le token est valide avant la requête
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("❌ Aucun token trouvé");
          alert("Veuillez vous reconnecter");
          return;
        }

        const response = await axios.get("/devis");
        console.log("✅ Devis récupérés avec succès:", response.data);
        setDevisList(response.data);
      } catch (err) {
        console.error("❌ Erreur détaillée:", err);
        console.error("❌ Response data:", err.response?.data);
        console.error("❌ Status:", err.response?.status);
        alert(`❌ Impossible de récupérer les devis: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDevis();
  }, []);

  const handleStatusChange = async (devisId, newStatus) => {
    try {
      await axios.patch(`/devis/${devisId}/statut`, { statut: newStatus });
      setDevisList(prev =>
        prev.map(devis =>
          devis.id === devisId ? { ...devis, statut: newStatus } : devis
        )
      );
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors du changement de statut");
    }
  };

  const handleDelete = async (devisId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
      try {
        await axios.delete(`/devis/${devisId}`);
        setDevisList(prev => prev.filter(devis => devis.id !== devisId));
      } catch (err) {
        console.error(err);
        alert("❌ Erreur lors de la suppression");
      }
    }
  };

  const downloadPDF = async (devisId) => {
    try {
      const response = await axios.get(`/devis/${devisId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis_${devisId}.pdf`);
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

  const filteredDevis = devisList.filter(devis => {
    if (filter === "all") return true;
    return devis.statut === filter;
  });

  return (
    <div className="liste-devis">
      <h2>📄 Liste des devis</h2>

      <div className="filters">
        <label>Filtrer par statut :</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tous</option>
          <option value="brouillon">Brouillon</option>
          <option value="envoyé">Envoyé</option>
          <option value="accepté">Accepté</option>
          <option value="refusé">Refusé</option>
          <option value="expiré">Expiré</option>
        </select>
      </div>

      {loading ? (
        <p>Chargement des devis...</p>
      ) : filteredDevis.length === 0 ? (
        <p>Aucun devis trouvé.</p>
      ) : (
        <ul className="devis-cards">
          {filteredDevis.map((devis) => (
            <li key={devis.id} className="devis-card">
              <div className="devis-header">
                <h3>{devis.objet || "Devis sans objet"}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(devis.statut) }}
                >
                  {devis.statut || 'brouillon'}
                </span>
              </div>

              <div className="devis-info">
                <p><strong>Client :</strong> {getClientDisplayName(devis.Client) || devis.client_nom || "Client inconnu"}</p>
                <p><strong>Date :</strong> {new Date(devis.date_devis).toLocaleDateString()}</p>
                <p><strong>Date d'expiration :</strong> {new Date(devis.date_expiration).toLocaleDateString()}</p>
                <p><strong>Lignes :</strong> {devis.lignes?.length || 0}</p>
              </div>

              <div className="devis-totals">
                <p><strong>Total HT :</strong> {devis.total_ht?.toFixed(2) || "0.00"} €</p>
                <p><strong>Total TVA :</strong> {devis.total_tva?.toFixed(2) || "0.00"} €</p>
                <p><strong>Total TTC :</strong> {devis.total_ttc?.toFixed(2) || "0.00"} €</p>
              </div>

              <div className="devis-actions">
                <Link
                  to={`/devis/${devis.id}`}
                  className="action-btn view-btn"
                >
                  👁️ Voir
                </Link>

                <select
                  value={devis.statut || 'brouillon'}
                  onChange={(e) => handleStatusChange(devis.id, e.target.value)}
                  className="status-select"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="envoyé">Envoyé</option>
                  <option value="accepté">Accepté</option>
                  <option value="refusé">Refusé</option>
                  <option value="expiré">Expiré</option>
                </select>

                <button
                  onClick={() => downloadPDF(devis.id)}
                  className="action-btn download-btn"
                >
                  📥 PDF
                </button>

                <button
                  onClick={() => handleDelete(devis.id)}
                  className="action-btn delete-btn"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListeDevis;
