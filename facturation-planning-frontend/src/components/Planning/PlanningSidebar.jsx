import React, { useState, useEffect } from "react";
import "../../styles/PlanningSidebar.css";

const PlanningSidebar = ({
    salaries,
    selectedSalarieId,
    setSelectedSalarieId,
    clients,
    selectedClientId,
    setSelectedClientId,
    events = []
}) => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        todayEvents: 0,
        weekEvents: 0,
        monthEvents: 0
    });

    // Calculer les statistiques
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const todayEvents = events.filter(event => {
            const eventDate = new Date(event.start);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        }).length;

        const weekEvents = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= startOfWeek && eventDate <= new Date();
        }).length;

        const monthEvents = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= startOfMonth && eventDate <= new Date();
        }).length;

        setStats({
            totalEvents: events.length,
            todayEvents,
            weekEvents,
            monthEvents
        });
    }, [events]);

    const handleResetFilters = () => {
        setSelectedSalarieId(null);
        setSelectedClientId(null);
    };

    return (
        <div className="planning-sidebar">
            <div className="sidebar-content">
                {/* Header */}
                <div className="sidebar-header">
                    <h3 className="sidebar-title">Contrôles</h3>
                    <p className="sidebar-subtitle">Filtrez et gérez votre planning</p>
                </div>

                {/* Filtres */}
                <div className="filter-section">
                    <h4 className="filter-section-title">Filtres</h4>

                    <div className="filter-group">
                        <label className="filter-label">👤 Intervenant</label>
                        <select
                            className="filter-select"
                            value={selectedSalarieId || ""}
                            onChange={(e) => setSelectedSalarieId(e.target.value || null)}
                        >
                            <option value="">Tous les intervenants</option>
                            {salaries.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nom} ({s.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">🏢 Client</label>
                        <select
                            className="filter-select"
                            value={selectedClientId || ""}
                            onChange={(e) => setSelectedClientId(e.target.value || null)}
                        >
                            <option value="">Tous les clients</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nom} ({c.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">📋 Statut</label>
                        <select className="filter-select">
                            <option value="">Tous les statuts</option>
                            <option value="planifie">Planifié</option>
                            <option value="en_cours">En cours</option>
                            <option value="termine">Terminé</option>
                            <option value="annule">Annulé</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">🏭 Entité</label>
                        <select className="filter-select">
                            <option value="">Toutes les entités</option>
                            <option value="entreprise">Entreprise</option>
                            <option value="freelance">Freelance</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="sidebar-actions">
                    <button
                        className="sidebar-btn sidebar-btn-primary"
                        onClick={() => window.dispatchEvent(new CustomEvent('planning:newEvent'))}
                    >
                        ➕ Nouvel événement
                    </button>

                    <button
                        className="sidebar-btn reset-filters-button"
                        onClick={handleResetFilters}
                    >
                        🔄 Réinitialiser les filtres
                    </button>

                    <button className="sidebar-btn sidebar-btn-secondary">
                        📤 Exporter le planning
                    </button>
                </div>

                {/* Statistiques */}
                <div className="sidebar-stats">
                    <h4 className="stats-title">Aperçu</h4>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">{stats.todayEvents}</span>
                            <span className="stat-label">Aujourd'hui</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{stats.weekEvents}</span>
                            <span className="stat-label">Cette semaine</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{stats.monthEvents}</span>
                            <span className="stat-label">Ce mois</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{stats.totalEvents}</span>
                            <span className="stat-label">Total</span>
                        </div>
                    </div>
                </div>

                {/* Légende des statuts */}
                <div className="status-indicators">
                    <h4 className="status-indicators-title">🎨 Légende</h4>
                    <div className="status-legend">
                        <div className="status-item">
                            <div className="status-dot status-meeting"></div>
                            <span>Réunions</span>
                        </div>
                        <div className="status-item">
                            <div className="status-dot status-task"></div>
                            <span>Tâches</span>
                        </div>
                        <div className="status-item">
                            <div className="status-dot status-deadline"></div>
                            <span>Échéances</span>
                        </div>
                        <div className="status-item">
                            <div className="status-dot status-default"></div>
                            <span>Événements généraux</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanningSidebar;
