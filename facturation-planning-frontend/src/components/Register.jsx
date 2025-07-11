import React, { useState } from "react";
import axios from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", nom: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/register", form);
      alert("✅ Compte créé avec succès !");
      navigate("/login"); // ✅ redirection vers le login
    } catch (error) {
      console.error("❌ Erreur d'inscription :", error.response?.data || error.message);
      alert("❌ Échec de l'inscription.");
    }
  };

  return (
    <div className="register-container">
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          name="nom"
          type="text"
          placeholder="Nom de l'entreprise"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Adresse email"
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
        <button type="submit">📝 S'inscrire</button>
        <p className="login-link">
          Déjà inscrit ?{" "}
          <span onClick={() => navigate("/login")}>Se connecter</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
