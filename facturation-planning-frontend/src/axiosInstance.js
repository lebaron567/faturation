import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter automatiquement le token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
instance.interceptors.response.use(
  (response) => response,
  (error) => {
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
