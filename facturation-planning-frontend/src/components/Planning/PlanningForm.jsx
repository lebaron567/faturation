import React from "react";

const PlanningForm = ({
  form,
  handleChange,
  handleSubmit,
  onCancel,
  selectedSalarieId,
  salaries,
  clients,
}) => {
  return (
    <>
      <div className="modal-overlay" onClick={onCancel} />
      <div className="modal-content planning-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✨ Créer un nouvel événement</h3>
          <button className="modal-close-btn" onClick={onCancel} type="button">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="planning-form">
            {/* Section Date et Heure */}
            <div className="form-section">
              <h4 className="section-title">📅 Date et Horaires</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    onChange={handleChange}
                    value={form.date || ""}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nb_repetitions">Répétitions (semaines)</label>
                  <input
                    id="nb_repetitions"
                    type="number"
                    name="nb_repetitions"
                    value={form.nb_repetitions || 1}
                    onChange={handleChange}
                    min="1"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="heure_debut">Heure de début</label>
                  <input
                    id="heure_debut"
                    name="heure_debut"
                    type="time"
                    required
                    onChange={handleChange}
                    value={form.heure_debut || ""}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="heure_fin">Heure de fin</label>
                  <input
                    id="heure_fin"
                    name="heure_fin"
                    type="time"
                    required
                    onChange={handleChange}
                    value={form.heure_fin || ""}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Section Événement */}
            <div className="form-section">
              <h4 className="section-title">📋 Détails de l'événement</h4>
              <div className="form-group">
                <label htmlFor="type_evenement">Type d'événement</label>
                <input
                  id="type_evenement"
                  name="type_evenement"
                  placeholder="ex: Intervention, Réunion, Formation..."
                  onChange={handleChange}
                  value={form.type_evenement || ""}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="objet">Objet *</label>
                <input
                  id="objet"
                  name="objet"
                  placeholder="Titre de l'événement"
                  onChange={handleChange}
                  value={form.objet || ""}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prestation">Description de la prestation</label>
                <textarea
                  id="prestation"
                  name="prestation"
                  placeholder="Description détaillée..."
                  onChange={handleChange}
                  value={form.prestation || ""}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>

            {/* Section Assignation */}
            <div className="form-section">
              <h4 className="section-title">👥 Assignation</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salarie_id">Salarié *</label>
                  <select
                    id="salarie_id"
                    name="salarie_id"
                    onChange={handleChange}
                    value={form.salarie_id || selectedSalarieId || ""}
                    required
                    className="form-select"
                  >
                    <option value="">-- Sélectionner un salarié --</option>
                    {salaries &&
                      salaries.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nom} ({s.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="client_id">Client *</label>
                  <select
                    id="client_id"
                    name="client_id"
                    onChange={handleChange}
                    value={form.client_id || ""}
                    required
                    className="form-select"
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section Facturation */}
            <div className="form-section">
              <h4 className="section-title">💰 Facturation</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="facturation">Statut de facturation</label>
                  <select
                    id="facturation"
                    name="facturation"
                    onChange={handleChange}
                    value={form.facturation || ""}
                    className="form-select"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="Comptabilisé">✅ Comptabilisé</option>
                    <option value="Non Comptabilisé">⏳ Non Comptabilisé</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="taux_horaire">Taux horaire (€)</label>
                  <input
                    id="taux_horaire"
                    name="taux_horaire"
                    type="number"
                    placeholder="0.00"
                    onChange={handleChange}
                    value={form.taux_horaire || ""}
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="forfait_ht">Forfait HT (€)</label>
                  <input
                    id="forfait_ht"
                    name="forfait_ht"
                    type="number"
                    placeholder="0.00"
                    onChange={handleChange}
                    value={form.forfait_ht || ""}
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            ❌ Annuler
          </button>
          <button type="submit" onClick={handleSubmit} className="btn btn-primary">
            ✅ Créer l'événement
          </button>
        </div>
      </div>
    </>
  );
};

export default PlanningForm;
