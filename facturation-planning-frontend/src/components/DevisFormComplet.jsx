import React, { useState, useEffect } from "react";
import axios from "../axiosInstance";
import "../styles/DevisFormComplet.css";

const DevisFormComplet = () => {
  const [form, setForm] = useState({
    objet: "",
    date_devis: "",
    date_expiration: "",
    conditions: "",
    client_id: "",
  });

  const [lignes, setLignes] = useState([
    { description: "", quantite: 1, prix_unitaire: 0, tva: 20 },
  ]);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("/clients");
        setClients(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des clients:", err);
      }
    };

    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLigneChange = (index, field, value) => {
    const updated = [...lignes];
    updated[index][field] = field === "quantite" || field === "prix_unitaire" || field === "tva"
      ? parseFloat(value)
      : value;
    setLignes(updated);
  };

  const addLigne = () => {
    setLignes([...lignes, { description: "", quantite: 1, prix_unitaire: 0, tva: 20 }]);
  };

  const removeLigne = (index) => {
    const updated = lignes.filter((_, i) => i !== index);
    setLignes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Récupération du profil pour obtenir l'entreprise_id
      const profileResponse = await axios.get("/profile");
      const entrepriseId = profileResponse.data.id;

      const data = {
        ...form,
        entreprise_id: entrepriseId,
        client_id: parseInt(form.client_id),
        date_devis: new Date(form.date_devis).toISOString(),
        date_expiration: new Date(form.date_expiration).toISOString(),
        lignes,
      };

      await axios.post("/devis", data);
      alert("✅ Devis créé avec succès !");

      // Reset du formulaire
      setForm({
        objet: "",
        date_devis: "",
        date_expiration: "",
        conditions: "",
        client_id: "",
      });
      setLignes([{ description: "", quantite: 1, prix_unitaire: 0, tva: 20 }]);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la création du devis: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.prix_unitaire * ligne.quantite), 0);
    const totalTVA = lignes.reduce((acc, ligne) => acc + (ligne.prix_unitaire * ligne.quantite * ligne.tva / 100), 0);
    const totalTTC = totalHT + totalTVA;

    return { totalHT, totalTVA, totalTTC };
  };

  const { totalHT, totalTVA, totalTTC } = calculateTotals();

  return (
    <div className="devis-form">
      <h2>Créer un devis complet</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Informations générales</h3>

          <label>
            Objet du devis *
            <input
              name="objet"
              placeholder="Ex: Développement application web"
              value={form.objet}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Client *
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
          </label>

          <div className="date-row">
            <label>
              Date du devis *
              <input
                type="date"
                name="date_devis"
                value={form.date_devis}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Date d'expiration *
              <input
                type="date"
                name="date_expiration"
                value={form.date_expiration}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label>
            Conditions de paiement
            <textarea
              name="conditions"
              placeholder="Ex: Paiement sous 30 jours, 50% à la commande..."
              value={form.conditions}
              onChange={handleChange}
              rows="3"
            />
          </label>
        </div>

        <div className="form-section">
          <h3>Lignes du devis</h3>
          {lignes.map((ligne, index) => (
            <div key={index} className="ligne-devis">
              <label>
                Description *
                <input
                  placeholder="Description du service/produit"
                  value={ligne.description}
                  onChange={(e) => handleLigneChange(index, "description", e.target.value)}
                  required
                />
              </label>

              <div className="ligne-row">
                <label>
                  Quantité *
                  <input
                    type="number"
                    placeholder="1"
                    value={ligne.quantite}
                    onChange={(e) => handleLigneChange(index, "quantite", e.target.value)}
                    min="1"
                    step="1"
                    required
                  />
                </label>

                <label>
                  Prix unitaire HT *
                  <input
                    type="number"
                    placeholder="0.00"
                    value={ligne.prix_unitaire}
                    onChange={(e) => handleLigneChange(index, "prix_unitaire", e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                </label>

                <label>
                  TVA (%)
                  <input
                    type="number"
                    placeholder="20"
                    value={ligne.tva}
                    onChange={(e) => handleLigneChange(index, "tva", e.target.value)}
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </label>
              </div>

              <div className="ligne-total">
                <span>Total ligne HT: {(ligne.prix_unitaire * ligne.quantite).toFixed(2)} €</span>
                <span>TVA: {(ligne.prix_unitaire * ligne.quantite * ligne.tva / 100).toFixed(2)} €</span>
                <span>Total TTC: {(ligne.prix_unitaire * ligne.quantite * (1 + ligne.tva / 100)).toFixed(2)} €</span>
              </div>

              {lignes.length > 1 && (
                <button type="button" onClick={() => removeLigne(index)} className="remove-button">
                  ❌ Supprimer cette ligne
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addLigne} className="add-ligne-btn">
            ➕ Ajouter une ligne
          </button>
        </div>

        <div className="form-section totals-section">
          <h3>Récapitulatif</h3>
          <div className="totals-grid">
            <div className="total-item">
              <span>Total HT:</span>
              <span>{totalHT.toFixed(2)} €</span>
            </div>
            <div className="total-item">
              <span>Total TVA:</span>
              <span>{totalTVA.toFixed(2)} €</span>
            </div>
            <div className="total-item total-ttc">
              <span>Total TTC:</span>
              <span>{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Création en cours..." : "💾 Créer le devis"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DevisFormComplet;
