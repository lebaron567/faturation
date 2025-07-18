import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axiosInstance";
import "../styles/FactureFormComplet.css";

const FactureFormComplet = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [form, setForm] = useState({
        type: "classique",
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

    useEffect(() => {
        fetchClients();
        if (isEdit) {
            fetchFacture();
        }
    }, [id]);

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

    const fetchFacture = async () => {
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
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!form.client_nom || !form.description || !form.montant_ht) {
                alert("❌ Veuillez remplir tous les champs obligatoires");
                setLoading(false);
                return;
            }

            const profileResponse = await axios.get("/profile");
            const entrepriseId = profileResponse.data.id;

            // Calcul du montant TTC
            const montantHT = parseFloat(form.montant_ht);
            const tva = parseFloat(form.tva) || 0;
            const montantTTC = montantHT * (1 + tva / 100);

            const data = {
                type: form.type,
                entreprise_id: entrepriseId,
                client_nom: form.client_nom.trim(),
                description: form.description.trim(),
                date_emission: new Date(form.date_emission + 'T00:00:00Z').toISOString(),
                date_echeance: form.date_echeance ? new Date(form.date_echeance + 'T23:59:59Z').toISOString() : null,
                montant_ht: montantHT,
                tva: tva,
                montant_ttc: montantTTC,
                statut: form.statut
            };

            console.log("📤 Données envoyées:", data);

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
                                name="client_nom"
                                value={form.client_nom}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Sélectionner un client --</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.nom}>
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
