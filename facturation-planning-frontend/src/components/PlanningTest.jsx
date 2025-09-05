import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import planningService from '../services/planningService';

/**
 * Composant de test pour les plannings (routes protégées par JWT)
 */
const PlanningTest = () => {
    const [plannings, setPlannings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, getProfile, getEntrepriseInfo } = useAuth();

    // Formulaire pour créer un nouveau planning
    const [newPlanning, setNewPlanning] = useState({
        date: '',
        objet: '',
        description: ''
    });

    // Charger les plannings au montage
    useEffect(() => {
        loadPlannings();
    }, []);

    const loadPlannings = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await planningService.getPlannings();
            setPlannings(data);
            console.log('📅 Plannings chargés:', data);
        } catch (error) {
            console.error('❌ Erreur chargement plannings:', error);
            setError('Erreur lors du chargement des plannings');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlanning = async (e) => {
        e.preventDefault();

        if (!newPlanning.date || !newPlanning.objet) {
            alert('Veuillez remplir les champs obligatoires');
            return;
        }

        try {
            const created = await planningService.createPlanning(newPlanning);
            console.log('✅ Planning créé:', created);

            // Recharger la liste
            await loadPlannings();

            // Reset du formulaire
            setNewPlanning({ date: '', objet: '', description: '' });
            alert('✅ Planning créé avec succès !');
        } catch (error) {
            console.error('❌ Erreur création planning:', error);
            alert('❌ Erreur lors de la création du planning');
        }
    };

    const handleDeletePlanning = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
            return;
        }

        try {
            await planningService.deletePlanning(id);
            console.log('🗑️ Planning supprimé:', id);

            // Recharger la liste
            await loadPlannings();
            alert('✅ Planning supprimé avec succès !');
        } catch (error) {
            console.error('❌ Erreur suppression planning:', error);
            alert('❌ Erreur lors de la suppression du planning');
        }
    };

    const testProfile = async () => {
        try {
            const profile = await getProfile();
            alert(`📋 Profil récupéré:\nNom: ${profile.nom}\nEmail: ${profile.email}\nID: ${profile.id}`);
        } catch (error) {
            alert('❌ Erreur récupération profil');
        }
    };

    const entrepriseInfo = getEntrepriseInfo();

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🧪 Test API JWT - Plannings</h1>

            {/* Infos utilisateur */}
            <div style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3>👤 Utilisateur connecté</h3>
                <p><strong>Nom:</strong> {user?.nom || 'Non disponible'}</p>
                <p><strong>Email:</strong> {user?.email || 'Non disponible'}</p>
                <p><strong>Entreprise ID:</strong> {entrepriseInfo?.entreprise_id || 'Non disponible'}</p>
                <button onClick={testProfile} style={{ marginTop: '10px' }}>
                    🔄 Tester récupération profil
                </button>
            </div>

            {/* Formulaire création planning */}
            <div style={{
                background: '#e8f5e8',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3>➕ Créer un planning</h3>
                <form onSubmit={handleCreatePlanning} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="date"
                        value={newPlanning.date}
                        onChange={(e) => setNewPlanning({ ...newPlanning, date: e.target.value })}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <input
                        type="text"
                        placeholder="Objet du planning *"
                        value={newPlanning.objet}
                        onChange={(e) => setNewPlanning({ ...newPlanning, objet: e.target.value })}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <textarea
                        placeholder="Description (optionnelle)"
                        value={newPlanning.description}
                        onChange={(e) => setNewPlanning({ ...newPlanning, description: e.target.value })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '60px' }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '10px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ✅ Créer le planning
                    </button>
                </form>
            </div>

            {/* Liste des plannings */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>📅 Liste des plannings</h3>
                    <button onClick={loadPlannings} style={{ padding: '5px 10px' }}>
                        🔄 Actualiser
                    </button>
                </div>

                {loading && <p>⏳ Chargement...</p>}
                {error && <p style={{ color: 'red' }}>❌ {error}</p>}

                {!loading && !error && (
                    <>
                        <p>Total: {plannings.length} planning(s)</p>
                        {plannings.length === 0 ? (
                            <p style={{ color: '#666' }}>Aucun planning trouvé</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {plannings.map((planning) => (
                                    <div
                                        key={planning.id}
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            background: '#fff'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0' }}>{planning.objet}</h4>
                                                <p style={{ margin: '0 0 5px 0' }}>📅 {planning.date}</p>
                                                {planning.description && (
                                                    <p style={{ margin: '0', color: '#666' }}>{planning.description}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeletePlanning(planning.id)}
                                                style={{
                                                    background: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PlanningTest;
