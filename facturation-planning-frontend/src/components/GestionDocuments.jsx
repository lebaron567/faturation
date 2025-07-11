import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";

const GestionDocuments = () => {
  const [devisList, setDevisList] = useState([]);
  const [facturesList, setFacturesList] = useState([]);
  const [activeTab, setActiveTab] = useState("devis");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const [devisResponse, facturesResponse] = await Promise.all([
          axios.get("/devis"),
          axios.get("/factures")
        ]);
        setDevisList(devisResponse.data);
        setFacturesList(facturesResponse.data);
      } catch (err) {
        console.error("Erreur lors du chargement des documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

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

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <h2>📋 Gestion des Documents</h2>

      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/devis"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            marginRight: "1rem"
          }}
        >
          ➕ Nouveau Devis
        </Link>
        <Link
          to="/factures"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px"
          }}
        >
          ➕ Nouvelle Facture
        </Link>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("devis")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: activeTab === "devis" ? "#007bff" : "#e9ecef",
            color: activeTab === "devis" ? "white" : "#495057",
            border: "none",
            borderRadius: "6px",
            marginRight: "1rem",
            cursor: "pointer"
          }}
        >
          📝 Devis ({devisList.length})
        </button>
        <button
          onClick={() => setActiveTab("factures")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: activeTab === "factures" ? "#007bff" : "#e9ecef",
            color: activeTab === "factures" ? "white" : "#495057",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          📄 Factures ({facturesList.length})
        </button>
      </div>

      {loading ? (
        <p>Chargement des documents...</p>
      ) : (
        <div>
          {activeTab === "devis" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Devis récents</h3>
                <div>
                  <Link
                    to="/devis/manager"
                    style={{
                      color: "#007bff",
                      textDecoration: "none",
                      marginRight: "1rem"
                    }}
                  >
                    🔧 Gestionnaire complet →
                  </Link>
                  <Link
                    to="/devis/liste"
                    style={{
                      color: "#007bff",
                      textDecoration: "none"
                    }}
                  >
                    Voir tous les devis →
                  </Link>
                </div>
              </div>

              {devisList.length === 0 ? (
                <p>Aucun devis trouvé.</p>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem"
                }}>
                  {devisList.slice(0, 6).map((devis) => (
                    <div key={devis.ID} style={{
                      backgroundColor: "#f8f9fa",
                      padding: "1.5rem",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h4 style={{ margin: 0 }}>{devis.objet || "Devis sans objet"}</h4>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "12px",
                            backgroundColor: getStatusColor(devis.statut),
                            color: "white",
                            fontSize: "0.8rem",
                            fontWeight: "bold"
                          }}
                        >
                          {devis.statut || 'brouillon'}
                        </span>
                      </div>
                      <p><strong>Client:</strong> {devis.Client?.nom || devis.client_nom}</p>
                      <p><strong>Date:</strong> {new Date(devis.date_devis).toLocaleDateString()}</p>
                      <p><strong>Total TTC:</strong> {devis.total_ttc?.toFixed(2) || "0.00"} €</p>

                      <div style={{ marginTop: "1rem" }}>
                        <Link
                          to={`/devis/${devis.ID}`}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "0.9rem"
                          }}
                        >
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "factures" && (
            <div>
              <h3>Factures récentes</h3>
              {facturesList.length === 0 ? (
                <p>Aucune facture trouvée.</p>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem"
                }}>
                  {facturesList.slice(0, 6).map((facture) => (
                    <div key={facture.ID} style={{
                      backgroundColor: "#f8f9fa",
                      padding: "1.5rem",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef"
                    }}>
                      <h4 style={{ margin: "0 0 1rem 0" }}>Facture #{facture.ID}</h4>
                      <p><strong>Client:</strong> {facture.clientNom}</p>
                      <p><strong>Description:</strong> {facture.description}</p>
                      <p><strong>Total TTC:</strong> {(facture.montantHT * (1 + facture.tva / 100)).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GestionDocuments;
