import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import FactureForm from "./components/FactureForm";
import Planning from "./components/Planning/index";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import AddSalarie from "./components/AddSalarie";
import Sidebar from "./components/Sidebar";
import AjouterClient from "./components/AjouterClient";
import GestionDocuments from "./components/GestionDocuments";
import DevisFormComplet from "./components/DevisFormComplet";
import ListeDevis from "./components/ListeDevis";
import DevisDetails from "./components/DevisDetails";
import DevisManager from "./components/DevisManager";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

import "./App.css";

// Composant wrapper pour utiliser les hooks à l'intérieur du Router
function AppContent({ isAuthenticated, setIsAuthenticated }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Intégrer les raccourcis clavier (maintenant à l'intérieur du Router)
  useKeyboardShortcuts(isAuthenticated);

  return (
    <div className={`app-layout ${sidebarCollapsed ? "collapsed" : ""}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(prev => !prev)}
      />
      <div className="main-content">
        <Header
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          toggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        />
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/clients/ajouter" element={<AjouterClient />} />
          <Route
            path="/devis"
            element={isAuthenticated ? <DevisFormComplet /> : <Navigate to="/login" />}
          />
          <Route
            path="/devis/manager"
            element={isAuthenticated ? <DevisManager /> : <Navigate to="/login" />}
          />
          <Route
            path="/devis/:id"
            element={isAuthenticated ? <DevisDetails /> : <Navigate to="/login" />}
          />
          <Route
            path="/liste-devis"
            element={isAuthenticated ? <ListeDevis /> : <Navigate to="/login" />}
          />
          <Route
            path="/factures"
            element={isAuthenticated ? <FactureForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/planning"
            element={isAuthenticated ? <Planning /> : <Navigate to="/login" />}
          />
          <Route
            path="/salarie/ajouter"
            element={isAuthenticated ? <AddSalarie /> : <Navigate to="/login" />}
          />
          <Route
            path="/documents"
            element={isAuthenticated ? <GestionDocuments /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
    </Router>
  );
}

export default App;
