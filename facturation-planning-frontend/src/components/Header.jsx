import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ isAuthenticated, setIsAuthenticated, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // ❌ Supprime le token
    setIsAuthenticated(false); // 🔄 Met à jour l'état
    navigate("/login"); // 🔄 Redirige vers la page de connexion
  };


  return (
    <header>
      <button onClick={toggleSidebar} style={{ marginRight: "20px" }}>
        📂
      </button>

      {isAuthenticated && <button onClick={handleLogout}>🚪 Se déconnecter</button>}
    </header>
  );
};

export default Header;
