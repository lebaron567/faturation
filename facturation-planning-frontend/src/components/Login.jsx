import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔍 Données envoyées par React :", JSON.stringify(form, null, 2)); // ✅ Debug propre

    try {
        const response = await axios.post("http://localhost:8080/login", form, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("✅ Réponse API :", JSON.stringify(response.data, null, 2)); // ✅ Debug API propre

        // ✅ Vérifier si le token est bien reçu
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            console.log("🔑 Token stocké :", localStorage.getItem("token")); // ✅ Vérification
              alert("✅ Connecté !");
        } else {
            alert("⚠️ Erreur : aucun token reçu !");
        }
    } catch (error) {
        console.error("❌ Erreur de connexion :", error.response?.data || error.message);
        alert("❌ Échec de connexion !");
    }
};




  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;
