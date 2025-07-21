import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useProtectedComponent = () => {
    const { isAuthenticated, loading, checkAuth } = useAuth();

    useEffect(() => {
        // Vérifier l'authentification lors du montage du composant
        if (!loading) {
            checkAuth();
        }
    }, [checkAuth, loading]);

    // Écouter les événements de déconnexion
    useEffect(() => {
        const handleAuthLogout = () => {
            checkAuth();
        };

        window.addEventListener('auth:logout', handleAuthLogout);
        return () => window.removeEventListener('auth:logout', handleAuthLogout);
    }, [checkAuth]);

    return {
        isAuthenticated,
        loading
    };
};
