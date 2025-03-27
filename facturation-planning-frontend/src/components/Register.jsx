import React, { useState } from "react";
import axios from "../axiosInstance"; // au lieu de "axios"


const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", nom: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:8080/register", form);
    alert("Compte créé !");
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input name="nom" type="text" placeholder="Nom" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default Register;
