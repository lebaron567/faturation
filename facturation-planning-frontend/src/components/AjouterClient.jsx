import axios from "../axiosInstance";
import { useState } from "react";
import { useEntreprise } from "../hooks/useEntreprise";
import "../styles/AjouterClient.css";

const AjouterClient = () => {
  const { entrepriseId, checkEntrepriseAccess } = useEntreprise();
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkEntrepriseAccess("ajouter un client")) {
      return;
    }

    console.log("🏢 Ajout client pour entreprise:", entrepriseId);

    try {
      const clientData = {
        ...form,
        entreprise_id: entrepriseId,
      };

      console.log("📝 Données client à envoyer:", clientData);

      await axios.post("/clients", clientData);
      alert("✅ Client ajouté !");
      setForm({ nom: "", email: "", telephone: "", adresse: "" });
    } catch (err) {
      console.error("❌ Erreur ajout client:", err);
      console.error("❌ Response data:", err.response?.data);
      alert(`❌ Échec de l'ajout du client: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="form-container">
      <h2>Ajouter un client</h2>
      <form onSubmit={handleSubmit}>
        <label>Nom</label>
        <input name="nom" value={form.nom} onChange={handleChange} required />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} type="email" required />

        <label>Téléphone</label>
        <input name="telephone" value={form.telephone} onChange={handleChange} />

        <label>Adresse</label>
        <input name="adresse" value={form.adresse} onChange={handleChange} />

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AjouterClient;
