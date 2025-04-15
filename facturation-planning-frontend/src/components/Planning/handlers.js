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

  } catch (error) {
    alert("❌ Erreur lors du déplacement !");
    console.error(error);
  }
}

export async function handleDelete(event, setEvents) {
  const confirm = window.confirm("❌ Supprimer cet événement ?");
  console.log("🚨 Suppression demandée pour l'événement ID :", event.id);
  if (!confirm) return;

  try {
    await axios.delete(`http://localhost:8080/plannings/${event.id}`);
    
    // 🧠 Option 1 : suppression locale (si API ne renvoie rien)
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    
    // ✅ Option 2 : meilleure approche = recharger la liste
    // const res = await fetchPlannings();
    // setEvents(formatEventsFromApi(res.data));

    alert("🗑️ Événement supprimé !");
  } catch (err) {
    console.error("❌ Erreur suppression :", err);
    alert("Erreur lors de la suppression !");
  }
}


export async function handleCopy(eventToCopy, setEvents, setSelectedEvent) {


  
  const payload = {
    ...eventToCopy,
    title: `[COPIE] ${eventToCopy.title}`,
    objet: `${eventToCopy.objet} (copie)`,
    date: eventToCopy.date,
    heure_debut: eventToCopy.heure_debut,
    heure_fin: eventToCopy.heure_fin,
    type_evenement: eventToCopy.type_evenement,
    prestation: eventToCopy.prestation,
    client_id: eventToCopy.client_id,
    facturation: eventToCopy.facturation,
    taux_horaire: eventToCopy.taux_horaire,
    forfait_ht: eventToCopy.forfait_ht,
    salarie_id: eventToCopy.salarie_id,
    entreprise_id: eventToCopy.entreprise_id,
  };

  delete payload.id; // ⚠️ Supprimer l'ID original

  try {
    const res = await axios.post("http://localhost:8080/plannings", payload);

    const updated = await fetchPlannings();
    setEvents(formatEventsFromApi(updated.data));

    alert("📋 Copie enregistrée !");
    setSelectedEvent(null);
  } catch (err) {
    console.error("❌ Erreur copie :", err);
    alert("Erreur lors de la copie !");
  }
}

export function copyEventToClipboardAndForm(event, setForm, setShowForm) {
  const content = `
📅 ${event.type_evenement} - ${event.objet}
🕒 ${event.date} de ${event.heure_debut} à ${event.heure_fin}
💼 Prestation : ${event.prestation}
👤 Client ID : ${event.client_id}
💰 ${event.taux_horaire ? `Taux horaire : ${event.taux_horaire} €` : `Forfait HT : ${event.forfait_ht} €`}
📦 Facturation : ${event.facturation}
`;

  navigator.clipboard.writeText(content)
    .then(() => {
      alert("📋 Infos copiées dans le presse-papiers !");
      
      // ✅ Remplit bien tous les champs
      setForm({
        date: event.date,
        heure_debut: event.heure_debut,
        heure_fin: event.heure_fin,
        type_evenement: event.type_evenement || "",
        objet: `${event.objet || ""} (copie)`,
        prestation: event.prestation || "",
        client_id: event.client_id || "",
        facturation: event.facturation || "",
        taux_horaire: event.taux_horaire || "",
        forfait_ht: event.forfait_ht || "",
      });

      setShowForm(true);
    })
    .catch((err) => {
      console.error("❌ Erreur copie presse-papiers :", err);
      alert("Erreur lors de la copie !");
    });
}
