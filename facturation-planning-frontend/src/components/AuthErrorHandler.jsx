import React, { useState, useEffect } from 'react';
import '../styles/AuthErrorHandler.css';

const AuthErrorHandler = () => {
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuthError = (event) => {
            setError(event.detail.message);

            // Masquer l'erreur après 5 secondes
            setTimeout(() => {
                setError(null);
            }, 5000);
        };

        window.addEventListener('auth:error', handleAuthError);
        return () => window.removeEventListener('auth:error', handleAuthError);
    }, []);

    if (!error) return null;

    return (
        <div className="auth-error-banner">
            <div className="auth-error-content">
                <span className="auth-error-icon">⚠️</span>
                <span className="auth-error-message">{error}</span>
                <button
                    className="auth-error-close"
                    onClick={() => setError(null)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default AuthErrorHandler;
