import axios from "axios";

const instance = axios.create({
  baseURL: "", // Utiliser le proxy dans package.json
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 10000, // 10 secondes de timeout
  withCredentials: false, // Pas de cookies
});

console.log("🔧 Axios configuré en mode proxy");

// Intercepteur pour ajouter automatiquement le token et les headers nécessaires
instance.interceptors.request.use(
  (config) => {
    console.log("📤 Requête sortante:", config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // Décoder le token pour extraire l'entreprise_id si nécessaire
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);

        // Ajouter l'entreprise_id dans les headers si disponible
        if (decoded.entreprise_id) {
          config.headers['X-Entreprise-ID'] = decoded.entreprise_id;
        }
      } catch (error) {
        console.warn("Erreur lors du décodage du token:", error);
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Erreur requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
instance.interceptors.response.use(
  (response) => {
    console.log("📥 Réponse reçue:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Erreur réponse:", error.message);
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error("❌ Problème de réseau - Backend non accessible sur http://localhost:8080");
    }
    const { response } = error;

    if (response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem("token");

      // Éviter les boucles de redirection
      if (!window.location.pathname.includes('/login')) {
        // Déclencher un événement personnalisé pour notifier les composants
        window.dispatchEvent(new CustomEvent('auth:logout'));

        // Redirection vers login avec l'URL actuelle
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    } else if (response?.status === 403) {
      // Accès refusé
      console.error("Accès refusé:", error.response.data);
    } else if (response?.status >= 500) {
      // Erreur serveur
      console.error("Erreur serveur:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default instance;
