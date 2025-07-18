import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../axiosInstance";
import "../styles/FactureDetails.css";

const FactureDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [facture, setFacture] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFacture();
    }, [id]);

    const fetchFacture = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/factures/${id}`);
            setFacture(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement de la facture:", err);
            alert("Erreur lors du chargement de la facture");
            navigate("/factures");
        } finally {
            setLoading(false);
        }
    };

    const updateStatut = async (nouveauStatut) => {
        try {
            await axios.patch(`/factures/${id}/statut`, { statut: nouveauStatut });
            setFacture(prev => ({ ...prev, statut: nouveauStatut }));
            alert(`✅ Statut mis à jour vers "${nouveauStatut}"`);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du statut:", err);
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const downloadPDF = async () => {
        try {
            // Essayer d'abord l'endpoint principal
            let response;
            try {
                response = await axios.get(`/factures/${id}/pdf`, {
                    responseType: 'blob'
                });
            } catch (err) {
                // Si l'endpoint principal échoue, essayer l'endpoint de téléchargement
                console.log("Tentative avec l'endpoint de téléchargement...");
                response = await axios.get(`/api/factures/${id}/download`, {
                    responseType: 'blob'
                });
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facture_${facture.numero || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erreur lors du téléchargement:", err);
            alert("Erreur lors du téléchargement du PDF");
        }
    };

    const deleteFacture = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
            return;
        }

        try {
            await axios.delete(`/factures/${id}`);
            alert("✅ Facture supprimée avec succès");
            navigate("/factures");
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            alert("Erreur lors de la suppression de la facture");
        }
    };

    const getStatusInfo = (statut) => {
        const statusConfig = {
            en_attente: {
                label: "En attente",
                class: "status-pending",
                icon: "⏳",
                description: "La facture est en attente de paiement"
            },
            payee: {
                label: "Payée",
                class: "status-paid",
                icon: "✅",
                description: "La facture a été payée"
            },
            rejetee: {
                label: "Rejetée",
                class: "status-rejected",
                icon: "❌",
                description: "La facture a été rejetée"
            }
        };

        return statusConfig[statut] || {
            label: statut,
            class: "status-unknown",
            icon: "❓",
            description: "Statut inconnu"
        };
    };

    const getTypeInfo = (type) => {
        const typeConfig = {
            classique: {
                label: "Facture Classique",
                class: "type-classic",
                icon: "🧾",
                description: "Facture standard pour prestations"
            },
            acompte: {
                label: "Facture d'Acompte",
                class: "type-advance",
                icon: "💰",
                description: "Facture pour demande d'acompte"
            }
        };

        return typeConfig[type] || {
            label: type,
            class: "type-unknown",
            icon: "📄",
            description: "Type de facture"
        };
    };

    if (loading) {
        return <div className="loading">Chargement de la facture...</div>;
    }

    if (!facture) {
        return <div className="error">Facture non trouvée</div>;
    }

    const statusInfo = getStatusInfo(facture.statut);
    const typeInfo = getTypeInfo(facture.type);

    return (
        <div className="facture-details">
            <div className="details-header">
                <div className="header-left">
                    <button
                        onClick={() => navigate("/factures")}
                        className="btn btn-light back-btn"
                    >
                        ← Retour aux factures
                    </button>
                    <h2>Facture #{facture.numero || facture.id}</h2>
                </div>

                <div className="header-actions">
                    <button onClick={downloadPDF} className="btn btn-primary">
                        📄 Télécharger PDF
                    </button>
                    <Link to={`/factures/${id}/edit`} className="btn btn-secondary">
                        ✏️ Modifier
                    </Link>
                    <button onClick={deleteFacture} className="btn btn-danger">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>

            <div className="details-content">
                <div className="details-grid">
                    {/* Informations principales */}
                    <div className="info-card main-info">
                        <h3>Informations générales</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Type:</span>
                                <span className={`badge ${typeInfo.class}`}>
                                    {typeInfo.icon} {typeInfo.label}
                                </span>
                            </div>

                            <div className="info-item">
                                <span className="label">Statut:</span>
                                <span className={`badge ${statusInfo.class}`}>
                                    {statusInfo.icon} {statusInfo.label}
                                </span>
                            </div>

                            <div className="info-item">
                                <span className="label">Client:</span>
                                <span className="value">{facture.client_nom}</span>
                            </div>

                            <div className="info-item">
                                <span className="label">Date d'émission:</span>
                                <span className="value">
                                    📅 {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                                </span>
                            </div>

                            {facture.date_echeance && (
                                <div className="info-item">
                                    <span className="label">Date d'échéance:</span>
                                    <span className="value">
                                        📅 {new Date(facture.date_echeance).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Montants */}
                    <div className="info-card amounts-info">
                        <h3>Montants</h3>
                        <div className="amounts-grid">
                            <div className="amount-item">
                                <span className="amount-label">Montant HT</span>
                                <span className="amount-value">{facture.montant_ht?.toFixed(2)} €</span>
                            </div>

                            <div className="amount-item">
                                <span className="amount-label">TVA ({facture.tva}%)</span>
                                <span className="amount-value">
                                    {((facture.montant_ttc || 0) - (facture.montant_ht || 0)).toFixed(2)} €
                                </span>
                            </div>

                            <div className="amount-item total">
                                <span className="amount-label">Montant TTC</span>
                                <span className="amount-value">{facture.montant_ttc?.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="info-card description-card">
                    <h3>Description</h3>
                    <div className="description-content">
                        {facture.description}
                    </div>
                </div>

                {/* Actions de statut */}
                {facture.statut === 'en_attente' && (
                    <div className="info-card status-actions">
                        <h3>Actions</h3>
                        <div className="status-buttons">
                            <button
                                onClick={() => updateStatut('payee')}
                                className="btn btn-success"
                            >
                                ✅ Marquer comme payée
                            </button>
                            <button
                                onClick={() => updateStatut('rejetee')}
                                className="btn btn-danger"
                            >
                                ❌ Marquer comme rejetée
                            </button>
                        </div>
                    </div>
                )}

                {/* Informations système */}
                <div className="info-card system-info">
                    <h3>Informations système</h3>
                    <div className="system-grid">
                        <div className="system-item">
                            <span className="label">ID:</span>
                            <span className="value">{facture.id}</span>
                        </div>

                        <div className="system-item">
                            <span className="label">Entreprise ID:</span>
                            <span className="value">{facture.entreprise_id}</span>
                        </div>

                        {facture.created_at && (
                            <div className="system-item">
                                <span className="label">Créée le:</span>
                                <span className="value">
                                    {new Date(facture.created_at).toLocaleString('fr-FR')}
                                </span>
                            </div>
                        )}

                        {facture.updated_at && (
                            <div className="system-item">
                                <span className="label">Modifiée le:</span>
                                <span className="value">
                                    {new Date(facture.updated_at).toLocaleString('fr-FR')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FactureDetails;
