import React, { useState } from "react";
import axios from "../axiosInstance";
import "../styles/DevisFormComplet.css"; // Assure-toi d'avoir un fichier CSS pour le style

const DevisFormComplet = () => {
  const [form, setForm] = useState({
    client_nom: "",
    client_adresse: "",
    client_email: "",
    client_telephone: "",
    date_devis: "",
    date_expiration: "",
    conditions: "",
  });

  const [lignes, setLignes] = useState([
    { description: "", quantite: 1, prix_unitaire: 0, tva: 20 },
  ]);

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
    try {
      const data = {
      ...form,
      date_devis: new Date(form.date_devis).toISOString(),
      date_expiration: new Date(form.date_expiration).toISOString(),
      lignes,
    };
      await axios.post("/devis", data);
      alert("✅ Devis créé avec succès !");
      // Reset
      setForm({
        client_nom: "",
        client_adresse: "",
        client_email: "",
        client_telephone: "",
        date_devis: "",
        date_expiration: "",
        conditions: "",
      });
      setLignes([{ description: "", quantite: 1, prix_unitaire: 0, tva: 20 }]);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la création du devis");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 15 }}>
      <h2>Créer un devis complet</h2>

      <input name="client_nom" placeholder="Nom du client" value={form.client_nom} onChange={handleChange} required />
      <input name="client_adresse" placeholder="Adresse" value={form.client_adresse} onChange={handleChange} />
      <input name="client_email" placeholder="Email" value={form.client_email} onChange={handleChange} type="email" />
      <input name="client_telephone" placeholder="Téléphone" value={form.client_telephone} onChange={handleChange} />

      <label>
        Date du devis :
        <input type="date" name="date_devis" value={form.date_devis} onChange={handleChange} required />
      </label>
      <label>
        Date d'expiration :
        <input type="date" name="date_expiration" value={form.date_expiration} onChange={handleChange} />
      </label>

      <textarea name="conditions" placeholder="Conditions de paiement / mentions" value={form.conditions} onChange={handleChange} />

      <h3>Lignes du devis</h3>
      {lignes.map((ligne, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: 10 }}>
          <input
            placeholder="Description"
            value={ligne.description}
            onChange={(e) => handleLigneChange(index, "description", e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Quantité"
            value={ligne.quantite}
            onChange={(e) => handleLigneChange(index, "quantite", e.target.value)}
            min="1"
          />
          <input
            type="number"
            placeholder="Prix unitaire HT"
            value={ligne.prix_unitaire}
            onChange={(e) => handleLigneChange(index, "prix_unitaire", e.target.value)}
            step="0.01"
          />
          <input
            type="number"
            placeholder="TVA (%)"
            value={ligne.tva}
            onChange={(e) => handleLigneChange(index, "tva", e.target.value)}
            step="0.01"
          />
          <button type="button" onClick={() => removeLigne(index)}>❌ Supprimer</button>
        </div>
      ))}

      <button type="button" onClick={addLigne}>➕ Ajouter une ligne</button>
      <button type="submit">Créer le devis</button>
    </form>
  );
};

export default DevisFormComplet;
