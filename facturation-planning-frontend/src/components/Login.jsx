import React, { useState } from "react";
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
      // Utiliser la fonction login du contexte
      const success = await login(form.email, form.password);

      if (success) {
        console.log('✅ Connexion réussie - Redirection en cours');

        // Rediriger vers la page demandée
        navigate(from, { replace: true });
      } else {
        alert("⚠️ Erreur de connexion - Identifiants incorrects");
      }
    } catch (error) {
      console.error("❌ Erreur de connexion :", error.response?.data || error.message);

      let errorMessage = "❌ Connexion échouée !";
      if (error.response?.status === 401) {
        errorMessage = "❌ Email ou mot de passe incorrect";
      } else if (error.response?.status === 500) {
        errorMessage = "❌ Erreur serveur - Réessayez plus tard";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "❌ Problème de connexion - Vérifiez que le serveur est démarré";
      }

      alert(errorMessage);
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
