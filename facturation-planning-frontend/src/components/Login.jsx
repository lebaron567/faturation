import React, { useState } from "react";
import axios from "../axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Récupérer l'URL de redirection depuis les paramètres ou le state
  const from = location.state?.from?.pathname || new URLSearchParams(location.search).get('redirect') || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/login", form);

      if (response.data.token) {
        const success = login(response.data.token, response.data.user);

        if (success) {
          navigate(from, { replace: true });
        } else {
          alert("⚠️ Token invalide !");
        }
      } else {
        alert("⚠️ Aucun token reçu !");
      }
    } catch (error) {
      console.error("❌ Erreur de connexion :", error.response?.data || error.message);
      alert("❌ Connexion échouée !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "🔄 Connexion..." : "🔐 Se connecter"}
        </button>
      </form>

      <p className="register-message">Pas encore de compte ?</p>
      <button className="register-button" onClick={() => navigate("/register")}>
        📝 S'inscrire
      </button>
    </div>
  );
};

export default Login;
