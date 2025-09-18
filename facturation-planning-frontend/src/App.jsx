import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthErrorHandler from "./components/AuthErrorHandler";
import Home from "./components/Home";
import FactureManager from "./components/FactureManager";
import FactureFormComplet from "./components/FactureFormComplet";
import FactureDetails from "./components/FactureDetails";
import Planning from "./components/Planning/index";
import PlanningTest from "./components/PlanningTest"; // Nouveau composant de test
import JWTDiagnostic from "./components/JWTDiagnostic"; // Diagnostic JWT
import LoginDebug from "./components/LoginDebug"; // Debug de connexion
import SimpleLogin from "./components/SimpleLogin"; // Test de connexion simple
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
import FacturationMensuelle from "./components/FacturationMensuelle";
import GestionClients from "./components/GestionClients";
import GestionSalaries from "./components/GestionSalaries";
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
  const isPlanningPage = location.pathname === '/planning' || location.pathname === '/planning-test' || location.pathname === '/jwt-diagnostic';

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
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login-debug" element={<LoginDebug />} />
          <Route path="/simple-login" element={<SimpleLogin />} />

          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/ajouter"
            element={
              <ProtectedRoute>
                <AjouterClient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/gestion"
            element={
              <ProtectedRoute>
                <GestionClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salaries/gestion"
            element={
              <ProtectedRoute>
                <GestionSalaries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis"
            element={
              <ProtectedRoute>
                <DevisManager />
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
            path="/devis/creer"
            element={
              <ProtectedRoute>
                <DevisFormComplet />
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
            path="/devis/:id/edit"
            element={
              <ProtectedRoute>
                <DevisFormComplet />
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
            path="/facturation-mensuelle"
            element={
              <ProtectedRoute>
                <FacturationMensuelle />
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
            path="/planning-test"
            element={
              <ProtectedRoute>
                <PlanningTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jwt-diagnostic"
            element={
              <ProtectedRoute>
                <JWTDiagnostic />
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

          {/* Route par défaut - redirige vers la page d'accueil si authentifié, sinon vers login */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/" replace />
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
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
