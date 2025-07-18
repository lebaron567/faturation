import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/FactureSearch.css';

const FactureSearch = ({ onResults, onReset }) => {
    const [searchParams, setSearchParams] = useState({
        query: '',
        client: '',
        statut: '',
        dateDebut: '',
        dateFin: '',
        montantMin: '',
        montantMax: ''
    });
    const [clients, setClients] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axiosInstance.get('/clients');
            setClients(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des clients:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async () => {
        try {
            // Construire les paramètres de recherche
            const params = new URLSearchParams();

            Object.entries(searchParams).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    params.append(key, value);
                }
            });

            const response = await axiosInstance.get(`/factures/search?${params.toString()}`);
            onResults(response.data);
        } catch (err) {
            console.error("Erreur lors de la recherche:", err);
            alert("Erreur lors de la recherche");
        }
    };

    const handleReset = () => {
        setSearchParams({
            query: '',
            client: '',
            statut: '',
            dateDebut: '',
            dateFin: '',
            montantMin: '',
            montantMax: ''
        });
        onReset();
    };

    const hasActiveFilters = Object.values(searchParams).some(value => value && value.trim() !== '');

    return (
        <div className="facture-search">
            <div className="search-header">
                <div className="search-main">
                    <input
                        type="text"
                        name="query"
                        placeholder="Rechercher par numéro, description..."
                        value={searchParams.query}
                        onChange={handleInputChange}
                        className="search-input"
                    />
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="search-btn"
                    >
                        🔍 Rechercher
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="filter-toggle-btn"
                    >
                        🔽 Filtres avancés
                    </button>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="reset-btn"
                        >
                            ❌ Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="search-filters">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Client:</label>
                            <select
                                name="client"
                                value={searchParams.client}
                                onChange={handleInputChange}
                            >
                                <option value="">Tous les clients</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Statut:</label>
                            <select
                                name="statut"
                                value={searchParams.statut}
                                onChange={handleInputChange}
                            >
                                <option value="">Tous les statuts</option>
                                <option value="brouillon">Brouillon</option>
                                <option value="envoyee">Envoyée</option>
                                <option value="payee">Payée</option>
                                <option value="en_retard">En retard</option>
                                <option value="annulee">Annulée</option>
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Date début:</label>
                            <input
                                type="date"
                                name="dateDebut"
                                value={searchParams.dateDebut}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Date fin:</label>
                            <input
                                type="date"
                                name="dateFin"
                                value={searchParams.dateFin}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Montant min (€):</label>
                            <input
                                type="number"
                                name="montantMin"
                                value={searchParams.montantMin}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="filter-group">
                            <label>Montant max (€):</label>
                            <input
                                type="number"
                                name="montantMax"
                                value={searchParams.montantMax}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="apply-filters-btn"
                        >
                            Appliquer les filtres
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FactureSearch;
