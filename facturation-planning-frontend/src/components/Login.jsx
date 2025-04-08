import React, { useState } from "react";
import axios from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/login", form);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
        navigate("/");
      } else {
        alert("⚠️ Aucun token reçu !");
      }
    } catch (error) {
      console.error("❌ Erreur de connexion :", error.response?.data || error.message);
      alert("❌ Connexion échouée !");
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
        <button type="submit">🔐 Se connecter</button>
      </form>

      <p className="register-message">Pas encore de compte ?</p>
      <button className="register-button" onClick={() => navigate("/register")}>
        📝 S'inscrire
      </button>
    </div>
  );
};

export default Login;
