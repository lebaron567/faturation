import React from "react";
import "../../styles/PlanningSidebar.css";

const PlanningSidebar = ({ salaries, selectedSalarieId, setSelectedSalarieId }) => {
    return (
        <div className="planning-sidebar">
            <h3>Filtres</h3>

            <label>Intervenant</label>
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

            <label>Entité</label>
            <select><option>Tous</option></select>

            <label>Statut</label>
            <select><option>Tous</option></select>

            <label>Client</label>
            <select><option>Client</option></select>

            <label>Voir</label>
            <select><option>Tous</option></select>
        </div>
    );
};

export default PlanningSidebar;
