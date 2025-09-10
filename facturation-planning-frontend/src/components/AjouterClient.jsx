import axios from "../axiosInstance";
import { useState } from "react";
import { useEntreprise } from "../hooks/useEntreprise";
import "../styles/AjouterClient.css";

const AjouterClient = () => {
  const { entrepriseId, checkEntrepriseAccess } = useEntreprise();
  const [typeClient, setTypeClient] = useState("particulier");
  const [form, setForm] = useState({
    // Champs pour particulier
    civilite: "",
    nom: "",
    prenom: "",

    // Champs pour professionnel
    nom_organisme: "",

    // Champs communs
    adresse: "",
    complement_adresse: "",
    code_postal: "",
    ville: "",
    telephone: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    setTypeClient(e.target.value);
    // Réinitialiser le formulaire quand on change de type
    setForm({
      civilite: "",
      nom: "",
      prenom: "",
      nom_organisme: "",
      adresse: "",
      complement_adresse: "",
      code_postal: "",
      ville: "",
      telephone: "",
      email: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkEntrepriseAccess("ajouter un client")) {
      return;
    }

    console.log("🏢 Ajout client pour entreprise:", entrepriseId);

    try {
      const clientData = {
        type_client: typeClient,
        adresse: form.adresse,
        complement_adresse: form.complement_adresse,
        code_postal: form.code_postal,
        ville: form.ville,
        telephone: form.telephone,
        email: form.email,
        entreprise_id: entrepriseId,
      };

      // Ajouter les champs spécifiques selon le type
      if (typeClient === "particulier") {
        clientData.civilite = form.civilite;
        clientData.nom = form.nom;
        clientData.prenom = form.prenom;
      } else {
        clientData.nom_organisme = form.nom_organisme;
      }

      console.log("📝 Données client à envoyer:", clientData);

      await axios.post("/clients", clientData);
      alert("✅ Client ajouté !");

      // Réinitialiser le formulaire
      setForm({
        civilite: "",
        nom: "",
        prenom: "",
        nom_organisme: "",
        adresse: "",
        complement_adresse: "",
        code_postal: "",
        ville: "",
        telephone: "",
        email: "",
      });
    } catch (err) {
      console.error("❌ Erreur ajout client:", err);
      console.error("❌ Response data:", err.response?.data);
      alert(`❌ Échec de l'ajout du client: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="form-container">
      <h2>🆕 Ajouter un client</h2>

      {/* Sélection du type de client */}
      <div className="client-type-selector">
        <h3>Type de client</h3>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="type_client"
              value="particulier"
              checked={typeClient === "particulier"}
              onChange={handleTypeChange}
            />
            <span className="radio-label">👤 Particulier</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="type_client"
              value="professionnel"
              checked={typeClient === "professionnel"}
              onChange={handleTypeChange}
            />
            <span className="radio-label">🏢 Professionnel</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Champs pour particulier */}
        {typeClient === "particulier" && (
          <div className="form-section">
            <h3>👤 Informations personnelles</h3>

            <label>Civilité</label>
            <select name="civilite" value={form.civilite} onChange={handleChange} required>
              <option value="">-- Sélectionner --</option>
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
              <option value="Mlle">Mlle</option>
            </select>

            <label>Nom *</label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              placeholder="Ex: Dupont"
            />

            <label>Prénom *</label>
            <input
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              placeholder="Ex: Jean"
            />
          </div>
        )}

        {/* Champs pour professionnel */}
        {typeClient === "professionnel" && (
          <div className="form-section">
            <h3>🏢 Informations professionnelles</h3>

            <label>Nom de l'organisme *</label>
            <input
              name="nom_organisme"
              value={form.nom_organisme}
              onChange={handleChange}
              required
              placeholder="Ex: ACME Corporation"
            />
          </div>
        )}

        {/* Champs communs */}
        <div className="form-section">
          <h3>📍 Adresse</h3>

          <label>Adresse *</label>
          <input
            name="adresse"
            value={form.adresse}
            onChange={handleChange}
            required
            placeholder="Ex: 123 rue de la Paix"
          />

          <label>Complément d'adresse</label>
          <input
            name="complement_adresse"
            value={form.complement_adresse}
            onChange={handleChange}
            placeholder="Ex: Bâtiment A, 2ème étage"
          />

          <div className="form-row">
            <div className="form-group">
              <label>Code postal *</label>
              <input
                name="code_postal"
                value={form.code_postal}
                onChange={handleChange}
                required
                placeholder="Ex: 75001"
                pattern="[0-9]{5}"
                title="Le code postal doit contenir 5 chiffres"
              />
            </div>

            <div className="form-group">
              <label>Ville *</label>
              <input
                name="ville"
                value={form.ville}
                onChange={handleChange}
                required
                placeholder="Ex: Paris"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📞 Contact</h3>

          <label>Téléphone</label>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            type="tel"
            placeholder="Ex: 01 23 45 67 89"
          />

          <label>Adresse email *</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
            placeholder="Ex: contact@example.com"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            ✅ Ajouter le client
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjouterClient;
