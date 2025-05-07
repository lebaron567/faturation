// src/components/Planning/utils.js
import moment from "moment";
export const formatEventsFromApi = (events) => {
  return events
    .map((e) => {
      // Sécurité : vérifie que les champs obligatoires sont présents
      if (!e.date || !e.heure_debut || !e.heure_fin) return null;

      const start = new Date(`${e.date}T${e.heure_debut}`);
      const end = new Date(`${e.date}T${e.heure_fin}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

      return {
        title: `${e.type_evenement} - ${e.objet}`,
        start,
        end,
        ...e,
      };
    })
    .filter(Boolean); // Supprime les événements null
};


export const extractDateInfo = (slot) => ({
  date: moment(slot.start).format("YYYY-MM-DD"),
  heure_debut: moment(slot.start).format("HH:mm"),
  heure_fin: moment(slot.end).format("HH:mm"),
});

export const handleChange = (e, form, setForm) => {
  const { name, value } = e.target;
  const numericFields = ["salarie_id", "client_id", "taux_horaire", "forfait_ht"];

  setForm({
    ...form,
    [name]: numericFields.includes(name) ? parseFloat(value) : value,
  });
};


