import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // ❌ Supprime le token
    setIsAuthenticated(false); // 🔄 Met à jour l'état
    navigate("/login"); // 🔄 Redirige vers la page de connexion
  };

  return (
    <header>
      <h1>Gestion de Facturation</h1>
      {isAuthenticated && <button onClick={handleLogout}>🚪 Se déconnecter</button>}
    </header>
  );
};

export default Header;
