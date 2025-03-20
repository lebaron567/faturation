import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";

const localizer = momentLocalizer(moment);

const Planning = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/plannings").then((response) => {
      const formattedEvents = response.data.map((event) => ({
        title: `${event.type_evenement} - ${event.objet} (Client: ${event.client_id})`,
        start: new Date(`${event.date}T${event.heure_debut}`),
        end: new Date(`${event.date}T${event.heure_fin}`),
        allDay: false,
        salarie: event.salarie_id,
        prestation: event.prestation,
        facturation: event.facturation,
        tauxHoraire: event.taux_horaire,
        forfaitHT: event.forfait_ht,
      }));
      setEvents(formattedEvents);
    });
  }, []);

  return (
    <div>
      <h2>Planning des Salariés</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
      <div className="details">
        {events.map((event, index) => (
          <div key={index} className="event-details">
            <h3>{event.title}</h3>
            <p><strong>Salarié ID :</strong> {event.salarie}</p>
            <p><strong>Prestation :</strong> {event.prestation}</p>
            <p><strong>Facturation :</strong> {event.facturation}</p>
            <p><strong>Taux Horaire :</strong> {event.tauxHoraire} €</p>
            <p><strong>Forfait HT :</strong> {event.forfaitHT} €</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Planning;
