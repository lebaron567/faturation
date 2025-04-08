import React from "react";

const PlanningForm = ({ form, handleChange, handleSubmit, onCancel, selectedSalarieId, salaries }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Ajouter un Planning</h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="date" type="date" required onChange={(e) => handleChange(e)} value={form.date || ""} />
        <input name="heure_debut" type="time" required onChange={(e) => handleChange(e)} value={form.heure_debut || ""} />
        <input name="heure_fin" type="time" required onChange={(e) => handleChange(e)} value={form.heure_fin || ""} />
        <input name="type_evenement" placeholder="Type (ex: Intervention)" onChange={(e) => handleChange(e)} required />
        <input name="objet" placeholder="Objet" onChange={(e) => handleChange(e)} required />
        <input name="prestation" placeholder="Prestation" onChange={(e) => handleChange(e)} />
        <input name="client_id" type="number" placeholder="ID Client" onChange={(e) => handleChange(e)} required />
        <select name="facturation" onChange={(e) => handleChange(e)}>
          <option value="">-- Facturation --</option>
          <option value="Comptabilisé">Comptabilisé</option>
          <option value="Non Comptabilisé">Non Comptabilisé</option>
        </select>
        <input name="taux_horaire" type="number" placeholder="Taux horaire (€)" onChange={(e) => handleChange(e)} />
        <input name="forfait_ht" type="number" placeholder="Forfait HT (€)" onChange={(e) => handleChange(e)} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="submit">✅ Enregistrer</button>
          <button type="button" onClick={onCancel}>Annuler</button>
        </div>
      </form>
    </div>
  </div>
);

export default PlanningForm;
