import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ collapsed, toggleSidebar, isPlanningPage }) => {
  const location = useLocation();

  const menuItems = [
    {
      section: "🏠 Tableau de bord",
      items: [
        { path: "/", label: " Accueil", icon: "🏠" },
        { path: "/planning", label: " Planning", icon: "📅" }
      ]
    },
    {
      section: "💼 Gestion commerciale",
      items: [
        { path: "/devis/creer", label: " Créer un devis", icon: "➕" },
        { path: "/devis/manager", label: " Gérer les devis", icon: "📋" },
        { path: "/factures/creer", label: " Créer une facture", icon: "➕" },
        { path: "/factures", label: " Gérer les factures", icon: "📊" },
        { path: "/facturation-mensuelle", label: " Facturation mensuelle", icon: "💰" },
        { path: "/documents", label: " Documents", icon: "📁" }
      ]
    },
    {
      section: "👥 Contacts",
      items: [
        { path: "/clients/ajouter", label: " Nouveau client", icon: "👤" },
        { path: "/clients/gestion", label: " Gérer les clients", icon: "👥" },
        { path: "/salarie/ajouter", label: " Nouveau salarié", icon: "🤝" },
        { path: "/salaries/gestion", label: " Gérer les salariés", icon: "👨‍💼" }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Bouton flottant quand la sidebar est cachée */}
      {collapsed && (
        <button
          className="retract-button floating-menu-btn"
          onClick={toggleSidebar}
          title="Afficher le menu"
          style={{
            position: 'fixed',
            top: '80px',
            left: '10px',
            zIndex: 1001,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          ➡️
        </button>
      )}

      <div className={`sidebar ${collapsed ? 'hidden' : ''} ${isPlanningPage ? 'sidebar-planning' : ''}`}>
        <div className="sidebar-header">
          <button className="retract-button" onClick={toggleSidebar} title={collapsed ? "Afficher le menu" : "Réduire le menu"}>
            {collapsed ? "➡️" : "⬅️"}
          </button>
          <div className="sidebar-brand">
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
    </>
  );
};

export default Sidebar;
