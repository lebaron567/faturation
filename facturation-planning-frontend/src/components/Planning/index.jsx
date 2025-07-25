import React, { useState, useEffect, useRef } from "react";
import { DnDCalendar, localizer } from "./DnDCalendar";
import { calendarMessages } from "./messages";
import { handleCreate, handleEventDrop, handleDelete, copyEventToClipboardAndForm } from "./handlers";
import { fetchPlannings, fetchSalaries, fetchClients } from "./api";
import { formatEventsFromApi, extractDateInfo, handleChange } from "./utils";
import PlanningForm from "./PlanningForm";
import CustomEvent from "./CustomEvent";
import PlanningSidebar from "./PlanningSidebar"; // importe la nouvelle sidebar


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
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);



  // 🆕 Pour gérer le clic sur un événement
  const [selectedEvent, setSelectedEvent] = useState(null);
  const menuRef = useRef();


  useEffect(() => {
    const escListener = (e) => {
      if (e.key === "Escape") {
        setShowForm(false);
        setSelectedEvent(null);
      }
    };
    window.addEventListener("keydown", escListener);
    return () => window.removeEventListener("keydown", escListener);
  }, []);

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
    console.log("🔄 Chargement des données Planning...");

    fetchSalaries().then((res) => {
      console.log("👥 Salariés récupérés:", res.data);
      setSalaries(res.data);
    }).catch((err) => {
      console.error("❌ Erreur salariés:", err);
    });

    fetchPlannings().then((res) => {
      console.log("📅 Plannings bruts récupérés:", res.data);
      const formattedEvents = formatEventsFromApi(res.data);
      console.log("📅 Événements formatés:", formattedEvents);

      // 🔍 Log détaillé du premier événement
      if (formattedEvents.length > 0) {
        console.log("🔍 Premier événement détaillé:", {
          title: formattedEvents[0].title,
          start: formattedEvents[0].start,
          end: formattedEvents[0].end,
          startIsValid: !isNaN(formattedEvents[0].start?.getTime()),
          endIsValid: !isNaN(formattedEvents[0].end?.getTime()),
          allProperties: formattedEvents[0]
        });
      }

      setEvents(formattedEvents);
    }).catch((err) => {
      console.error("❌ Erreur plannings:", err);
    });

    fetchClients().then((res) => {
      console.log("🏢 Clients récupérés:", res.data);
      setClients(res.data);
    }).catch((err) => {
      console.error("❌ Erreur clients:", err);
    });
  }, []);

  // Gestionnaires d'événements pour les actions du header
  useEffect(() => {
    const handleNewEvent = () => {
      setForm({});
      setShowForm(true);
    };

    const handleExport = () => {
      // TODO: Implémenter l'export du planning
      console.log("📤 Export du planning...");
    };

    const handleRefresh = () => {
      // Recharger les données
      fetchPlannings().then((res) => {
        const formattedEvents = formatEventsFromApi(res.data);
        setEvents(formattedEvents);
      });
    };

    // Écouter les événements personnalisés du header
    window.addEventListener('planning:newEvent', handleNewEvent);
    window.addEventListener('planning:export', handleExport);
    window.addEventListener('planning:refresh', handleRefresh);

    // Nettoyage
    return () => {
      window.removeEventListener('planning:newEvent', handleNewEvent);
      window.removeEventListener('planning:export', handleExport);
      window.removeEventListener('planning:refresh', handleRefresh);
    };
  }, []);

  let filteredEvents = events;
  console.log("🔍 Événements avant filtrage:", events.length);
  console.log("🔍 Filtres actifs:", { selectedSalarieId, selectedClientId });

  if (selectedSalarieId && selectedSalarieId !== "") {
    console.log("🔍 Filtrage par salarié:", selectedSalarieId);
    filteredEvents = filteredEvents.filter(
      (e) => String(e.salarie_id) === String(selectedSalarieId)
    );
    console.log("🔍 Événements après filtre salarié:", filteredEvents.length);
  }
  if (selectedClientId && selectedClientId !== "") {
    console.log("🔍 Filtrage par client:", selectedClientId);
    filteredEvents = filteredEvents.filter(
      (e) => String(e.client_id) === String(selectedClientId)
    );
    console.log("🔍 Événements après filtre client:", filteredEvents.length);
  }

  console.log("🔍 Événements finaux envoyés au calendrier:", filteredEvents.length, filteredEvents);

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

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.nom} (${client.email})` : `ID: ${clientId}`;
  };



  return (
    <div className="planning-page-wrapper">
      <PlanningSidebar
        salaries={salaries}
        selectedSalarieId={selectedSalarieId}
        setSelectedSalarieId={setSelectedSalarieId}
        clients={clients}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        events={events}
      />



      <div className="planning-main-content" onContextMenu={(e) => e.preventDefault()}>
        <div className="planning-wrapper">
          <div className="calendar-container">
            <DnDCalendar
              popup
              localizer={localizer}
              events={filteredEvents}
              onEventDrop={(info) => handleEventDrop(info, setEvents)}
              onEventResize={(info) => handleEventDrop(info, setEvents)}
              min={new Date(0, 0, 0, 7, 0)} // 👈 début à 6h
              max={new Date(0, 0, 0, 19, 0)} // (optionnel) fin à 22h par exemple
              dayLayoutAlgorithm="no-overlap"
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
          </div>

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
              <p><strong>Client :</strong> {getClientName(selectedEvent.client_id)}</p>
              <p><strong>Facturation :</strong> {selectedEvent.facturation}</p>
              <p><strong>Taux horaire :</strong> {selectedEvent.taux_horaire} €</p>
              <p><strong>Forfait HT :</strong> {selectedEvent.forfait_ht} €</p>

              <button onClick={() => copyEventToClipboardAndForm(selectedEvent, setForm, setShowForm)}>
                📋 Copier
              </button>
              <button onClick={() => {
                handleDelete(selectedEvent, setEvents);
                setSelectedEvent(null); // Ferme le menu après suppression
              }}>🗑️ Supprimer</button>
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
              clients={clients}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Planning;
