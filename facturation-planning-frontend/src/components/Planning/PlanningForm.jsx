<div>
  <input
    name="type_evenement"
    placeholder="Type (ex: Intervention)"
    onChange={(e) => handleChange(e)}
    required
    value={form.type_evenement || ""}
  />

  <input
    name="objet"
    placeholder="Objet"
    onChange={(e) => handleChange(e)}
    required
    value={form.objet || ""}
  />

  <input
    name="prestation"
    placeholder="Prestation"
    onChange={(e) => handleChange(e)}
    value={form.prestation || ""}
  />

  <input
    name="client_id"
    type="number"
    placeholder="ID Client"
    onChange={(e) => handleChange(e)}
    required
    value={form.client_id || ""}
  />

  <select
    name="facturation"
    onChange={(e) => handleChange(e)}
    value={form.facturation || ""} // ✅ ici aussi
  >
    <option value="">-- Facturation --</option>
    <option value="Comptabilisé">Comptabilisé</option>
    <option value="Non Comptabilisé">Non Comptabilisé</option>
  </select>

  <input
    name="taux_horaire"
    type="number"
    placeholder="Taux horaire (€)"
    onChange={(e) => handleChange(e)}
    value={form.taux_horaire || ""}
  />

  <input
    name="forfait_ht"
    type="number"
    placeholder="Forfait HT (€)"
    onChange={(e) => handleChange(e)}
    value={form.forfait_ht || ""}
  />
</div>
