import axios from "axios";

// Configuration depuis les variables d'environnement
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const DEBUG = process.env.REACT_APP_DEBUG === "true";
const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || "auth_token";

const instance = axios.create({
  baseURL: API_URL, // URL configurable via .env
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 10000, // 10 secondes de timeout
  withCredentials: true, // Important pour CORS avec authentification
});

if (DEBUG) {
  console.log("🔧 Axios configuré pour CORS et JWT");
  console.log("🌐 API URL:", API_URL);
  console.log("🔑 Token key:", TOKEN_KEY);
}

// Intercepteur pour ajouter automatiquement le token JWT
instance.interceptors.request.use(
  (config) => {
    if (DEBUG) {
      console.log("📤 Requête sortante:", config.method?.toUpperCase(), config.url);
    }

    // Récupérer le token depuis localStorage
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (DEBUG) {
        console.log("🔑 Token JWT ajouté à la requête");
      }

      // Optionnel: Décoder le token pour extraire des infos (sans validation côté client)
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);

        // Ajouter des headers personnalisés si nécessaire
        if (decoded.entreprise_id) {
          config.headers['X-Entreprise-ID'] = decoded.entreprise_id;
          if (DEBUG) {
            console.log("🏢 Entreprise ID ajouté:", decoded.entreprise_id);
          }
        }
      } catch (error) {
        if (DEBUG) {
          console.warn("⚠️ Erreur lors du décodage du token:", error);
        }
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Erreur requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification et CORS
instance.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log("📥 Réponse reçue:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    console.error("❌ Erreur réponse:", error.message);

    // Gestion des erreurs CORS
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error("❌ Problème CORS ou réseau - Vérifiez la configuration CORS du backend");
      console.error(`💡 Assurez-vous que l'origine ${window.location.origin} est autorisée`);
      console.error(`🔗 API URL configurée: ${API_URL}`);
    }

    const { response } = error;

    if (response?.status === 401) {
      // Token JWT invalide ou expiré
      console.warn("🔑 Token JWT expiré ou invalide - Déconnexion");

      // Nettoyer les tokens
      localStorage.removeItem("token");
      localStorage.removeItem(TOKEN_KEY);

      // Éviter les boucles de redirection
      if (!window.location.pathname.includes('/login')) {
        // Déclencher un événement personnalisé pour notifier les composants
        window.dispatchEvent(new CustomEvent('auth:logout'));

        // Redirection vers login avec l'URL actuelle
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    } else if (response?.status === 403) {
      // Accès refusé (JWT valide mais pas les bonnes permissions)
      console.error("🚫 Accès refusé:", error.response.data);
    } else if (response?.status >= 500) {
      // Erreur serveur
      console.error("🔥 Erreur serveur:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default instance;
