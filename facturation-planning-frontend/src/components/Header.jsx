import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Header.css";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fonction pour générer les breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [];

    const routeMap = {
      '/': { name: 'Accueil', icon: '🏠' },
      '/planning': { name: 'Planning', icon: '📅' },
      '/devis/creer': { name: 'Créer un devis', icon: '✨' },
      '/devis/manager': { name: 'Gérer les devis', icon: '📋' },
      '/devis/liste': { name: 'Liste des devis', icon: '📋' },
      '/factures': { name: 'Factures', icon: '🧾' },
      '/documents': { name: 'Documents', icon: '📁' },
      '/clients/ajouter': { name: 'Nouveau client', icon: '👤' },
      '/clients/gestion': { name: 'Gérer les clients', icon: '👥' },
      '/salarie/ajouter': { name: 'Nouveau salarié', icon: '🤝' },
      '/salaries/gestion': { name: 'Gérer les salariés', icon: '👨‍💼' },
      '/login': { name: 'Connexion', icon: '🔐' },
      '/register': { name: 'Inscription', icon: '📝' }
    };

    // Gestion des routes dynamiques
    if (path.startsWith('/devis/') && path !== '/devis' && path !== '/devis/manager' && path !== '/devis/liste') {
      breadcrumbs.push({ name: 'Devis', icon: '📋', path: '/devis/manager' });
      breadcrumbs.push({ name: 'Détails', icon: '👁️', path: path });
    } else if (routeMap[path]) {
      breadcrumbs.push(routeMap[path]);
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentRoute = breadcrumbs[breadcrumbs.length - 1];

  return (
    <header>
      <div className="header-left">
        <button
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          className="toggle-sidebar-btn"
        >
          📂
        </button>

        <div className="breadcrumb-section">
          {currentRoute && (
            <>
              <span className="current-page-icon">{currentRoute.icon}</span>
              <h1 className="header-title">{currentRoute.name}</h1>
            </>
          )}

          {breadcrumbs.length > 1 && (
            <div className="breadcrumb-trail">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="breadcrumb-item">
                  {index > 0 && <span className="breadcrumb-separator">›</span>}
                  <span className="breadcrumb-text">
                    {crumb.icon} {crumb.name}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {isAuthenticated && (
          <>
            <div className="quick-actions">
              {location.pathname === '/planning' ? (
                // Actions spécifiques au planning
                <>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('planning:newEvent'))}
                    title="Ajouter un planning"
                    className="quick-action-btn primary"
                  >
                    ➕ Ajouter
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('planning:export'))}
                    title="Exporter le planning"
                    className="quick-action-btn"
                  >
                    📤 Exporter
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('planning:refresh'))}
                    title="Actualiser le planning"
                    className="quick-action-btn"
                  >
                    🔄 Actualiser
                  </button>
                </>
              ) : (
                // Actions générales
                <>
                  <button
                    onClick={() => navigate('/devis/creer')}
                    title="Créer un devis rapidement (Ctrl+D)"
                    className="quick-action-btn"
                  >
                    ✨ Devis
                  </button>
                  <button
                    onClick={() => navigate('/planning')}
                    title="Aller au planning (Ctrl+P)"
                    className="quick-action-btn"
                  >
                    📅 Planning
                  </button>
                </>
              )}
            </div>

            <div className="user-actions">
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="logout-btn"
              >
                🚪 Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
