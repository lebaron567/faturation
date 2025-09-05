import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Composant de test simple pour la connexion
 */
const SimpleLogin = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [status, setStatus] = useState('');
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('🔄 Connexion en cours...');

        try {
            console.log('🧪 Test de connexion simple...');
            const success = await login(form.email, form.password);

            if (success) {
                setStatus('✅ Connexion réussie ! Redirection dans 2 secondes...');

                // Attendre 2 secondes pour voir le message, puis rediriger
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
            } else {
                setStatus('❌ Connexion échouée - Vérifiez vos identifiants');
            }
        } catch (error) {
            setStatus(`❌ Erreur: ${error.message}`);
        }
    };

    // Si déjà connecté, afficher le statut
    if (isAuthenticated) {
        return (
            <div style={{
                maxWidth: '400px',
                margin: '50px auto',
                padding: '20px',
                border: '2px solid green',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h2>✅ Vous êtes connecté !</h2>
                <p><strong>Nom:</strong> {user?.nom || 'Non défini'}</p>
                <p><strong>Email:</strong> {user?.email || 'Non défini'}</p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 20px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    🏠 Aller à l'accueil
                </button>
                <button
                    onClick={() => navigate('/jwt-diagnostic')}
                    style={{
                        padding: '10px 20px',
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🔍 Diagnostic JWT
                </button>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '400px',
            margin: '50px auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px'
        }}>
            <h2>🔐 Test de connexion simple</h2>

            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    🚀 Se connecter
                </button>
            </form>

            {/* Statut */}
            {status && (
                <div style={{
                    padding: '10px',
                    background: status.includes('✅') ? '#d4edda' : status.includes('🔄') ? '#fff3cd' : '#f8d7da',
                    border: '1px solid',
                    borderColor: status.includes('✅') ? '#c3e6cb' : status.includes('🔄') ? '#ffeaa7' : '#f5c6cb',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    {status}
                </div>
            )}

            {/* Liens de test */}
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                <p>
                    <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
                        ← Retour au login normal
                    </a>
                    {' | '}
                    <a href="/login-debug" style={{ color: '#007bff', textDecoration: 'none' }}>
                        Debug avancé →
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SimpleLogin;
