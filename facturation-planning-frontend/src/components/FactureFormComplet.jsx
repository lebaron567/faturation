import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axiosInstance";
import "../styles/FactureFormComplet.css";

const FactureFormComplet = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [form, setForm] = useState({
        type: "classique",
        client_id: "",
        client_nom: "",
        description: "",
        date_emission: new Date().toISOString().split('T')[0],
        date_echeance: "",
        montant_ht: "",
        tva: 20,
        statut: "en_attente"
    });

    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [devis, setDevis] = useState([]);

    const fetchFacture = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/factures/${id}`);
            const facture = response.data;

            setForm({
                type: facture.type || "classique",
                client_nom: facture.client_nom || "",
                description: facture.description || "",
                date_emission: facture.date_emission?.split('T')[0] || "",
                date_echeance: facture.date_echeance?.split('T')[0] || "",
                montant_ht: facture.montant_ht || "",
                tva: facture.tva || 20,
                statut: facture.statut || "en_attente"
            });
        } catch (err) {
            console.error("Erreur lors du chargement de la facture:", err);
            alert("Erreur lors du chargement de la facture");
            navigate("/factures");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchClients();
        fetchDevis();
        if (isEdit) {
            fetchFacture();
        }
    }, [id, isEdit, fetchFacture]);

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

    const fetchDevis = async () => {
        try {
            const response = await axios.get("/devis");
            const allDevis = Array.isArray(response.data) ? response.data : [];
            setDevis(allDevis);
        } catch (err) {
            console.error("❌ Erreur récupération devis:", err);
            setDevis([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'client_id') {
            // Trouver le nom du client correspondant
            const selectedClient = clients.find(client => client.id.toString() === value);
            setForm(prev => ({
                ...prev,
                client_id: value,
                client_nom: selectedClient ? selectedClient.nom : ""
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const createFromDevis = async (devisId) => {
        try {
            setLoading(true);

            // Récupérer les détails du devis
            const devisResponse = await axios.get(`/devis/${devisId}`);
            const devisData = devisResponse.data;

            // Préparer les données selon le format exact attendu par le backend Go
            const montantHT = parseFloat(devisData.sous_total_ht || devisData.total_ht || 0);
            const tauxTVA = 20; // TVA par défaut
            const montantTTC = montantHT * (1 + tauxTVA / 100);

            const createData = {
                clientID: parseInt(devisData.client_id),
                typeFacture: "classique",
                dateCreation: new Date().toISOString(),
                dateEcheance: form.date_echeance ? 
                    new Date(form.date_echeance + "T00:00:00.000Z").toISOString() : 
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                sousTotalHT: montantHT,
                totalTTC: montantTTC,
                tauxTVA: tauxTVA,
                lignes: devisData.lignes ? devisData.lignes.map(ligne => {
                    const quantite = parseInt(ligne.quantite) || 1;
                    const prixUnitaire = parseFloat(ligne.prix_unitaire) || 0;
                    const totalLigne = quantite * prixUnitaire;
                    return {
                        description: ligne.description || devisData.objet || "Ligne depuis devis",
                        quantite: quantite,
                        prixUnitaire: prixUnitaire,
                        totalLigne: totalLigne,
                        tauxTVA: parseInt(ligne.tva) || tauxTVA
                    };
                }) : [{
                    description: devisData.objet || "Facture créée depuis devis",
                    quantite: 1,
                    prixUnitaire: montantHT,
                    totalLigne: montantHT,
                    tauxTVA: tauxTVA
                }]
            };

            const response = await axios.post("/factures", createData);
            alert(`✅ Facture créée avec succès depuis le devis ! Référence: ${response.data.Reference || response.data.reference || 'N/A'}`);
            navigate("/factures");
        } catch (err) {
            console.error("❌ Erreur création facture depuis devis:", err);
            alert(`❌ Erreur: ${err.response?.data?.message || err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!form.client_id || !form.description || !form.montant_ht) {
                alert("❌ Veuillez remplir tous les champs obligatoires");
                setLoading(false);
                return;
            }

            // Calcul du montant TTC
            const montantHT = parseFloat(form.montant_ht);
            const tva = parseFloat(form.tva) || 0;
            const montantTTC = montantHT * (1 + tva / 100);

            // Format des données selon le backend Go attendu
            const data = {
                clientID: parseInt(form.client_id),
                typeFacture: form.type,
                dateCreation: new Date(form.date_emission + "T00:00:00.000Z").toISOString(),
                dateEcheance: new Date(form.date_echeance + "T00:00:00.000Z").toISOString(),
                sousTotalHT: montantHT,
                totalTTC: montantTTC,
                tauxTVA: tva,
                lignes: [{
                    description: form.description.trim(),
                    quantite: 1,
                    prixUnitaire: montantHT,
                    totalLigne: montantHT,
                    tauxTVA: tva
                }]
            };

            if (isEdit) {
                await axios.put(`/factures/${id}`, data);
                alert("✅ Facture mise à jour avec succès !");
            } else {
                await axios.post("/factures", data);
                alert("✅ Facture créée avec succès !");
            }

            navigate("/factures");
        } catch (err) {
            console.error("❌ Erreur:", err);
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Erreur inconnue";
            alert("❌ Erreur lors de la " + (isEdit ? "mise à jour" : "création") + " de la facture: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const calculateMontantTTC = () => {
        const montantHT = parseFloat(form.montant_ht) || 0;
        const tva = parseFloat(form.tva) || 0;
        return (montantHT * (1 + tva / 100)).toFixed(2);
    };

    const calculateMontantTVA = () => {
        const montantHT = parseFloat(form.montant_ht) || 0;
        const tva = parseFloat(form.tva) || 0;
        return (montantHT * tva / 100).toFixed(2);
    };

    if (loading && isEdit) {
        return <div className="loading">Chargement de la facture...</div>;
    }

    return (
        <div className="facture-form-complet">
            <div className="form-header">
                <h2>{isEdit ? "Modifier la facture" : "Créer une nouvelle facture"}</h2>
                <div className="header-actions">
                    <button
                        type="button"
                        onClick={() => navigate("/factures")}
                        className="btn btn-light"
                    >
                        ← Retour
                    </button>
                </div>
            </div>

            {/* Section création depuis devis - uniquement en mode création */}
            {!isEdit && devis.length > 0 && (
                <div className="devis-section" style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    borderLeft: '4px solid #28a745'
                }}>
                    <h3 style={{ color: '#28a745', marginBottom: '15px' }}>🚀 Création rapide depuis un devis</h3>
                    <div className="devis-list">
                        {devis.map((d) => (
                            <div key={d.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px',
                                background: 'white',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                marginBottom: '10px'
                            }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                                    <strong style={{ color: '#007bff', minWidth: '120px' }}>
                                        DEVIS-{String(d.id).padStart(4, '0')}
                                    </strong>
                                    <span style={{ color: '#666', flex: 1 }}>{d.client?.nom}</span>
                                    <span style={{ color: '#666' }}>{d.objet}</span>
                                    <strong>{parseFloat(d.total_ttc || 0).toFixed(2)} €</strong>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => createFromDevis(d.id)}
                                    disabled={loading}
                                    className="btn"
                                    style={{
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 15px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📄 Créer Facture
                                </button>
                            </div>
                        ))}
                    </div>
                    <hr style={{ margin: '20px 0', border: '1px solid #ddd' }} />
                    <p style={{ margin: 0, color: '#666', fontStyle: 'italic' }}>
                        Ou créer une facture manuelle ci-dessous
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Type de facture</h3>
                    <div className="type-selection">
                        <label className={`type-option ${form.type === 'classique' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="classique"
                                checked={form.type === 'classique'}
                                onChange={handleChange}
                            />
                            <div className="type-card classique">
                                <div className="type-icon">🧾</div>
                                <div className="type-info">
                                    <h4>Facture Classique</h4>
                                    <p>Facture standard pour vos prestations</p>
                                    <div className="type-preview">Design bleu professionnel</div>
                                </div>
                            </div>
                        </label>

                        <label className={`type-option ${form.type === 'acompte' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="acompte"
                                checked={form.type === 'acompte'}
                                onChange={handleChange}
                            />
                            <div className="type-card acompte">
                                <div className="type-icon">💰</div>
                                <div className="type-info">
                                    <h4>Facture d'Acompte</h4>
                                    <p>Facture pour demande d'acompte</p>
                                    <div className="type-preview">Design orange distinctif</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Informations client</h3>

                    <label>
                        Nom du client *
                        {clients.length > 0 ? (
                            <select
                                name="client_id"
                                value={form.client_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Sélectionner un client --</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.nom} ({client.email})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                name="client_nom"
                                placeholder="Nom du client"
                                value={form.client_nom}
                                onChange={handleChange}
                                required
                            />
                        )}
                    </label>

                    {clients.length === 0 && (
                        <small className="client-warning">
                            ⚠️ Aucun client trouvé. Vous pouvez saisir le nom manuellement ou <a href="/clients/ajouter">créer un client</a>.
                        </small>
                    )}
                </div>

                <div className="form-section">
                    <h3>Détails de la facture</h3>

                    <label>
                        Description *
                        <textarea
                            name="description"
                            placeholder="Description des prestations ou produits facturés..."
                            value={form.description}
                            onChange={handleChange}
                            rows="4"
                            required
                        />
                    </label>

                    <div className="date-row">
                        <label>
                            Date d'émission *
                            <input
                                type="date"
                                name="date_emission"
                                value={form.date_emission}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Date d'échéance
                            <input
                                type="date"
                                name="date_echeance"
                                value={form.date_echeance}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className="amount-row">
                        <label>
                            Montant HT * (€)
                            <input
                                type="number"
                                name="montant_ht"
                                placeholder="0.00"
                                value={form.montant_ht}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </label>

                        <label>
                            TVA (%)
                            <input
                                type="number"
                                name="tva"
                                placeholder="20"
                                value={form.tva}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                max="100"
                            />
                        </label>
                    </div>

                    <label>
                        Statut
                        <select
                            name="statut"
                            value={form.statut}
                            onChange={handleChange}
                        >
                            <option value="en_attente">En attente</option>
                            <option value="payee">Payée</option>
                            <option value="rejetee">Rejetée</option>
                        </select>
                    </label>
                </div>

                <div className="form-section totals-section">
                    <h3>Récapitulatif</h3>
                    <div className="totals-grid">
                        <div className="total-item">
                            <span>Montant HT:</span>
                            <span>{(parseFloat(form.montant_ht) || 0).toFixed(2)} €</span>
                        </div>
                        <div className="total-item">
                            <span>TVA ({form.tva}%):</span>
                            <span>{calculateMontantTVA()} €</span>
                        </div>
                        <div className="total-item total-ttc">
                            <span>Montant TTC:</span>
                            <span>{calculateMontantTTC()} €</span>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate("/factures")} className="btn btn-light">
                        Annuler
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? "Sauvegarde en cours..." : (isEdit ? "💾 Mettre à jour" : "💾 Créer la facture")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FactureFormComplet;
