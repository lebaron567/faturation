import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();

  if (collapsed) return null;

  const menuItems = [
    {
      section: "🏠 Tableau de bord",
      items: [
        { path: "/", label: "📊 Accueil", icon: "🏠" },
        { path: "/planning", label: "📅 Planning", icon: "📅" }
      ]
    },
    {
      section: "💼 Gestion commerciale",
      items: [
        { path: "/devis", label: "✨ Créer un devis", icon: "➕" },
        { path: "/devis/manager", label: "📋 Gérer les devis", icon: "📋" },
        { path: "/factures/creer", label: "🧾 Créer une facture", icon: "➕" },
        { path: "/factures", label: "📊 Gérer les factures", icon: "📊" },
        { path: "/documents", label: "📁 Documents", icon: "📁" }
      ]
    },
    {
      section: "👥 Contacts",
      items: [
        { path: "/clients/ajouter", label: "👤 Nouveau client", icon: "👤" },
        { path: "/salarie/ajouter", label: "🤝 Nouveau salarié", icon: "🤝" }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="retract-button" onClick={toggleSidebar} title="Réduire le menu">
          ⬅️
        </button>
        <div className="sidebar-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-text">Facturation</span>
        </div>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((section, index) => (
            <div key={index} className="nav-section">
              <h4 className="section-title">{section.section}</h4>
              <ul className="nav-items">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item">
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                      title={item.label}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-text">{item.label}</span>
                      {isActive(item.path) && <span className="active-indicator">●</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
