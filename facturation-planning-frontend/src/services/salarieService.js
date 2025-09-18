import axiosInstance from '../axiosInstance';

/**
 * Service pour la gestion des salariés
 */
export const salarieService = {
    /**
     * Récupérer tous les salariés
     */
    async getSalaries() {
        try {
            const response = await axiosInstance.get('/salaries');
            console.log('👥 Salariés récupérés:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération salariés:', error);
            throw error;
        }
    },

    /**
     * Récupérer un salarié par ID
     */
    async getSalarieById(id) {
        try {
            const response = await axiosInstance.get(`/salaries/${id}`);
            console.log('👤 Salarié récupéré:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération salarié:', error);
            throw error;
        }
    },

    /**
     * Créer un nouveau salarié
     */
    async createSalarie(salarieData) {
        try {
            console.log('➕ Création salarié:', salarieData);
            const response = await axiosInstance.post('/salaries', salarieData);
            console.log('✅ Salarié créé:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur création salarié:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour un salarié
     */
    async updateSalarie(id, salarieData) {
        try {
            console.log('📝 Mise à jour salarié:', id, salarieData);
            const response = await axiosInstance.put(`/salaries/${id}`, salarieData);
            console.log('✅ Salarié mis à jour:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur mise à jour salarié:', error);
            throw error;
        }
    },

    /**
     * Supprimer un salarié
     */
    async deleteSalarie(id) {
        try {
            console.log('🗑️ Suppression salarié:', id);
            await axiosInstance.delete(`/salaries/${id}`);
            console.log('✅ Salarié supprimé');
            return true;
        } catch (error) {
            console.error('❌ Erreur suppression salarié:', error);
            throw error;
        }
    },

    /**
     * Rechercher des salariés
     */
    async searchSalaries(searchTerm) {
        try {
            const response = await axiosInstance.get(`/salaries/search?q=${encodeURIComponent(searchTerm)}`);
            console.log('🔍 Recherche salariés:', response.data.length, 'résultats');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur recherche salariés:', error);
            throw error;
        }
    },

    /**
     * Récupérer les salariés actifs
     */
    async getActiveSalaries() {
        try {
            const response = await axiosInstance.get('/salaries?status=actif');
            console.log('👥 Salariés actifs:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération salariés actifs:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour le statut d'un salarié
     */
    async updateSalarieStatus(id, status) {
        try {
            console.log('📊 Mise à jour statut salarié:', id, status);
            const response = await axiosInstance.patch(`/salaries/${id}/status`, { status });
            console.log('✅ Statut salarié mis à jour:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur mise à jour statut salarié:', error);
            throw error;
        }
    },

    /**
     * Calculer les heures travaillées pour un salarié
     */
    async getHeuresTravaillees(salarieId, dateDebut, dateFin) {
        try {
            const response = await axiosInstance.get(`/salaries/${salarieId}/heures`, {
                params: { date_debut: dateDebut, date_fin: dateFin }
            });
            console.log('⏰ Heures travaillées:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur calcul heures travaillées:', error);
            throw error;
        }
    },

    /**
     * Valider les données salarié avant envoi
     */
    validateSalarieData(salarieData) {
        const errors = [];

        // Validation champs obligatoires
        if (!salarieData.nom || salarieData.nom.trim().length < 2) {
            errors.push('Nom obligatoire (minimum 2 caractères)');
        }

        if (!salarieData.prenom || salarieData.prenom.trim().length < 2) {
            errors.push('Prénom obligatoire (minimum 2 caractères)');
        }

        // Validation email
        if (!salarieData.email || !salarieData.email.includes('@')) {
            errors.push('Email invalide');
        }

        // Validation téléphone (optionnel mais format si présent)
        if (salarieData.telephone && !/^[\d\s\-\+\(\)\.]+$/.test(salarieData.telephone)) {
            errors.push('Format de téléphone invalide');
        }

        // Validation date embauche
        if (salarieData.date_embauche) {
            const dateEmbauche = new Date(salarieData.date_embauche);
            const aujourd_hui = new Date();
            if (dateEmbauche > aujourd_hui) {
                errors.push('La date d\'embauche ne peut pas être dans le futur');
            }
        }

        // Validation salaire (si présent)
        if (salarieData.salaire_mensuel && (isNaN(salarieData.salaire_mensuel) || salarieData.salaire_mensuel < 0)) {
            errors.push('Salaire mensuel invalide');
        }

        // Validation taux horaire (si présent)
        if (salarieData.taux_horaire && (isNaN(salarieData.taux_horaire) || salarieData.taux_horaire < 0)) {
            errors.push('Taux horaire invalide');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Formater les données pour l'affichage
     */
    formatSalarieData(salarie) {
        return {
            ...salarie,
            nom_complet: `${salarie.prenom} ${salarie.nom}`,
            date_embauche_fr: salarie.date_embauche ?
                new Date(salarie.date_embauche).toLocaleDateString('fr-FR') : '',
            salaire_formate: salarie.salaire_mensuel ?
                `${salarie.salaire_mensuel.toLocaleString('fr-FR')}€` : '',
            taux_horaire_formate: salarie.taux_horaire ?
                `${salarie.taux_horaire}€/h` : ''
        };
    }
};

export default salarieService;
