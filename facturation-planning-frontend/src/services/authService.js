import api from '../axiosInstance';
import { handleApiError } from '../utils/errorHandler';
import { jwtDecode } from 'jwt-decode';

// Configuration depuis les variables d'environnement
const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || "auth_token";
const DEBUG = process.env.REACT_APP_DEBUG === "true";

/**
 * Service d'authentification avec JWT
 * Gère la connexion, l'inscription, et la validation des tokens
 */
export const authService = {
    /**
     * Inscription d'une nouvelle entreprise
     */
    async register(nom, email, password) {
        const registerRequest = async () => {
            const response = await api.post('/auth/register', {
                nom,
                email,
                password
            });
            console.log('✅ Inscription réussie');
            return response.data;
        };

        try {
            return await registerRequest();
        } catch (error) {
            console.error('❌ Erreur inscription:', error.response?.data || error.message);
            throw await handleApiError(error, registerRequest, 1);
        }
    },

    /**
     * Connexion et récupération du token JWT
     */
    async login(email, password) {
        const loginRequest = async () => {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            if (response.data.token) {
                // Stocker le token JWT
                localStorage.setItem(TOKEN_KEY, response.data.token);

                // Décoder le token pour extraire les informations utilisateur
                try {
                    const decoded = jwtDecode(response.data.token);
                    const user = {
                        id: decoded.id || decoded.entreprise_id,
                        nom: decoded.nom,
                        email: decoded.email,
                        entreprise_id: decoded.entreprise_id
                    };

                    if (DEBUG) {
                        console.log('✅ Connexion réussie, token JWT stocké');
                        console.log('👤 Informations utilisateur extraites:', user);
                    }

                    return {
                        token: response.data.token,
                        user: user
                    };
                } catch (decodeError) {
                    console.error('❌ Erreur décodage token:', decodeError);
                    throw new Error('Token JWT invalide');
                }
            } else {
                throw new Error('Aucun token reçu du serveur');
            }
        };

        try {
            return await loginRequest();
        } catch (error) {
            console.error('❌ Erreur connexion:', error.response?.data || error.message);
            throw await handleApiError(error, loginRequest, 1);
        }
    },

    /**
     * Déconnexion (nettoyage du token)
     */
    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('token'); // Nettoyer l'ancien token aussi
        if (DEBUG) {
            console.log('🚪 Déconnexion effectuée');
        }

        // Déclencher un événement pour notifier les composants
        window.dispatchEvent(new CustomEvent('auth:logout'));
    },

    /**
     * Récupérer le profil de l'entreprise connectée (route protégée)
     */
    async getProfile() {
        try {
            const response = await api.get('/profile');
            console.log('📋 Profil récupéré');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération profil:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Vérifier si le token n'est pas expiré
            const payload = this.decodeToken(token);
            const now = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < now) {
                console.warn('🕐 Token JWT expiré');
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Token JWT invalide:', error);
            this.logout();
            return false;
        }
    },

    /**
     * Récupérer le token depuis localStorage
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
    },

    /**
     * Décoder le token JWT (sans validation, juste pour lire le payload)
     */
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Token JWT malformé');
        }
    },

    /**
     * Récupérer les informations de l'entreprise depuis le token
     */
    getEntrepriseInfo() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = this.decodeToken(token);
            return {
                entreprise_id: payload.entreprise_id,
                exp: payload.exp
            };
        } catch (error) {
            return null;
        }
    }
};

export default authService;
