import React, { useState, useEffect, useRef } from "react";
import { DnDCalendar, localizer } from "./DnDCalendar";
import { calendarMessages } from "./messages";
import { handleCreate, handleEventDrop, handleDelete, copyEventToClipboardAndForm } from "./handlers";
import { fetchPlannings, fetchSalaries } from "./api";
import { formatEventsFromApi, extractDateInfo, handleChange } from "./utils";
import PlanningForm from "./PlanningForm";
import CustomEvent from "./CustomEvent";

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
  const menuRef = useRef();

  // 🆕 Pour gérer le clic sur un événement
  useEffect(() => {
    if (selectedEvent && menuRef.current) {
      const menu = menuRef.current;
      const { innerWidth, innerHeight } = window;
      const rect = menu.getBoundingClientRect();
      let x = contextPosition.x;
      let y = contextPosition.y;

      if (x + rect.width > innerWidth) {
        x = innerWidth - rect.width - 10; // décale vers la gauche
      }
      if (y + rect.height > innerHeight) {
        y = innerHeight - rect.height - 10; // décale vers le haut
      }

      setContextPosition({ x, y });
    }
  }, [selectedEvent, contextPosition.x, contextPosition.y]);

  // 🆕 Pour gérer le clic sur un événement
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

  // 🆕 Gestion du clic droit pour le menu contextuel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setSelectedEvent(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  return (
    <div className="planning-wrapper" onContextMenu={(e) => e.preventDefault()}>

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
        popup
        localizer={localizer}
        events={filteredEvents}
        onEventDrop={(info) => handleEventDrop(info, setEvents)}
        onEventResize={(info) => handleEventDrop(info, setEvents)}
        onSelectEvent={(event, e) => {
          if (e.type === "contextmenu") {
            e.preventDefault(); // ⛔ empêche le menu du navigateur
            setSelectedEvent(event);
            setContextPosition({ x: e.clientX, y: e.clientY });
          }
        }}

        onDoubleClickEvent={(event, e) => {
          // Si tu veux gérer un double-clic pour autre chose (édition ?)
          e.preventDefault();
        }}

        onContextMenu={(e) => e.preventDefault()} // bloquer globalement le clic droit dans la grille

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

        components={{
          event: (props) => (
            <CustomEvent
              {...props}
              onRightClick={(event, e) => {
                setSelectedEvent(event);
                setContextPosition({ x: e.clientX, y: e.clientY });
              }}
            />
          ),
        }}
      />

      {/* ✅ Menu contextuel simple */}
      {selectedEvent && (
        <div
          className="context-menu"
          ref={menuRef}
          style={{ top: contextPosition.y, left: contextPosition.x }}
        >
          <p><strong>{selectedEvent.title}</strong></p>
          <p><strong>Objet :</strong> {selectedEvent.objet}</p>
          <p><strong>Date :</strong> {selectedEvent.date}</p>
          <p><strong>Heure :</strong> {selectedEvent.heure_debut} - {selectedEvent.heure_fin}</p>
          <p><strong>Prestation :</strong> {selectedEvent.prestation}</p>
          <p><strong>Client :</strong> {selectedEvent.client_id}</p>
          <p><strong>Facturation :</strong> {selectedEvent.facturation}</p>
          <p><strong>Taux horaire :</strong> {selectedEvent.taux_horaire} €</p>
          <p><strong>Forfait HT :</strong> {selectedEvent.forfait_ht} €</p>

          <button onClick={() => copyEventToClipboardAndForm(selectedEvent, setForm, setShowForm)}>
            📋 Copier
          </button>
          <button onClick={() => handleDelete(selectedEvent, setEvents)}>🗑️ Supprimer</button>
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
