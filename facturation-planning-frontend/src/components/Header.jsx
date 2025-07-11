import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardShortcuts from "./KeyboardShortcuts";
import "../styles/Header.css";

const Header = ({ isAuthenticated, setIsAuthenticated, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  // Fonction pour générer les breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [];

    const routeMap = {
      '/': { name: 'Accueil', icon: '🏠' },
      '/planning': { name: 'Planning', icon: '📅' },
      '/devis': { name: 'Créer un devis', icon: '✨' },
      '/devis/manager': { name: 'Gérer les devis', icon: '📋' },
      '/devis/liste': { name: 'Liste des devis', icon: '📋' },
      '/factures': { name: 'Factures', icon: '🧾' },
      '/documents': { name: 'Documents', icon: '📁' },
      '/clients/ajouter': { name: 'Nouveau client', icon: '👤' },
      '/salarie/ajouter': { name: 'Nouveau salarié', icon: '🤝' },
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
              <button
                onClick={() => navigate('/devis')}
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

        <KeyboardShortcuts isAuthenticated={isAuthenticated} />
      </div>
    </header>
  );
};

export default Header;
