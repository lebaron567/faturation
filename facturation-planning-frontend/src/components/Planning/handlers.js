// components/Planning/handlers.js
import { fetchProfile, createPlanning, fetchPlannings } from "./api";
import { formatEventsFromApi } from "./utils";

import axios from "../../axiosInstance"; // ou l'instance axios configurée
import moment from "moment";


export const handleCreate = async (
  e,
  form,
  selectedSalarieId,
  setForm,
  setShowForm,
  setEvents
) => {
  e.preventDefault();

  try {
    const profile = await fetchProfile();
    const entrepriseId = profile.data.id;

    const payload = {
      ...form,
      salarie_id: selectedSalarieId,
      entreprise_id: entrepriseId,
    };

    await createPlanning(payload);
    setShowForm(false);
    setForm({});

    const res = await fetchPlannings();
    setEvents(formatEventsFromApi(res.data));

    alert("✅ Planning enregistré !");
  } catch (err) {
    alert("❌ Erreur lors de la création !");
    console.error(err);
  }
};

export async function handleEventDrop({ event, start, end }, setEvents) {
  const updatedPayload = {
    ...event,
    date: moment(start).format("YYYY-MM-DD"),
    heure_debut: moment(start).format("HH:mm"),
    heure_fin: moment(end).format("HH:mm"),
  };

  try {
    await axios.put(`http://localhost:8080/plannings/${event.id}`, updatedPayload);

    // Rechargement propre des événements depuis l’API
    const res = await fetchPlannings();
    setEvents(formatEventsFromApi(res.data));

    alert("✅ Planning mis à jour !");
  } catch (error) {
    alert("❌ Erreur lors du déplacement !");
    console.error(error);
  }
}
