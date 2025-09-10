import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    console.log('🛡️ ProtectedRoute - État:', { isAuthenticated, loading, path: location.pathname });

    // Afficher un spinner pendant le chargement
    if (loading) {
        console.log('⏳ ProtectedRoute - Affichage du spinner de chargement');
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Vérification de l'authentification...</p>
                </div>
            </div>
        );
    }

    // Si non authentifié, rediriger vers le login avec l'URL de destination
    if (!isAuthenticated) {
        console.log('🚫 ProtectedRoute - Redirection vers login depuis:', location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('✅ ProtectedRoute - Accès autorisé à:', location.pathname);
    return children;
};

export default ProtectedRoute;
