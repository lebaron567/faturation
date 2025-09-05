import React, { useState } from 'react';
import axios from 'axios';

/**
 * Composant de test simple pour diagnostiquer les problèmes de connexion
 */
const LoginDebug = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testDirectConnection = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            console.log('🧪 Test de connexion directe...');

            // Test direct sans passer par axiosInstance
            const result = await axios({
                method: 'POST',
                url: 'http://localhost:8080/login',
                data: form,
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            });

            console.log('✅ Réponse reçue:', result);
            setResponse(result.data);

            if (result.data.token) {
                localStorage.setItem('auth_token', result.data.token);
                console.log('✅ Token stocké dans localStorage');
            }

        } catch (err) {
            console.error('❌ Erreur de connexion:', err);
            setError({
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                code: err.code
            });
        } finally {
            setLoading(false);
        }
    };

    const testBackendHealth = async () => {
        try {
            console.log('🏥 Test de santé du backend...');
            const result = await axios.get('http://localhost:8080/health', {
                timeout: 5000
            });
            console.log('✅ Backend accessible:', result.status);
            alert('✅ Backend accessible !');
        } catch (err) {
            console.error('❌ Backend non accessible:', err);
            alert('❌ Backend non accessible ! Vérifiez qu\'il est démarré sur le port 8080');
        }
    };

    const clearStorage = () => {
        localStorage.clear();
        console.log('🧹 LocalStorage nettoyé');
        alert('LocalStorage nettoyé !');
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '20px auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1>🔍 Debug Connexion</h1>

            {/* Test du backend */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h3>1. Test du backend</h3>
                <button
                    onClick={testBackendHealth}
                    style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🏥 Tester la santé du backend
                </button>
            </div>

            {/* Formulaire de test */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <h3>2. Test de connexion</h3>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>

                <button
                    onClick={testDirectConnection}
                    disabled={loading || !form.email || !form.password}
                    style={{
                        padding: '10px 20px',
                        background: loading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '⏳ Test en cours...' : '🔐 Tester la connexion'}
                </button>
            </div>

            {/* Réponse */}
            {response && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px' }}>
                    <h3>✅ Réponse du serveur</h3>
                    <pre style={{ overflow: 'auto', background: 'white', padding: '10px', borderRadius: '4px' }}>
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}

            {/* Erreur */}
            {error && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px' }}>
                    <h3>❌ Erreur</h3>
                    <p><strong>Message:</strong> {error.message}</p>
                    <p><strong>Status:</strong> {error.status}</p>
                    <p><strong>Code:</strong> {error.code}</p>
                    {error.data && (
                        <pre style={{ overflow: 'auto', background: 'white', padding: '10px', borderRadius: '4px' }}>
                            {JSON.stringify(error.data, null, 2)}
                        </pre>
                    )}
                </div>
            )}

            {/* Informations système */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#e2e3e5', borderRadius: '8px' }}>
                <h3>ℹ️ Informations système</h3>
                <p><strong>URL API:</strong> http://localhost:8080</p>
                <p><strong>Navigateur:</strong> {navigator.userAgent}</p>
                <p><strong>LocalStorage:</strong> {localStorage.getItem('auth_token') ? '✅ Token présent' : '❌ Pas de token'}</p>
                <button
                    onClick={clearStorage}
                    style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🧹 Nettoyer localStorage
                </button>
            </div>

            {/* Instructions */}
            <div style={{ padding: '15px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
                <h3>📋 Instructions de test</h3>
                <ol>
                    <li>Cliquez sur "Tester la santé du backend" pour vérifier si l'API répond</li>
                    <li>Saisissez vos identifiants de test</li>
                    <li>Cliquez sur "Tester la connexion"</li>
                    <li>Vérifiez la réponse ou l'erreur dans la console</li>
                </ol>
                <p><strong>⚠️ Note:</strong> Les erreurs Norton/extensions sont normales et n'affectent pas votre application.</p>
            </div>
        </div>
    );
};

export default LoginDebug;
