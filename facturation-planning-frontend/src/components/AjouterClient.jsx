import axios from "../axiosInstance";
import { useEffect, useState } from "react";
import "../styles/AjouterClient.css";

const AjouterClient = () => {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  const [entrepriseId, setEntrepriseId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/profile");
        setEntrepriseId(res.data.id);
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!entrepriseId) {
      alert("⚠️ Impossible d'ajouter un client sans entreprise liée.");
      return;
    }

    try {
      await axios.post("/clients", {
        ...form,
        entreprise_id: entrepriseId,
      });
      alert("✅ Client ajouté !");
      setForm({ nom: "", email: "", telephone: "", adresse: "" });
    } catch (err) {
      console.error("Erreur ajout client :", err);
      alert("❌ Échec de l'ajout du client.");
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
