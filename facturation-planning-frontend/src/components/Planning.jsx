import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import "../styles/Planning.css";

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

  // Mettre à jour les champs du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envoi à l'API
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      
      setShowForm(false);
      setForm({}); // Réinitialiser le formulaire

      setEvents((prev) => [
        ...prev,
        {
          title: `${form.type_evenement} - ${form.objet}`,
          start: new Date(`${form.date}T${form.heure_debut}`),
          end: new Date(`${form.date}T${form.heure_fin}`),
          ...form,
        },
      ]);
    } catch (err) {
      alert("❌ Erreur lors de la création");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Planning des Salariés</h2>

      <button onClick={() => setShowForm(true)}>➕ Ajouter un planning</button>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week"]}
        view={view}
        onView={(v) => setView(v)}
        date={date} // ✅ contrôle la date actuelle affichée
        onNavigate={(newDate) => setDate(newDate)} // ✅ permet "Suivant", "Précédent", etc.
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
        <>
          <div className="modal-overlay" onClick={() => setShowForm(false)} />
          <div className="modal-content">
            <h3>Ajouter un Planning</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input name="date" type="date" required onChange={handleChange} value={form.date || ""} />
              <input name="heure_debut" type="time" required onChange={handleChange} value={form.heure_debut || ""} />
              <input name="heure_fin" type="time" required onChange={handleChange} value={form.heure_fin || ""} />
              <input name="type_evenement" placeholder="Type (ex: Intervention)" onChange={handleChange} required />
              <input name="objet" placeholder="Objet" onChange={handleChange} required />
              <input name="prestation" placeholder="Prestation" onChange={handleChange} />
              <input name="salarie_id" type="number" placeholder="ID Salarié" onChange={handleChange} required />
              <input name="client_id" type="number" placeholder="ID Client" onChange={handleChange} required />
              <select name="facturation" onChange={handleChange}>
                <option value="">-- Facturation --</option>
                <option value="Comptabilisé">Comptabilisé</option>
                <option value="Non Comptabilisé">Non Comptabilisé</option>
              </select>
              <input name="taux_horaire" type="number" placeholder="Taux horaire (€)" onChange={handleChange} />
              <input name="forfait_ht" type="number" placeholder="Forfait HT (€)" onChange={handleChange} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="submit">✅ Enregistrer</button>
                <button type="button" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};



export default Planning;
