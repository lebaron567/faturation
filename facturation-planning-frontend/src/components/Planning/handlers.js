// components/Planning/handlers.js
import { fetchProfile, createPlanning, fetchPlannings } from "./api";
import { formatEventsFromApi } from "./utils";
import axios from "../../axiosInstance";
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
  console.log("🚀 Début création planning avec form:", form);
  console.log("🚀 selectedSalarieId:", selectedSalarieId);

  try {
    const profile = await fetchProfile();
    console.log("👤 Profil récupéré:", profile.data);
    const entrepriseId = profile.data.id;

    const salarieId = form.salarie_id || selectedSalarieId;
    const clientId = form.client_id;

    console.log("🔍 Vérifications:", { salarieId, clientId, entrepriseId });

    if (!salarieId) {
      alert("❌ Veuillez sélectionner un salarié valide !");
      return;
    }

    if (!clientId) {
      alert("❌ Veuillez sélectionner un client valide !");
      return;
    }

    const payload = {
      ...form,
      salarie_id: salarieId,
      client_id: clientId,
      entreprise_id: entrepriseId,
      nb_repetitions: parseInt(form.nb_repetitions) || 1,
    };

    console.log("📦 Payload à envoyer:", payload);

    await createPlanning(payload);
    console.log("✅ Planning créé avec succès");

    setShowForm(false);
    setForm({});

    const res = await fetchPlannings();
    console.log("🔄 Rechargement des plannings:", res.data);
    setEvents(formatEventsFromApi(res.data));

    alert("✅ Planning enregistré !");
  } catch (err) {
    console.error("❌ Erreur complète:", err);
    console.error("❌ Réponse erreur:", err.response?.data);
    alert("❌ Erreur lors de la création !");
  }
};

export const handleEventDrop = async ({ event, start, end }, setEvents) => {
  const updatedPayload = {
    ...event,
    date: moment(start).format("YYYY-MM-DD"),
    heure_debut: moment(start).format("HH:mm"),
    heure_fin: moment(end).format("HH:mm"),
  };

  try {
    await axios.put(`/plannings/${event.id}`, updatedPayload);

    // Rechargement propre des événements depuis l'API
    const res = await fetchPlannings();
    setEvents(formatEventsFromApi(res.data));

  } catch (error) {
    alert("❌ Erreur lors du déplacement !");
    console.error(error);
  }
};

export const handleDelete = async (event, setEvents) => {
  const confirm = window.confirm("❌ Supprimer cet événement ?");
  console.log("🚨 Suppression demandée pour l'événement ID :", event.id);
  if (!confirm) return;

  try {
    console.log("🗑️ Suppression en cours...");
    await axios.delete(`/plannings/${event.id}`);
    console.log("✅ Suppression réussie côté API");

    // ✅ Meilleure approche = recharger la liste depuis l'API
    const res = await fetchPlannings();
    console.log("🔄 Rechargement des plannings après suppression:", res.data);
    setEvents(formatEventsFromApi(res.data));

    alert("🗑️ Événement supprimé !");
  } catch (err) {
    console.error("❌ Erreur suppression :", err);
    console.error("❌ Détails erreur :", err.response?.data);
    alert("Erreur lors de la suppression !");
  }
};

export const copyEventToClipboardAndForm = (event, setForm, setShowForm) => {
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
};
