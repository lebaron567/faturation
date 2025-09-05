import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/Register.css";

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", nom: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Utiliser le service d'authentification
      await authService.register(form.nom, form.email, form.password);

      console.log("✅ Inscription réussie");
      alert("✅ Compte entreprise créé avec succès ! Vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (error) {
      console.error("❌ Erreur d'inscription :", error.response?.data || error.message);

      let errorMessage = "❌ Échec de l'inscription.";
      if (error.response?.status === 400) {
        errorMessage = "❌ Données invalides - Vérifiez vos informations";
      } else if (error.response?.status === 409) {
        errorMessage = "❌ Cette adresse email est déjà utilisée";
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
        <button type="submit" disabled={loading}>
          {loading ? '⏳ Inscription...' : '📝 S\'inscrire'}
        </button>
        <p className="login-link">
          Déjà inscrit ?{" "}
          <span onClick={() => navigate("/login")}>Se connecter</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
