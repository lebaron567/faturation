import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home"; // ✅ Import de la page d'accueil
import FactureForm from "./components/FactureForm";
import Planning from "./components/Planning";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import AddSalarie from "./components/AddSalarie";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return (
    <Router>
      <div className="App">
        <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />          <Route path="/factures" element={isAuthenticated ? <FactureForm /> : <Navigate to="/login" />} />
          <Route path="/planning" element={isAuthenticated ? <Planning /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/salarie/ajouter" element={<AddSalarie />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
