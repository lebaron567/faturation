import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

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

    // Vérifier la validité du token
    const isTokenValid = (token) => {
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // Vérifier si le token n'est pas expiré
            if (decoded.exp && decoded.exp < currentTime) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erreur lors du décodage du token:', error);
            return false;
        }
    };

    // Fonction de connexion
    const login = (token, userData) => {
        if (isTokenValid(token)) {
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
            setUser(userData);
            return true;
        }
        return false;
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
