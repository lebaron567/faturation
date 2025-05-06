import React from "react";

const PlanningForm = ({
  form,
  handleChange,
  handleSubmit,
  onCancel,
  selectedSalarieId,
  salaries,
}) => {
  return (
    <>
      <div className="modal-overlay" onClick={onCancel} />
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Ajouter un Planning</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            name="date"
            type="date"
            required
            onChange={handleChange}
            value={form.date || ""}
          />
          <input
            name="heure_debut"
            type="time"
            required
            onChange={handleChange}
            value={form.heure_debut || ""}
          />
          <input
            name="heure_fin"
            type="time"
            required
            onChange={handleChange}
            value={form.heure_fin || ""}
          />
          <input
            name="type_evenement"
            placeholder="Type (ex: Intervention)"
            onChange={handleChange}
            value={form.type_evenement || ""}
            required
          />
          <input
            name="objet"
            placeholder="Objet"
            onChange={handleChange}
            value={form.objet || ""}
            required
          />
          <input
            name="prestation"
            placeholder="Prestation"
            onChange={handleChange}
            value={form.prestation || ""}
          />

          <select
            name="salarie_id"
            onChange={handleChange}
            value={form.salarie_id || selectedSalarieId || ""}
            required
          >
            <option value="">-- Sélectionner un salarié --</option>
            {salaries &&
              salaries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom} ({s.email})
                </option>
              ))}
          </select>

          <input
            name="client_id"
            type="number"
            placeholder="ID Client"
            onChange={handleChange}
            value={form.client_id || ""}
            required
          />
          <select
            name="facturation"
            onChange={handleChange}
            value={form.facturation || ""}
          >
            <option value="">-- Facturation --</option>
            <option value="Comptabilisé">Comptabilisé</option>
            <option value="Non Comptabilisé">Non Comptabilisé</option>
          </select>
          <input
            name="taux_horaire"
            type="number"
            placeholder="Taux horaire (€)"
            onChange={handleChange}
            value={form.taux_horaire || ""}
          />
          <input
            name="forfait_ht"
            type="number"
            placeholder="Forfait HT (€)"
            onChange={handleChange}
            value={form.forfait_ht || ""}
          />
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button type="submit">✅ Enregistrer</button>
            <button type="button" onClick={onCancel}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PlanningForm;
