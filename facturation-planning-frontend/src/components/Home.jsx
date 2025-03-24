import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Bienvenue sur l'application de Gestion de Facturation</h1>
      <p>Gérez vos factures, plannings et bien plus encore.</p>

      <nav className="home-nav">
        <Link to="/factures" className="home-link">📄 Gérer les Factures</Link>
        <Link to="/planning" className="home-link">📅 Voir le Planning</Link>
        <Link to="/profile" className="home-link">👤 Mon Profil</Link>
      </nav>
    </div>
  );
};

export default Home;
