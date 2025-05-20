import React, { useState } from "react";
import axios from "../axiosInstance"; // au lieu de "axios"
import "../styles/FactureForm.css";


const FactureForm = () => {
  const [facture, setFacture] = useState({
    entrepriseNom: "",
    clientNom: "",
    description: "",
    montantHT: 0,
    tva: 20,
  });

  const [pdfUrl, setPdfUrl] = useState(null);

  const handleChange = (e) => {
    setFacture({ ...facture, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/factures", facture);
      setPdfUrl(response.data.pdf);
    } catch (error) {
      console.error("Erreur lors de la création de la facture", error);
    }
  };

  return (
    <div className="facture-form">
      <h2>Créer une facture</h2>
      <form onSubmit={handleSubmit}>
        <label>Nom de l'entreprise :</label>
        <input name="entrepriseNom" type="text" value={facture.entrepriseNom} onChange={handleChange} required />

        <label>Nom du client :</label>
        <input name="clientNom" type="text" value={facture.clientNom} onChange={handleChange} required />

        <label>Description :</label>
        <input name="description" type="text" value={facture.description} onChange={handleChange} required />

        <label>Montant HT :</label>
        <input name="montantHT" type="number" value={facture.montantHT} onChange={handleChange} required />

        <label>TVA (%) :</label>
        <input name="tva" type="number" value={facture.tva} onChange={handleChange} required />
        <button type="submit">Générer la facture</button>
      </form>

      {pdfUrl && (
        <div>
          <h3>Facture générée :</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Télécharger le PDF</a>
        </div>
      )}
    </div>
  );
};

export default FactureForm;
