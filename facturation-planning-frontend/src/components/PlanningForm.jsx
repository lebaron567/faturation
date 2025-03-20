import React, { useState } from "react";
import axios from "axios";

const PlanningForm = () => {
  const [form, setForm] = useState({
    date: "",
    heure_debut: "",
    heure_fin: "",
    type_evenement: "",
    salarie_id: "",
    client_id: "",
    objet: "",
    prestation: "",
    facturation: "Non Comptabilisé",
    taux_horaire: "",
    forfait_ht: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:8080/plannings", form);
    alert("Planning ajouté !");
  };

  return (
    <div>
      <h2>Ajouter un Planning</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" name="date" onChange={handleChange} required />
        <input type="time" name="heure_debut" onChange={handleChange} required />
        <input type="time" name="heure_fin" onChange={handleChange} required />
        <input type="text" name="type_evenement" placeholder="Type d'événement" onChange={handleChange} required />
        <input type="number" name="salarie_id" placeholder="ID du salarié" onChange={handleChange} required />
        <input type="number" name="client_id" placeholder="ID du client" onChange={handleChange} required />
        <input type="text" name="objet" placeholder="Objet" onChange={handleChange} required />
        <input type="text" name="prestation" placeholder="Prestation" onChange={handleChange} required />
        <select name="facturation" onChange={handleChange}>
          <option value="Comptabilisé">Comptabilisé</option>
          <option value="Non Comptabilisé">Non Comptabilisé</option>
        </select>
        <input type="number" name="taux_horaire" placeholder="Taux Horaire (€)" onChange={handleChange} required />
        <input type="number" name="forfait_ht" placeholder="Forfait HT (€)" onChange={handleChange} required />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default PlanningForm;
