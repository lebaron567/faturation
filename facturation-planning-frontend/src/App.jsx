import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthErrorHandler from "./components/AuthErrorHandler";
import Home from "./components/Home";
import FactureManager from "./components/FactureManager";
import FactureFormComplet from "./components/FactureFormComplet";
import FactureDetails from "./components/FactureDetails";
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
import { useAuth } from "./contexts/AuthContext";

import "./App.css";

// Composant wrapper pour utiliser les hooks à l'intérieur du Router
function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Intégrer les raccourcis clavier (maintenant à l'intérieur du Router)
  useKeyboardShortcuts(isAuthenticated);

  // Déterminer si nous sommes sur la page de planning
  const isPlanningPage = location.pathname === '/planning';

  return (
    <div className={`app-layout ${sidebarCollapsed ? "collapsed" : ""} ${isPlanningPage ? "planning-layout" : ""}`}>
      <AuthErrorHandler />
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        isPlanningPage={isPlanningPage}
      />
      <div className={`main-content ${isPlanningPage ? 'planning-page' : ''}`}>
        <Header
          toggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées */}
          <Route
            path="/clients/ajouter"
            element={
              <ProtectedRoute>
                <AjouterClient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis"
            element={
              <ProtectedRoute>
                <DevisFormComplet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis/manager"
            element={
              <ProtectedRoute>
                <DevisManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis/:id"
            element={
              <ProtectedRoute>
                <DevisDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liste-devis"
            element={
              <ProtectedRoute>
                <ListeDevis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/factures"
            element={
              <ProtectedRoute>
                <FactureManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/factures/creer"
            element={
              <ProtectedRoute>
                <FactureFormComplet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/factures/:id"
            element={
              <ProtectedRoute>
                <FactureDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/factures/:id/edit"
            element={
              <ProtectedRoute>
                <FactureFormComplet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planning"
            element={
              <ProtectedRoute>
                <Planning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salarie/ajouter"
            element={
              <ProtectedRoute>
                <AddSalarie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <GestionDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
