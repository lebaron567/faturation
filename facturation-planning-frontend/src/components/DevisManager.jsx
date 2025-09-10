import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { getClientSelectLabel } from "../utils/clientUtils";

const DevisManager = () => {
    const [devisList, setDevisList] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedStatut, setSelectedStatut] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const statusOptions = [
        { value: "", label: "Tous les statuts" },
        { value: "brouillon", label: "Brouillon" },
        { value: "envoyé", label: "Envoyé" },
        { value: "accepté", label: "Accepté" },
        { value: "refusé", label: "Refusé" },
        { value: "expiré", label: "Expiré" }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [devisResponse, clientsResponse] = await Promise.all([
                axios.get("/devis"),
                axios.get("/clients")
            ]);

            console.log("📝 Devis récupérés:", devisResponse.data);
            console.log("� Structure du premier devis:", devisResponse.data[0]);
            console.log("�👥 Clients récupérés:", clientsResponse.data);

            setDevisList(devisResponse.data || []);
            setClients(clientsResponse.data || []);
        } catch (err) {
            console.error("❌ Erreur lors du chargement des données:", err);
            alert("Erreur lors du chargement des devis");
        } finally {
            setLoading(false);
        }
    };

    const updateDevisStatut = async (devisId, newStatut) => {
        try {
            console.log(`🔄 Mise à jour statut devis ${devisId} → ${newStatut}`);
            await axios.patch(`/devis/${devisId}/statut`, { statut: newStatut });

            // Mettre à jour la liste locale
            setDevisList(prev => prev.map(devis =>
                devis.id === devisId ? { ...devis, statut: newStatut } : devis
            ));

            alert(`✅ Statut mis à jour vers "${newStatut}"`);
        } catch (err) {
            console.error("❌ Erreur mise à jour statut:", err);
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const deleteDevis = async (devisId) => {
        if (!window.confirm("❌ Êtes-vous sûr de vouloir supprimer ce devis ?")) {
            return;
        }

        try {
            await axios.delete(`/devis/${devisId}`);
            setDevisList(prev => prev.filter(devis => devis.id !== devisId));
            alert("🗑️ Devis supprimé avec succès");
        } catch (err) {
            console.error("❌ Erreur suppression:", err);
            alert("Erreur lors de la suppression");
        }
    };

    const generatePDF = async (devisId, download = false) => {
        if (!devisId || devisId === 'undefined') {
            console.error("❌ ID devis invalide:", devisId);
            alert("❌ Erreur: ID du devis invalide");
            return;
        }

        try {
            const endpoint = download ? `download` : `pdf`;
            console.log(`📄 Génération PDF via API backend pour devis ${devisId}, endpoint: ${endpoint}`);

            const response = await axios.get(`/devis/${devisId}/${endpoint}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            console.log(`📄 PDF reçu du backend, taille: ${blob.size} bytes`);

            const url = window.URL.createObjectURL(blob);

            if (download) {
                // Téléchargement
                const link = document.createElement('a');
                link.href = url;
                link.download = `devis_${devisId}.pdf`;
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

    // Filtrage des devis
    const filteredDevis = devisList.filter(devis => {
        const matchesSearch = searchTerm === "" ||
            devis.objet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            devis.Client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            devis.ID.toString().includes(searchTerm);

        const matchesClient = selectedClient === "" || devis.client_id?.toString() === selectedClient;
        const matchesStatut = selectedStatut === "" || devis.statut === selectedStatut;

        return matchesSearch && matchesClient && matchesStatut;
    });

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatPrice = (price) => {
        return price ? price.toFixed(2) + ' €' : '0.00 €';
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement des devis...</div>;
    }

    return (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>📝 Gestion des Devis</h2>
                <Link
                    to="/devis"
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "6px"
                    }}
                >
                    ➕ Nouveau Devis
                </Link>
            </div>

            {/* Filtres */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        🔍 Recherche
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par objet, client ou numéro..."
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        👥 Client
                    </label>
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">Tous les clients</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {getClientSelectLabel(client)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        📊 Statut
                    </label>
                    <select
                        value={selectedStatut}
                        onChange={(e) => setSelectedStatut(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Statistiques */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Total Devis</h4>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{filteredDevis.length}</p>
                </div>
                <div style={{ backgroundColor: '#e8f5e8', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Acceptés</h4>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {filteredDevis.filter(d => d.statut === 'accepté').length}
                    </p>
                </div>
                <div style={{ backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>En attente</h4>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {filteredDevis.filter(d => d.statut === 'envoyé').length}
                    </p>
                </div>
                <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Brouillons</h4>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {filteredDevis.filter(d => d.statut === 'brouillon' || !d.statut).length}
                    </p>
                </div>
            </div>

            {/* Liste des devis */}
            {filteredDevis.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>Aucun devis trouvé avec ces critères</p>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>N°</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Objet</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Client</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Date</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Statut</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e9ecef' }}>Total TTC</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDevis.map((devis) => (
                                    <tr key={devis.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                        <td style={{ padding: '1rem' }}>#{devis.id}</td>
                                        <td style={{ padding: '1rem' }}>{devis.objet || "Sans objet"}</td>
                                        <td style={{ padding: '1rem' }}>{devis.Client?.nom || "Client inconnu"}</td>
                                        <td style={{ padding: '1rem' }}>{formatDate(devis.date_devis)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={devis.statut || 'brouillon'}
                                                onChange={(e) => updateDevisStatut(devis.id, e.target.value)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd',
                                                    backgroundColor: getStatusColor(devis.statut || 'brouillon'),
                                                    color: 'white',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {statusOptions.slice(1).map(option => (
                                                    <option key={option.value} value={option.value} style={{ backgroundColor: 'white', color: 'black' }}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                            {formatPrice(devis.total_ttc)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                {devis.id ? (
                                                    <Link
                                                        to={`/devis/${devis.id}`}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#007bff',
                                                            color: 'white',
                                                            textDecoration: 'none',
                                                            borderRadius: '3px',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        👁️ Voir
                                                    </Link>
                                                ) : (
                                                    <span
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#6c757d',
                                                            color: 'white',
                                                            textDecoration: 'none',
                                                            borderRadius: '3px',
                                                            fontSize: '0.8rem'
                                                        }}
                                                        title="ID manquant"
                                                    >
                                                        👁️ Voir
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => devis.id && generatePDF(devis.id, false)}
                                                    disabled={!devis.id}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: devis.id ? '#28a745' : '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        fontSize: '0.8rem',
                                                        cursor: devis.id ? 'pointer' : 'not-allowed'
                                                    }}
                                                    title={devis.id ? 'Voir le PDF' : 'ID manquant'}
                                                >
                                                    📄 PDF
                                                </button>
                                                <button
                                                    onClick={() => devis.id && generatePDF(devis.id, true)}
                                                    disabled={!devis.id}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: devis.id ? '#17a2b8' : '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        fontSize: '0.8rem',
                                                        cursor: devis.id ? 'pointer' : 'not-allowed'
                                                    }}
                                                    title={devis.id ? 'Télécharger le PDF' : 'ID manquant'}
                                                >
                                                    ⬇️ DL
                                                </button>
                                                <button
                                                    onClick={() => deleteDevis(devis.id)}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevisManager;
