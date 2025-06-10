import React, { useState } from "react";
import axios from "../axiosInstance";

const GestionDocuments = () => {
  const [type, setType] = useState("facture"); // ou "devis"
  const [form, setForm] = useState({
    client_nom: "",
    description: "",
    montant_ht: 0,
    tva: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = type === "facture" ? "/factures" : "/devis";
      await axios.post(endpoint, form);
      alert(`✅ ${type === "facture" ? "Facture" : "Devis"} créé avec succès !`);
      setForm({ client_nom: "", description: "", montant_ht: 0, tva: 0 });
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la création");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Créer un document</h2>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setType("facture")}>📄 Facture</button>
        <button onClick={() => setType("devis")}>📝 Devis</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="text"
          name="client_nom"
          placeholder="Nom du client"
          value={form.client_nom}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="montant_ht"
          placeholder="Montant HT"
          value={form.montant_ht}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="tva"
          placeholder="TVA (%)"
          value={form.tva}
          onChange={handleChange}
        />
        <button type="submit">
          {type === "facture" ? "Créer Facture" : "Créer Devis"}
        </button>
      </form>
    </div>
  );
};

export default GestionDocuments;
