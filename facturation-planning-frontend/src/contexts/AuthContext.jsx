import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext();

// Utiliser la même clé que le service d'authentification
const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || "auth_token";

// Exporter le contexte pour utilisation directe
export { AuthContext };

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Initialiser l'état en vérifiant s'il y a déjà un token valide
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp && decoded.exp > currentTime;
        } catch {
            return false;
        }
    });

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp > currentTime) {
                return {
                    id: decoded.id || decoded.user_id,
                    nom: decoded.nom,
                    email: decoded.email,
                    entreprise_id: decoded.entreprise_id
                };
            }
        } catch {
            return null;
        }
        return null;
    });

    // Initialiser loading à false si on a déjà un token valide
    const [loading, setLoading] = useState(() => {
        const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
        if (!token) return false; // Pas de token = pas de loading

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return !(decoded.exp && decoded.exp > currentTime); // Loading seulement si token invalide
        } catch {
            return false;
        }
    });

    // Vérifier la validité du token avec le service
    const isTokenValid = (token) => {
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // Vérifier si le token n'est pas expiré
            if (decoded.exp && decoded.exp < currentTime) {
                console.warn('🕐 Token JWT expiré');
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur lors du décodage du token:', error);
            return false;
        }
    };

    // Fonction de connexion avec le service d'authentification
    const login = async (email, password) => {
        try {
            console.log('🔐 Tentative de connexion via AuthContext...');
            const result = await authService.login(email, password);

            if (result.token) {
                console.log('🔑 Token reçu, mise à jour du contexte...');
                setIsAuthenticated(true);
                setUser(result.user);
                console.log('✅ Connexion réussie via AuthContext');
                return true;
            }
            console.warn('⚠️ Pas de token dans la réponse');
            return false;
        } catch (error) {
            console.error('❌ Erreur de connexion dans AuthContext:', error);
            return false;
        }
    };

    // Fonction de déconnexion
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('token'); // Nettoyer l'ancien token aussi pour compatibilité
        setIsAuthenticated(false);
        setUser(null);
    }, []);

    // Vérifier l'authentification au chargement de l'app
    const checkAuth = useCallback(() => {
        console.log('🔍 Vérification de l\'authentification...');
        // Utiliser la même logique que le service pour récupérer le token
        const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');

        if (isTokenValid(token)) {
            try {
                const decoded = jwtDecode(token);
                console.log('✅ Token valide trouvé, maintien de la session');

                // Ne mettre à jour que si nécessaire
                setIsAuthenticated(true);
                setUser({
                    id: decoded.id || decoded.user_id,
                    nom: decoded.nom,
                    email: decoded.email,
                    entreprise_id: decoded.entreprise_id
                });
            } catch (error) {
                console.error('❌ Erreur lors du décodage du token:', error);
                logout();
            }
        } else {
            console.log('⚠️ Aucun token valide trouvé');
            // Seulement déconnecter si on était connecté
            if (isAuthenticated) {
                logout();
            }
        }

        setLoading(false);
    }, [logout, isAuthenticated]);

    // Vérifier périodiquement la validité du token
    useEffect(() => {
        console.log('🔄 AuthContext useEffect - État initial:', { isAuthenticated, user: !!user, loading });

        // Ne faire la vérification que si on n'a pas déjà un état valide
        const needsCheck = !isAuthenticated || !user;
        if (needsCheck) {
            console.log('🔄 Lancement de la vérification d\'authentification');
            checkAuth();
        } else {
            console.log('✅ État d\'authentification déjà valide, pas de vérification nécessaire');
            setLoading(false);
        }

        // Vérifier le token toutes les minutes
        const interval = setInterval(() => {
            const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
            if (!isTokenValid(token)) {
                console.log('⚠️ Token expiré ou invalide, déconnexion');
                logout();
            }
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, []); // Enlever les dépendances pour éviter les boucles

    // Intercepter les erreurs d'autorisation
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === TOKEN_KEY || e.key === 'token') {
                if (!e.newValue) {
                    // Token supprimé
                    logout();
                } else {
                    // Token mis à jour
                    checkAuth();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [logout, checkAuth]); // Ajout des dépendances

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuth,
        isTokenValid
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
