import React, { useState, useEffect, useContext } from "react";
import axios from "../axiosInstance";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/DevisFormComplet.css";

const DevisFormComplet = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    objet: "",
    date_devis: "",
    date_expiration: "",
    conditions: "",
    client_id: "",
  });

  const [lignes, setLignes] = useState([
    { description: "", quantite: 1, prix_unitaire: "", tva: 20 },
  ]);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (!user?.entreprise_id) {
          console.error("❌ Utilisateur sans entreprise_id:", user);
          alert("⚠️ Impossible de charger les clients. Veuillez vous reconnecter.");
          return;
        }

        console.log("🏢 Entreprise ID connectée:", user.entreprise_id);

        // Récupérer tous les clients et filtrer par entreprise
        const response = await axios.get("/clients");
        console.log("📋 Tous les clients:", response.data);

        const clientsFiltered = response.data.filter(client =>
          client.entreprise_id === user.entreprise_id
        );

        console.log("👥 Clients de l'entreprise:", clientsFiltered);
        setClients(clientsFiltered);

        if (clientsFiltered.length === 0) {
          console.warn("⚠️ Aucun client trouvé pour cette entreprise. Vous devez d'abord créer un client.");
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement des clients:", err);
        console.error("❌ Response data:", err.response?.data);
      }
    };

    fetchClients();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLigneChange = (index, field, value) => {
    const updated = [...lignes];

    if (field === "quantite" || field === "prix_unitaire" || field === "tva") {
      // Gérer les valeurs vides et invalides pour éviter NaN
      const numValue = value === '' ? 0 : parseFloat(value);
      updated[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      updated[index][field] = value;
    }

    setLignes(updated);
  };

  const addLigne = () => {
    setLignes([...lignes, { description: "", quantite: 1, prix_unitaire: "", tva: 20 }]);
  };

  const removeLigne = (index) => {
    const updated = lignes.filter((_, i) => i !== index);
    setLignes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation des données avant envoi
      if (!form.objet || !form.date_devis || !form.date_expiration || !form.client_id) {
        alert("❌ Veuillez remplir tous les champs obligatoires");
        setLoading(false);
        return;
      }

      if (lignes.length === 0 || lignes.some(ligne => !ligne.description || ligne.quantite <= 0 || ligne.prix_unitaire < 0)) {
        alert("❌ Veuillez vérifier les lignes du devis (description, quantité et prix requis)");
        setLoading(false);
        return;
      }

      // Vérifier que l'utilisateur a un entreprise_id
      if (!user?.entreprise_id) {
        alert("❌ Impossible de créer le devis. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      console.log("🏢 Création devis pour entreprise:", user.entreprise_id);

      // Formatage des dates au format RFC3339 attendu par Go
      const dateDevis = new Date(form.date_devis + 'T00:00:00Z'); // Ajouter l'heure pour RFC3339
      const dateExpiration = new Date(form.date_expiration + 'T23:59:59Z'); // Fin de journée

      // Vérifier que les dates sont valides
      if (isNaN(dateDevis.getTime()) || isNaN(dateExpiration.getTime())) {
        alert("❌ Dates invalides");
        setLoading(false);
        return;
      }

      // Formatage des lignes pour s'assurer qu'elles sont valides
      const lignesFormatees = lignes.map(ligne => ({
        description: ligne.description.trim(),
        quantite: Math.max(1, parseInt(ligne.quantite) || 1), // Au moins 1
        prix_unitaire: Math.max(0, parseFloat(ligne.prix_unitaire) || 0), // Au moins 0
        tva: Math.max(0, Math.min(100, parseFloat(ligne.tva) || 20)) // Entre 0 et 100, défaut 20
      }));

      const data = {
        objet: form.objet.trim(),
        entreprise_id: user.entreprise_id,
        client_id: parseInt(form.client_id),
        date_devis: dateDevis.toISOString(), // Format RFC3339 complet
        date_expiration: dateExpiration.toISOString(), // Format RFC3339 complet
        conditions: form.conditions.trim() || "",
        lignes: lignesFormatees,
        statut: "brouillon" // Statut par défaut
      };

      console.log("📤 Données envoyées pour création de devis:", data);
      console.log("📋 Lignes du devis:", lignesFormatees);

      const response = await axios.post("/devis", data);
      console.log("✅ Réponse du serveur:", response.data);
      alert("✅ Devis créé avec succès !");

      // Reset du formulaire
      setForm({
        objet: "",
        date_devis: "",
        date_expiration: "",
        conditions: "",
        client_id: "",
      });
      setLignes([{ description: "", quantite: 1, prix_unitaire: "", tva: 20 }]);
    } catch (err) {
      console.error("❌ Erreur complète:", err);
      console.error("❌ Réponse du serveur:", err.response?.data);
      console.error("❌ Status:", err.response?.status);
      console.error("❌ Headers:", err.response?.headers);

      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erreur inconnue";

      alert("❌ Erreur lors de la création du devis: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalHT = lignes.reduce((acc, ligne) => {
      const prix = parseFloat(ligne.prix_unitaire) || 0;
      const qty = parseInt(ligne.quantite) || 0;
      return acc + (prix * qty);
    }, 0);

    const totalTVA = lignes.reduce((acc, ligne) => {
      const prix = parseFloat(ligne.prix_unitaire) || 0;
      const qty = parseInt(ligne.quantite) || 0;
      const tva = parseFloat(ligne.tva) || 0;
      return acc + (prix * qty * tva / 100);
    }, 0);

    const totalTTC = totalHT + totalTVA;

    return { totalHT, totalTVA, totalTTC };
  };

  const { totalHT, totalTVA, totalTTC } = calculateTotals();

  return (
    <div className="devis-form-container">
      <div className="form-container">
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
                  {clients.length === 0 ? (
                    <option value="" disabled>
                      Aucun client disponible - Créez d'abord un client
                    </option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nom} ({client.email}) - ID: {client.id} - Entreprise: {client.entreprise_id}
                      </option>
                    ))
                  )}
                </select>
                {clients.length === 0 && (
                  <small style={{ color: 'red', marginTop: '5px', display: 'block' }}>
                    ⚠️ Aucun client trouvé pour votre entreprise.
                    <a href="/clients/ajouter" style={{ color: 'blue', textDecoration: 'underline' }}>
                      Créer un nouveau client
                    </a>
                  </small>
                )}
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
                        value={ligne.quantite === 0 ? "" : ligne.quantite}
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
                        value={ligne.prix_unitaire === 0 ? "" : ligne.prix_unitaire}
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
                        value={ligne.tva === 0 ? "" : ligne.tva}
                        onChange={(e) => handleLigneChange(index, "tva", e.target.value)}
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </label>
                  </div>

                  <div className="ligne-total">
                    <span>Total ligne HT: {((parseFloat(ligne.prix_unitaire) || 0) * (parseInt(ligne.quantite) || 0)).toFixed(2)} €</span>
                    <span>TVA: {((parseFloat(ligne.prix_unitaire) || 0) * (parseInt(ligne.quantite) || 0) * (parseFloat(ligne.tva) || 0) / 100).toFixed(2)} €</span>
                    <span>Total TTC: {((parseFloat(ligne.prix_unitaire) || 0) * (parseInt(ligne.quantite) || 0) * (1 + (parseFloat(ligne.tva) || 0) / 100)).toFixed(2)} €</span>
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
      </div>
    </div>
  );
};

export default DevisFormComplet;
