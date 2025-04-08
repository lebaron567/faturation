import React, { useState, useEffect } from "react";
import { DnDCalendar, localizer } from "./DnDCalendar";
import { calendarMessages } from "./messages";
import { handleCreate, handleEventDrop } from "./handlers";
import { fetchPlannings, fetchSalaries } from "./api";
import { formatEventsFromApi, extractDateInfo, handleChange } from "./utils";
import PlanningForm from "./PlanningForm";

import "moment/locale/fr";
import "../../styles/Planning.css";

const Planning = () => {
  const [form, setForm] = useState({});
  const [selectedSalarieId, setSelectedSalarieId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("week");
  const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });


  // 🆕 Pour gérer le clic sur un événement
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchSalaries().then((res) => {
      setSalaries(res.data);
      if (res.data.length > 0) setSelectedSalarieId(res.data[0].id);
    });
    fetchPlannings().then((res) => {
      setEvents(formatEventsFromApi(res.data));
    });
  }, []);

  const filteredEvents = selectedSalarieId
    ? events.filter((e) => String(e.salarie_id) === String(selectedSalarieId))
    : events;

  const handleCopy = (event) => {
    const newEvent = {
      ...event,
      id: Date.now(), // nouvel ID temporaire
      title: `[COPIE] ${event.title}`,
    };
    setEvents((prev) => [...prev, newEvent]);
    setSelectedEvent(null);
  };

  const handleDelete = (event) => {
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    setSelectedEvent(null);
  };

  return (
    <div className="planning-wrapper">
      <h2>Planning des Salariés</h2>

      <button onClick={() => setShowForm(true)}>➕ Ajouter un planning</button>

      <label>Filtrer par salarié :</label>
      <select
        value={selectedSalarieId || ""}
        onChange={(e) => setSelectedSalarieId(e.target.value || null)}
      >
        <option disabled value="">
          -- Sélectionner un salarié --
        </option>
        {salaries.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nom} ({s.email})
          </option>
        ))}
      </select>

      <DnDCalendar
        localizer={localizer}
        events={filteredEvents}
        onEventDrop={(info) => handleEventDrop(info, setEvents)}
        onEventResize={(info) => handleEventDrop(info, setEvents)}
        onSelectEvent={(event, e) => {
          e.preventDefault(); // éviter comportement par défaut
          setSelectedEvent(event);
          setContextPosition({ x: e.clientX, y: e.clientY });
        }}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week"]}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        messages={calendarMessages}
        selectable
        onSelectSlot={(slotInfo) => {
          const { date, heure_debut, heure_fin } = extractDateInfo(slotInfo);
          setForm({ ...form, date, heure_debut, heure_fin });
          setShowForm(true);
        }}
        style={{ height: 600, marginTop: "20px" }}
      />

      {/* ✅ Menu contextuel simple */}
      {selectedEvent && (
        <div
          className="context-menu"
          style={{ top: contextPosition.y, left: contextPosition.x }}
        >
          <p>{selectedEvent.title}</p>
          <button onClick={() => handleCopy(selectedEvent)}>📋 Copier</button>
          <button onClick={() => handleDelete(selectedEvent)}>🗑️ Supprimer</button>
          <button onClick={() => setSelectedEvent(null)}>❌ Fermer</button>
        </div>
      )}

      {showForm && (
        <PlanningForm
          form={form}
          handleChange={(e) => handleChange(e, form, setForm)}
          handleSubmit={(e) =>
            handleCreate(e, form, selectedSalarieId, setForm, setShowForm, setEvents)
          }
          selectedSalarieId={selectedSalarieId}
          salaries={salaries}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Planning;
