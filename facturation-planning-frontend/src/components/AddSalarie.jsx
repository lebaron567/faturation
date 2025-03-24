import React, { useState, useEffect } from "react";
import axios from "axios";

const AddSalarie = () => {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
  });

  const [entrepriseId, setEntrepriseId] = useState(null);

  // 🔐 Récupérer l'ID de l'entreprise connectée
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8080/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEntrepriseId(res.data.id); // ✅ ID entreprise connecté
      } catch (err) {
        console.error("❌ Erreur lors du chargement du profil :", err);
      }
    };

    fetchProfile();
  }, []);

  // 📝 Gérer la saisie
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📤 Envoi à l'API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!entrepriseId) {
      alert("⚠️ L’entreprise n’est pas encore chargée !");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/salaries",
        { ...form, entreprise_id: entrepriseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("✅ Salarié ajouté !");
      setForm({ nom: "", email: "", telephone: "" });
    } catch (error) {
      console.error("❌ Erreur :", error.response?.data || error.message);
      alert("❌ Impossible d’ajouter le salarié");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>➕ Ajouter un Salarié</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={form.nom}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telephone"
          placeholder="Téléphone"
          value={form.telephone}
          onChange={handleChange}
        />
        <button type="submit">💾 Enregistrer</button>
      </form>
    </div>
  );
};

export default AddSalarie;
