import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

/**
 * Composant de diagnostic JWT - Affiche l'état de l'authentification
 */
const JWTDiagnostic = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [tokenInfo, setTokenInfo] = useState(null);
    const [apiTest, setApiTest] = useState({
        profile: null,
        loading: false,
        error: null
    });

    // Analyser le token JWT au chargement
    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            try {
                const decoded = authService.decodeToken(token);
                const entrepriseInfo = authService.getEntrepriseInfo();

                setTokenInfo({
                    raw: token,
                    header: token.split('.')[0],
                    payload: decoded,
                    entrepriseInfo,
                    isExpired: decoded.exp < Math.floor(Date.now() / 1000)
                });
            } catch (error) {
                setTokenInfo({ error: error.message });
            }
        }
    }, [isAuthenticated]);

    const testApiCall = async () => {
        setApiTest({ loading: true, profile: null, error: null });

        try {
            const profile = await authService.getProfile();
            setApiTest({ loading: false, profile, error: null });
        } catch (error) {
            setApiTest({
                loading: false,
                profile: null,
                error: error.response?.data?.message || error.message
            });
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString('fr-FR');
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '20px auto',
            padding: '20px',
            fontFamily: 'monospace'
        }}>
            <h1>🔍 Diagnostic JWT - Application Facturation</h1>

            {/* État de l'authentification */}
            <div style={{
                background: isAuthenticated ? '#d4edda' : '#f8d7da',
                border: '1px solid',
                borderColor: isAuthenticated ? '#c3e6cb' : '#f5c6cb',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3>📊 État de l'authentification</h3>
                <p><strong>Statut:</strong> {isAuthenticated ? '✅ Connecté' : '❌ Non connecté'}</p>
                <p><strong>Utilisateur:</strong> {user?.nom || 'Aucun'}</p>
                <p><strong>Email:</strong> {user?.email || 'Aucun'}</p>
                <p><strong>ID utilisateur:</strong> {user?.id || 'Aucun'}</p>
            </div>

            {/* Informations du token */}
            {tokenInfo && (
                <div style={{
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3>🔑 Informations du token JWT</h3>

                    {tokenInfo.error ? (
                        <p style={{ color: 'red' }}>❌ Erreur: {tokenInfo.error}</p>
                    ) : (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <h4>📋 Payload décodé:</h4>
                                <pre style={{
                                    background: '#fff',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    overflow: 'auto'
                                }}>
                                    {JSON.stringify(tokenInfo.payload, null, 2)}
                                </pre>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <h4>🏢 Informations entreprise:</h4>
                                <p><strong>Entreprise ID:</strong> {tokenInfo.entrepriseInfo?.entreprise_id}</p>
                                <p><strong>Expiration:</strong> {tokenInfo.payload.exp ? formatDate(tokenInfo.payload.exp) : 'Non définie'}</p>
                                <p><strong>Expiré:</strong> {tokenInfo.isExpired ? '❌ Oui' : '✅ Non'}</p>
                            </div>

                            <div>
                                <h4>🔗 Token (tronqué):</h4>
                                <p style={{
                                    wordBreak: 'break-all',
                                    background: '#fff',
                                    padding: '5px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}>
                                    {tokenInfo.raw.substring(0, 50)}...{tokenInfo.raw.substring(tokenInfo.raw.length - 20)}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Test API */}
            <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3>🧪 Test de l'API (route protégée)</h3>

                <button
                    onClick={testApiCall}
                    disabled={!isAuthenticated || apiTest.loading}
                    style={{
                        padding: '10px 20px',
                        background: isAuthenticated ? '#007bff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                        marginBottom: '15px'
                    }}
                >
                    {apiTest.loading ? '⏳ Test en cours...' : '🔄 Tester GET /profile'}
                </button>

                {apiTest.profile && (
                    <div>
                        <h4>✅ Réponse de l'API:</h4>
                        <pre style={{
                            background: '#d4edda',
                            padding: '10px',
                            border: '1px solid #c3e6cb',
                            borderRadius: '4px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(apiTest.profile, null, 2)}
                        </pre>
                    </div>
                )}

                {apiTest.error && (
                    <div>
                        <h4>❌ Erreur API:</h4>
                        <p style={{
                            background: '#f8d7da',
                            padding: '10px',
                            border: '1px solid #f5c6cb',
                            borderRadius: '4px',
                            color: '#721c24'
                        }}>
                            {apiTest.error}
                        </p>
                    </div>
                )}
            </div>

            {/* Configuration */}
            <div style={{
                background: '#e2e3e5',
                border: '1px solid #d6d8db',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3>⚙️ Configuration</h3>
                <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8080'}</p>
                <p><strong>Environnement:</strong> {process.env.REACT_APP_ENV || 'development'}</p>
                <p><strong>Debug:</strong> {process.env.REACT_APP_DEBUG || 'true'}</p>
                <p><strong>Token Key:</strong> {process.env.REACT_APP_TOKEN_KEY || 'auth_token'}</p>
            </div>

            {/* Actions */}
            <div style={{
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <h3>🔧 Actions</h3>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 16px',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Recharger la page
                    </button>

                    <button
                        onClick={() => window.location.href = '/planning-test'}
                        style={{
                            padding: '8px 16px',
                            background: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🧪 Test des plannings
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={logout}
                            style={{
                                padding: '8px 16px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            🚪 Se déconnecter
                        </button>
                    )}

                    {!isAuthenticated && (
                        <button
                            onClick={() => window.location.href = '/login'}
                            style={{
                                padding: '8px 16px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            🔐 Se connecter
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', color: '#6c757d' }}>
                <p>🔍 Diagnostic JWT v1.0 - Application Facturation</p>
                <p>Vérifiez cette page après chaque connexion pour valider l'authentification</p>
            </div>
        </div>
    );
};

export default JWTDiagnostic;
