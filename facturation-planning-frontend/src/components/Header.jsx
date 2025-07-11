import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

const Header = ({ isAuthenticated, setIsAuthenticated, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <header>
      <div className="header-left">
        <button onClick={toggleSidebar} title="Toggle Sidebar">
          📂
        </button>
        <h1 className="header-title">Facturation & Planning</h1>
      </div>

      <div className="header-right">
        {isAuthenticated && (
          <button onClick={handleLogout} title="Se déconnecter">
            🚪 Se déconnecter
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
