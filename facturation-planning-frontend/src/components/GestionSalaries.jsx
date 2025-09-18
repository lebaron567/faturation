import React, { useState, useEffect } from 'react';
import salarieService from '../services/salarieService';
import '../styles/GestionSalaries.css';

const GestionSalaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('tous');
    const [selectedSalarie, setSelectedSalarie] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        code_postal: '',
        ville: '',
        date_embauche: '',
        poste: '',
        salaire_mensuel: '',
        taux_horaire: '',
        numero_secu: '',
        status: 'actif'
    });
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        loadSalaries();
    }, []);

    const loadSalaries = async () => {
        try {
            setLoading(true);
            const data = await salarieService.getSalaries();
            setSalaries(data);
        } catch (error) {
            console.error('Erreur chargement salariés:', error);
            alert('Erreur lors du chargement des salariés');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        // Recherche côté client pour simplifier
        return salaries.filter(salarie => {
            const nomComplet = `${salarie.prenom} ${salarie.nom}`.toLowerCase();
            const search = searchTerm.toLowerCase();
            return nomComplet.includes(search) ||
                (salarie.email && salarie.email.toLowerCase().includes(search)) ||
                (salarie.poste && salarie.poste.toLowerCase().includes(search));
        });
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
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            adresse: '',
            code_postal: '',
            ville: '',
            date_embauche: '',
            poste: '',
            salaire_mensuel: '',
            taux_horaire: '',
            numero_secu: '',
            status: 'actif'
        });
        setSelectedSalarie(null);
        setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const validation = salarieService.validateSalarieData(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        try {
            if (selectedSalarie) {
                // Mise à jour
                await salarieService.updateSalarie(selectedSalarie.id, formData);
                alert('Salarié mis à jour avec succès !');
            } else {
                // Création
                await salarieService.createSalarie(formData);
                alert('Salarié créé avec succès !');
            }

            resetForm();
            setShowForm(false);
            loadSalaries();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (salarie) => {
        setSelectedSalarie(salarie);
        setFormData({
            nom: salarie.nom || '',
            prenom: salarie.prenom || '',
            email: salarie.email || '',
            telephone: salarie.telephone || '',
            adresse: salarie.adresse || '',
            code_postal: salarie.code_postal || '',
            ville: salarie.ville || '',
            date_embauche: salarie.date_embauche ? salarie.date_embauche.split('T')[0] : '',
            poste: salarie.poste || '',
            salaire_mensuel: salarie.salaire_mensuel || '',
            taux_horaire: salarie.taux_horaire || '',
            numero_secu: salarie.numero_secu || '',
            status: salarie.status || 'actif'
        });
        setShowForm(true);
    };

    const handleDelete = async (salarieId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce salarié ?')) {
            return;
        }

        try {
            await salarieService.deleteSalarie(salarieId);
            alert('Salarié supprimé avec succès !');
            loadSalaries();
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleStatusChange = async (salarieId, newStatus) => {
        try {
            await salarieService.updateSalarieStatus(salarieId, newStatus);
            alert('Statut mis à jour avec succès !');
            loadSalaries();
        } catch (error) {
            console.error('Erreur mise à jour statut:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const filteredSalaries = handleSearch().filter(salarie => {
        if (filterStatus === 'tous') return true;
        return salarie.status === filterStatus;
    });

    return (
        <div className="gestion-salaries">
            <div className="header">
                <h2>👥 Gestion des Salariés</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                >
                    ➕ Nouveau Salarié
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher un salarié..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className="filter-buttons">
                    <button
                        onClick={() => setFilterStatus('tous')}
                        className={filterStatus === 'tous' ? 'active' : ''}
                    >
                        Tous ({salaries.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('actif')}
                        className={filterStatus === 'actif' ? 'active' : ''}
                    >
                        Actifs
                    </button>
                    <button
                        onClick={() => setFilterStatus('inactif')}
                        className={filterStatus === 'inactif' ? 'active' : ''}
                    >
                        Inactifs
                    </button>
                </div>
            </div>

            {/* Liste des salariés */}
            {loading ? (
                <div className="loading">⏳ Chargement...</div>
            ) : (
                <div className="salaries-list">
                    {filteredSalaries.length === 0 ? (
                        <div className="no-salaries">
                            <p>Aucun salarié trouvé</p>
                        </div>
                    ) : (
                        <div className="salaries-grid">
                            {filteredSalaries.map(salarie => {
                                const formatted = salarieService.formatSalarieData(salarie);
                                return (
                                    <div key={salarie.id} className="salarie-card">
                                        <div className="salarie-header">
                                            <h3>{formatted.nom_complet}</h3>
                                            <span className={`status-badge ${salarie.status}`}>
                                                {salarie.status === 'actif' ? '✅' : '❌'}
                                                {salarie.status}
                                            </span>
                                        </div>

                                        <div className="salarie-info">
                                            {salarie.poste && <p>💼 {salarie.poste}</p>}
                                            <p>📧 {salarie.email}</p>
                                            {salarie.telephone && <p>📞 {salarie.telephone}</p>}
                                            {formatted.date_embauche_fr && <p>📅 Embauché le {formatted.date_embauche_fr}</p>}
                                            {formatted.salaire_formate && <p>💰 {formatted.salaire_formate}/mois</p>}
                                            {formatted.taux_horaire_formate && <p>⏰ {formatted.taux_horaire_formate}</p>}
                                        </div>

                                        <div className="salarie-actions">
                                            <button
                                                onClick={() => handleEdit(salarie)}
                                                className="btn-edit"
                                            >
                                                ✏️ Modifier
                                            </button>

                                            <select
                                                value={salarie.status}
                                                onChange={(e) => handleStatusChange(salarie.id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="actif">✅ Actif</option>
                                                <option value="inactif">❌ Inactif</option>
                                                <option value="conge">🏖️ Congé</option>
                                            </select>

                                            <button
                                                onClick={() => handleDelete(salarie.id)}
                                                className="btn-delete"
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Formulaire salarié */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{selectedSalarie ? 'Modifier Salarié' : 'Nouveau Salarié'}</h3>
                            <button
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="btn-close"
                            >
                                ❌
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="salarie-form">
                            {errors.length > 0 && (
                                <div className="errors">
                                    {errors.map((error, index) => (
                                        <p key={index} className="error">❌ {error}</p>
                                    ))}
                                </div>
                            )}

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

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date d'embauche</label>
                                    <input
                                        type="date"
                                        name="date_embauche"
                                        value={formData.date_embauche}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Poste</label>
                                    <input
                                        type="text"
                                        name="poste"
                                        value={formData.poste}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Salaire mensuel (€)</label>
                                    <input
                                        type="number"
                                        name="salaire_mensuel"
                                        value={formData.salaire_mensuel}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Taux horaire (€)</label>
                                    <input
                                        type="number"
                                        name="taux_horaire"
                                        value={formData.taux_horaire}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Numéro de sécurité sociale</label>
                                    <input
                                        type="text"
                                        name="numero_secu"
                                        value={formData.numero_secu}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Statut</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="actif">✅ Actif</option>
                                        <option value="inactif">❌ Inactif</option>
                                        <option value="conge">🏖️ Congé</option>
                                    </select>
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
                                    {selectedSalarie ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionSalaries;
