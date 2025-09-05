import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext();

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    }, []);

    // Vérifier l'authentification au chargement de l'app
    const checkAuth = useCallback(() => {
        const token = localStorage.getItem('token');

        if (isTokenValid(token)) {
            try {
                const decoded = jwtDecode(token);
                setIsAuthenticated(true);
                setUser({
                    id: decoded.id || decoded.user_id,
                    nom: decoded.nom,
                    email: decoded.email,
                    entreprise_id: decoded.entreprise_id
                });
            } catch (error) {
                console.error('Erreur lors du décodage du token:', error);
                logout();
            }
        } else {
            logout();
        }

        setLoading(false);
    }, [logout]);

    // Vérifier périodiquement la validité du token
    useEffect(() => {
        checkAuth();

        // Vérifier le token toutes les minutes
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (!isTokenValid(token)) {
                logout();
            }
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [logout, checkAuth]); // Ajout de checkAuth dans les dépendances

    // Intercepter les erreurs d'autorisation
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
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
