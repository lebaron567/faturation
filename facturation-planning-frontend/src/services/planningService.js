import api from '../axiosInstance';

/**
 * Service pour la gestion des plannings (routes protégées par JWT)
 */
export const planningService = {
    /**
     * Récupérer tous les plannings de l'entreprise
     */
    async getPlannings() {
        try {
            const response = await api.get('/plannings');
            console.log('📅 Plannings récupérés');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération plannings:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Créer un nouveau planning
     */
    async createPlanning(planningData) {
        try {
            const response = await api.post('/plannings', planningData);
            console.log('✅ Planning créé');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur création planning:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Mettre à jour un planning existant
     */
    async updatePlanning(id, planningData) {
        try {
            const response = await api.put(`/plannings/${id}`, planningData);
            console.log('✅ Planning mis à jour');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur mise à jour planning:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Supprimer un planning
     */
    async deletePlanning(id) {
        try {
            const response = await api.delete(`/plannings/${id}`);
            console.log('🗑️ Planning supprimé');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur suppression planning:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Récupérer un planning par ID
     */
    async getPlanningById(id) {
        try {
            const response = await api.get(`/plannings/${id}`);
            console.log('📅 Planning récupéré par ID');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération planning par ID:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default planningService;
