import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import "../styles/FactureManager.css";

const FactureManager = () => {
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [filters, setFilters] = useState({
        type: "",
        statut: "",
        search: "",
        client_id: "",
        date_debut: "",
        date_fin: ""
    });

    const fetchFactures = useCallback(async () => {
        try {
            setLoading(true);
            let endpoint = "/factures";
            let params = {};

            // Si on a un client spécifique sélectionné, utiliser l'endpoint par client
            if (filters.client_id) {
                endpoint = `/api/factures/client/${filters.client_id}`;
            } else if (filters.search.trim()) {
                // Si on a une recherche, utiliser l'endpoint de recherche
                endpoint = "/factures/search";
                params.q = filters.search.trim();
            }

            // Ajouter les autres filtres
            if (filters.type) params.type = filters.type;
            if (filters.statut) params.statut = filters.statut;
            if (filters.date_debut) params.date_debut = filters.date_debut;
            if (filters.date_fin) params.date_fin = filters.date_fin;

            console.log("📤 Recherche factures:", endpoint, params);
            const response = await axios.get(endpoint, { params });
            setFactures(response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des factures:", err);
            setFactures([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchClients();
        fetchFactures();
    }, [fetchFactures]);

    const fetchClients = async () => {
        try {
            const profileResponse = await axios.get("/profile");
            const entrepriseId = profileResponse.data.id;

            const response = await axios.get("/clients");
            const clientsFiltered = response.data.filter(client =>
                client.entreprise_id === entrepriseId
            );
            setClients(clientsFiltered);
        } catch (err) {
            console.error("Erreur lors du chargement des clients:", err);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchFactures();
    };

    const resetFilters = () => {
        setFilters({
            type: "",
            statut: "",
            search: "",
            client_id: "",
            date_debut: "",
            date_fin: ""
        });
        setTimeout(fetchFactures, 100);
    };

    const deleteFacture = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
            return;
        }

        try {
            await axios.delete(`/factures/${id}`);
            fetchFactures(); // Recharger la liste
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            alert("Erreur lors de la suppression de la facture");
        }
    };

    const updateStatut = async (id, nouveauStatut) => {
        try {
            await axios.patch(`/factures/${id}/statut`, { statut: nouveauStatut });
            fetchFactures(); // Recharger la liste
        } catch (err) {
            console.error("Erreur lors de la mise à jour du statut:", err);
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const generatePDF = async (factureId, download = false) => {
        if (!factureId || factureId === 'undefined') {
            console.error("❌ ID facture invalide:", factureId);
            alert("❌ Erreur: ID de la facture invalide");
            return;
        }

        try {
            const endpoint = download ? `download` : `pdf`;
            console.log(`📄 Génération PDF via API backend pour facture ${factureId}, endpoint: ${endpoint}`);

            const response = await axios.get(`/factures/${factureId}/${endpoint}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            console.log(`📄 PDF reçu du backend, taille: ${blob.size} bytes`);

            const url = window.URL.createObjectURL(blob);

            if (download) {
                // Téléchargement
                const link = document.createElement('a');
                link.href = url;
                link.download = `facture_${factureId}.pdf`;
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

    const getStatusBadge = (statut) => {
        const statusConfig = {
            en_attente: { label: "En attente", class: "status-pending" },
            payee: { label: "Payée", class: "status-paid" },
            rejetee: { label: "Rejetée", class: "status-rejected" }
        };

        const config = statusConfig[statut] || { label: statut, class: "status-unknown" };
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    const getTypeBadge = (type) => {
        const typeConfig = {
            classique: { label: "Classique", class: "type-classic" },
            acompte: { label: "Acompte", class: "type-advance" }
        };

        const config = typeConfig[type] || { label: type, class: "type-unknown" };
        return <span className={`type-badge ${config.class}`}>{config.label}</span>;
    };

    return (
        <div className="facture-manager">
            <div className="manager-header">
                <h2>🧾 Gestion des Factures</h2>
                <div className="header-actions">
                    <Link to="/factures/creer" className="btn btn-primary">
                        ➕ Nouvelle Facture
                    </Link>
                </div>
            </div>

            {/* Filtres */}
            <div className="filters-section">
                <div className="filters-grid">
                    <input
                        type="text"
                        name="search"
                        placeholder="🔍 Rechercher (numéro, client...)"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />

                    <select name="client_id" value={filters.client_id} onChange={handleFilterChange}>
                        <option value="">Tous les clients</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.nom}
                            </option>
                        ))}
                    </select>

                    <select name="type" value={filters.type} onChange={handleFilterChange}>
                        <option value="">Tous les types</option>
                        <option value="classique">Classique</option>
                        <option value="acompte">Acompte</option>
                    </select>

                    <select name="statut" value={filters.statut} onChange={handleFilterChange}>
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="payee">Payée</option>
                        <option value="rejetee">Rejetée</option>
                    </select>

                    <input
                        type="date"
                        name="date_debut"
                        value={filters.date_debut}
                        onChange={handleFilterChange}
                        title="Date de début"
                    />

                    <input
                        type="date"
                        name="date_fin"
                        value={filters.date_fin}
                        onChange={handleFilterChange}
                        title="Date de fin"
                    />
                </div>

                <div className="filters-actions">
                    <button onClick={applyFilters} className="btn btn-secondary">
                        🔍 Filtrer
                    </button>
                    <button onClick={resetFilters} className="btn btn-light">
                        🔄 Réinitialiser
                    </button>
                </div>
            </div>

            {/* Liste des factures */}
            {loading ? (
                <div className="loading">Chargement des factures...</div>
            ) : factures.length === 0 ? (
                <div className="empty-state">
                    <h3>Aucune facture trouvée</h3>
                    <p>Commencez par créer votre première facture</p>
                    <Link to="/factures/creer" className="btn btn-primary">
                        ➕ Créer une facture
                    </Link>
                </div>
            ) : (
                <div className="factures-grid">
                    {factures.map((facture) => (
                        <div key={facture.id} className="facture-card">
                            <div className="card-header">
                                <div className="facture-number">#{facture.numero}</div>
                                <div className="badges">
                                    {getTypeBadge(facture.type)}
                                    {getStatusBadge(facture.statut)}
                                </div>
                            </div>

                            <div className="card-content">
                                <h4>{facture.client_nom}</h4>
                                <p className="facture-description">{facture.description}</p>
                                <div className="facture-amounts">
                                    <span className="amount-ht">{facture.montant_ht?.toFixed(2)} € HT</span>
                                    <span className="amount-ttc">{facture.montant_ttc?.toFixed(2)} € TTC</span>
                                </div>
                                <div className="facture-date">
                                    📅 {new Date(facture.date_emission).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="card-actions">
                                <Link to={`/factures/${facture.id}`} className="btn btn-sm btn-secondary">
                                    👁️ Voir
                                </Link>
                                <button
                                    onClick={() => generatePDF(facture.id, false)}
                                    className="btn btn-sm btn-info"
                                    title="Visualiser PDF"
                                >
                                    👁️ PDF
                                </button>
                                <button
                                    onClick={() => generatePDF(facture.id, true)}
                                    className="btn btn-sm btn-primary"
                                    title="Télécharger PDF"
                                >
                                    ⬇️ PDF
                                </button>

                                {facture.statut === 'en_attente' && (
                                    <>
                                        <button
                                            onClick={() => updateStatut(facture.id, 'payee')}
                                            className="btn btn-sm btn-success"
                                        >
                                            ✅ Payée
                                        </button>
                                        <button
                                            onClick={() => updateStatut(facture.id, 'rejetee')}
                                            className="btn btn-sm btn-danger"
                                        >
                                            ❌ Rejetée
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => deleteFacture(facture.id)}
                                    className="btn btn-sm btn-danger"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FactureManager;
