import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import FactureForm from "./components/FactureForm";
import Planning from "./components/Planning";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import AddSalarie from "./components/AddSalarie";
import Sidebar from "./components/Sidebar"; import AjouterClient from "./components/AjouterClient";

// ...

import "./App.css"; // Assure-toi d'importer les styles

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return (
    <Router>
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
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/factures" element={isAuthenticated ? <FactureForm /> : <Navigate to="/login" />} />
            <Route path="/planning" element={isAuthenticated ? <Planning /> : <Navigate to="/login" />} />
            <Route path="/salarie/ajouter" element={isAuthenticated ? <AddSalarie /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
