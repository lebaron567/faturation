import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ collapsed, toggleSidebar }) => {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {collapsed ? "➡️" : "⬅️"}
      </button>

      <div className={`sidebar-content ${collapsed ? "hidden" : ""}`}>
        <h3>📋 Menu</h3>
        <nav>
          <Link to="/">Accueil</Link>
          <Link to="/planning">Planning</Link>
          <Link to="/factures">Factures</Link>
          <Link to="/salarie/ajouter">Ajouter salarié</Link>
          <Link to="/login">Connexion</Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
