import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ collapsed, toggleSidebar }) => {
  if (collapsed) return null; // ← Ne rien afficher si replié

  return (
    <div className="sidebar">
      <button className="retract-button" onClick={toggleSidebar}>
        ⬅️
      </button>

      <div className="sidebar-content">
        <h3>📋 Menu</h3>
        <nav>
          <Link to="/">Accueil</Link>
          <Link to="/planning">Planning</Link>
          <Link to="/factures">Factures</Link>
          <Link to="/devis">Créer un devis</Link>
          <Link to="/documents">Documents</Link> {/* ← lien vers GestionDocuments */}
          <Link to="/clients/ajouter">Client</Link>
          <Link to="/salarie/ajouter">Ajouter salarié</Link>
          <Link to="/login">Connexion</Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
