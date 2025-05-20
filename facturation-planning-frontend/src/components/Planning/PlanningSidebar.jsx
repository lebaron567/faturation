import React from "react";
import "../../styles/PlanningSidebar.css";

const PlanningSidebar = ({ salaries,
    selectedSalarieId,
    setSelectedSalarieId,
    clients,
    selectedClientId,
    setSelectedClientId, }) => {
    return (
        <div className="planning-sidebar">
            <h3>Filtres</h3>

            <label>Intervenant</label>
            <select
                value={selectedSalarieId || ""}
                onChange={(e) => setSelectedSalarieId(e.target.value || null)}
            >
                <option value="">Tous</option> {/* ✅ modifié ici */}
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
            <select
                value={selectedClientId || ""}
                onChange={(e) => setSelectedClientId(e.target.value || null)}
            >
                <option value="">Tous</option>
                {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nom} ({c.email})
                    </option>
                ))}
            </select>

            <label>Voir</label>
            <select><option>Tous</option></select>
            <button
                onClick={() => {
                    setSelectedSalarieId(null);
                    setSelectedClientId(null);
                }}
                style={{ marginTop: "10px" }}
            >
                🔄 Réinitialiser
            </button>
        </div>
    );

};

export default PlanningSidebar;
