import React, { useState, useEffect } from 'react';
import clientService from '../services/clientService';
import { getClientDisplayName } from '../utils/clientUtils';
import { useToast } from '../contexts/ToastContext';
import { useCrudOperations } from '../hooks/useAsyncOperation';
import LoadingSpinner, { SkeletonCard } from './LoadingSpinner';
import '../styles/GestionClients.css';

const GestionClients = () => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('tous');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type_client: 'particulier',
        nom: '',
        prenom: '',
        raison_sociale: '',
        email: '',
        telephone: '',
        adresse: '',
        code_postal: '',
        ville: '',
        siret: '',
        tva_intracom: ''
    });
    const [errors, setErrors] = useState([]);

    // Nouveaux hooks pour une meilleure UX
    const { showSuccess, showError, showWarning } = useToast();
    const { loading, create, update, remove, fetch } = useCrudOperations('client');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await fetch(() => clientService.getClients());
            setClients(data);
        } catch (error) {
            console.error('Erreur chargement clients:', error);
            // L'erreur est déjà gérée par le hook useCrudOperations
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadClients();
            return;
        }

        try {
            const results = await fetch(() => clientService.searchClients(searchTerm));
            setClients(results);
        } catch (error) {
            console.error('Erreur recherche:', error);
            // L'erreur est gérée par le hook
        }
    };

    const handleFilter = async (type) => {
        setFilterType(type);
        try {
            if (type === 'tous') {
                await loadClients();
            } else {
                const filtered = await fetch(() => clientService.getClientsByType(type));
                setClients(filtered);
            }
        } catch (error) {
            console.error('Erreur filtrage:', error);
            // L'erreur est gérée par le hook
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            type_client: 'particulier',
            nom: '',
            prenom: '',
            raison_sociale: '',
            email: '',
            telephone: '',
            adresse: '',
            code_postal: '',
            ville: '',
            siret: '',
            tva_intracom: ''
        });
        setSelectedClient(null);
        setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const validation = clientService.validateClientData(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        try {
            if (selectedClient) {
                // Mise à jour
                await update(() => clientService.updateClient(selectedClient.id, formData));
            } else {
                // Création
                await create(() => clientService.createClient(formData));
            }

            resetForm();
            setShowForm(false);
            loadClients();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            // L'erreur est gérée par le hook
        }
    };

    const handleEdit = (client) => {
        setSelectedClient(client);
        setFormData({
            type_client: client.type_client || 'particulier',
            nom: client.nom || '',
            prenom: client.prenom || '',
            raison_sociale: client.raison_sociale || '',
            email: client.email || '',
            telephone: client.telephone || '',
            adresse: client.adresse || '',
            code_postal: client.code_postal || '',
            ville: client.ville || '',
            siret: client.siret || '',
            tva_intracom: client.tva_intracom || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (clientId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            return;
        }

        try {
            await remove(() => clientService.deleteClient(clientId));
            loadClients();
        } catch (error) {
            console.error('Erreur suppression:', error);
            // L'erreur est gérée par le hook
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = !searchTerm ||
            getClientDisplayName(client).toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'tous' || client.type_client === filterType;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="gestion-clients">
            <div className="header">
                <h2>👥 Gestion des Clients</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                >
                    ➕ Nouveau Client
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} className="btn-search">🔍</button>
                </div>

                <div className="filter-buttons">
                    <button
                        onClick={() => handleFilter('tous')}
                        className={filterType === 'tous' ? 'active' : ''}
                    >
                        Tous ({clients.length})
                    </button>
                    <button
                        onClick={() => handleFilter('particulier')}
                        className={filterType === 'particulier' ? 'active' : ''}
                    >
                        Particuliers
                    </button>
                    <button
                        onClick={() => handleFilter('professionnel')}
                        className={filterType === 'professionnel' ? 'active' : ''}
                    >
                        Professionnels
                    </button>
                </div>
            </div>

            {/* Liste des clients */}
            {loading ? (
                <div className="clients-list">
                    <div className="clients-grid">
                        <SkeletonCard count={6} />
                    </div>
                </div>
            ) : (
                <div className="clients-list">
                    {filteredClients.length === 0 ? (
                        <div className="no-clients">
                            <p>Aucun client trouvé</p>
                        </div>
                    ) : (
                        <div className="clients-grid">
                            {filteredClients.map(client => (
                                <div key={client.id} className="client-card">
                                    <div className="client-header">
                                        <h3>{getClientDisplayName(client)}</h3>
                                        <span className={`type-badge ${client.type_client}`}>
                                            {client.type_client === 'particulier' ? '👤' : '🏢'}
                                            {client.type_client}
                                        </span>
                                    </div>

                                    <div className="client-info">
                                        <p>📧 {client.email}</p>
                                        {client.telephone && <p>📞 {client.telephone}</p>}
                                        {client.ville && <p>📍 {client.ville}</p>}
                                    </div>

                                    <div className="client-actions">
                                        <button
                                            onClick={() => handleEdit(client)}
                                            className="btn-edit"
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            className="btn-delete"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Formulaire client */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{selectedClient ? 'Modifier Client' : 'Nouveau Client'}</h3>
                            <button
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="btn-close"
                            >
                                ❌
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="client-form">
                            {errors.length > 0 && (
                                <div className="errors">
                                    {errors.map((error, index) => (
                                        <p key={index} className="error">❌ {error}</p>
                                    ))}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Type de client *</label>
                                <select
                                    name="type_client"
                                    value={formData.type_client}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="particulier">👤 Particulier</option>
                                    <option value="professionnel">🏢 Professionnel</option>
                                </select>
                            </div>

                            {formData.type_client === 'particulier' ? (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Prénom *</label>
                                            <input
                                                type="text"
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Nom *</label>
                                            <input
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Raison sociale *</label>
                                        <input
                                            type="text"
                                            name="raison_sociale"
                                            value={formData.raison_sociale}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nom</label>
                                            <input
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Prénom</label>
                                            <input
                                                type="text"
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>SIRET</label>
                                            <input
                                                type="text"
                                                name="siret"
                                                value={formData.siret}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>TVA Intracommunautaire</label>
                                            <input
                                                type="text"
                                                name="tva_intracom"
                                                value={formData.tva_intracom}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Adresse</label>
                                <input
                                    type="text"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Code postal</label>
                                    <input
                                        type="text"
                                        name="code_postal"
                                        value={formData.code_postal}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ville</label>
                                    <input
                                        type="text"
                                        name="ville"
                                        value={formData.ville}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                    className="btn-cancel"
                                >
                                    Annuler
                                </button>
                                <button type="submit" className="btn-save">
                                    {selectedClient ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionClients;
