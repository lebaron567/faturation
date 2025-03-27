import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "../axiosInstance"; // au lieu de "axios"

import "../styles/Planning.css";
import PlanningForm from "./PlanningForm";

moment.locale("fr");
const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Toute la journée",
  previous: "Précédent",
  next: "Suivant",
  today: "Aujourd’hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun événement",
};

const Planning = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [salaries, setSalaries] = useState([]); // ✅ manquait
  const [selectedSalarieId, setSelectedSalarieId] = useState(null); // ✅ manquait

  // Charger les événements existants
  useEffect(() => {
    axios.get("http://localhost:8080/plannings").then((res) => {
      const formatted = res.data.map((e) => ({
        title: `${e.type_evenement} - ${e.objet}`,
        start: new Date(`${e.date}T${e.heure_debut}`),
        end: new Date(`${e.date}T${e.heure_fin}`),
        ...e,
      }));
      setEvents(formatted);
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8080/salaries", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      setSalaries(res.data);
      if (res.data.length > 0) {
        setSelectedSalarieId(res.data[0].id); // ✅ sélectionne automatiquement le premier salarié
      }
    });
  }, []);

  // Mettre à jour les champs du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const eventsToDisplay = selectedSalarieId
    ? events.filter((e) => String(e.salarie_id) === String(selectedSalarieId))
    : events;


  // Envoi à l'API
  const handleCreate = async (e) => {
    e.preventDefault();
    console.log("🔍 Formulaire envoyé :", form);

    try {
      // Récupérer le profil pour obtenir entreprise_id
      const profileRes = await axios.get("http://localhost:8080/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const entrepriseId = profileRes.data.id;

      // Ajout de l'ID salarié et entreprise au planning
      const payload = {
        ...form,
        salarie_id: selectedSalarieId,
        entreprise_id: entrepriseId,
      };
      console.log("📦 Payload envoyé à l'API :", payload);

      await axios.post("http://localhost:8080/plannings", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setShowForm(false);
      setForm({});

      // Recharge les événements depuis la BDD
      const res = await axios.get("http://localhost:8080/plannings");
      const formatted = res.data.map((e) => ({
        title: `${e.type_evenement} - ${e.objet}`,
        start: new Date(`${e.date}T${e.heure_debut}`),
        end: new Date(`${e.date}T${e.heure_fin}`),
        ...e,
      }));
      setEvents(formatted);

      alert("✅ Planning enregistré !");
    } catch (err) {
      alert("❌ Erreur lors de la création !");
      console.error(err);
    }
  };


  return (
    <div>
      <h2>Planning des Salariés</h2>

      <button onClick={() => setShowForm(true)}>➕ Ajouter un planning</button>
      {!salaries.length ? <p>Chargement des salariés...</p> : (
        <>
          <label>Filtrer par salarié :</label>
          <select value={selectedSalarieId || ""} onChange={(e) => setSelectedSalarieId(e.target.value || null)}>
            <option disabled value="">-- Sélectionner un salarié --</option>
            {salaries.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom} ({s.email})
              </option>
            ))}
          </select>
        </>
      )}
      <Calendar
        localizer={localizer}
        events={eventsToDisplay} // ✅ Garde uniquement celle-ci
        startAccessor="start"
        endAccessor="end"
        views={["month", "week"]}
        view={view}
        onView={(v) => setView(v)}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        messages={messages}
        selectable
        onSelectSlot={(slotInfo) => {
          const date = moment(slotInfo.start).format("YYYY-MM-DD");
          const heure_debut = moment(slotInfo.start).format("HH:mm");
          const heure_fin = moment(slotInfo.end).format("HH:mm");
          setForm({ ...form, date, heure_debut, heure_fin });
          setShowForm(true);
        }}
        style={{ height: 600, marginTop: "20px" }}
      />

      {showForm && (
        <PlanningForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          selectedSalarieId={selectedSalarieId}
          salaries={salaries}
        />

      )}
    </div>
  );
};



export default Planning;
