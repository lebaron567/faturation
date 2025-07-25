import React from 'react';

const CustomEvent = ({ event, title, onRightClick }) => {
  const handleContextMenu = (e) => {
    e.preventDefault(); // Bloque le menu natif
    if (onRightClick) {
      onRightClick(event, e);
    }
  };

  // Déterminer le type d'événement et sa couleur
  const getEventType = (event) => {
    if (event.prestation?.toLowerCase().includes('réunion') ||
      event.objet?.toLowerCase().includes('réunion')) {
      return 'meeting';
    }
    if (event.prestation?.toLowerCase().includes('tâche') ||
      event.objet?.toLowerCase().includes('tâche')) {
      return 'task';
    }
    if (event.prestation?.toLowerCase().includes('échéance') ||
      event.objet?.toLowerCase().includes('deadline')) {
      return 'deadline';
    }
    return 'default';
  };

  const eventType = getEventType(event);

  // Icônes par type d'événement
  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting':
        return '👥';
      case 'task':
        return '📋';
      case 'deadline':
        return '⚠️';
      default:
        return '📅';
    }
  };

  // Calculer la durée de l'événement
  const getDuration = () => {
    if (event.start && event.end) {
      const duration = Math.round((event.end - event.start) / (1000 * 60 * 60 * 100)) / 10;
      return duration > 0 ? `${duration}h` : '';
    }
    return '';
  };

  return (
    <div
      className={`custom-event event-${eventType}`}
      onContextMenu={handleContextMenu}
      style={{
        height: "100%",
        width: "100%",
        cursor: "context-menu",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "4px 6px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        overflow: "hidden"
      }}
    >
      <div className="event-header" style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontWeight: "600"
      }}>
        <span className="event-icon">{getEventIcon(eventType)}</span>
        <span className="event-title" style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1
        }}>
          {title || event.objet}
        </span>
      </div>

      <div className="event-details" style={{ fontSize: "0.65rem", opacity: "0.9" }}>
        {event.client_nom && (
          <div className="event-client" style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            marginBottom: "2px"
          }}>
            <span>🏢</span>
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {event.client_nom}
            </span>
          </div>
        )}

        <div className="event-meta" style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "4px"
        }}>
          {getDuration() && (
            <span className="event-duration">⏱️ {getDuration()}</span>
          )}
          {event.taux_horaire && (
            <span className="event-rate">💰 {event.taux_horaire}€</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomEvent;
