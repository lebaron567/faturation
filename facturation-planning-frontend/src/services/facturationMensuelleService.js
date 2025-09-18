import axiosInstance from '../axiosInstance';

export const facturationMensuelleService = {
    /**
     * Obtient un aperçu de la facturation mensuelle
     * @param {number} mois - Mois (1-12)
     * @param {number} annee - Année
     * @param {Array<number>} clientIds - IDs des clients (optionnel)
     * @returns {Promise<Object>} Données de prévisualisation
     */
    async getPreview(mois, annee, clientIds = []) {
        try {
            console.log('🔍 Demande aperçu facturation:', { mois, annee, clientIds });
            const response = await axiosInstance.post('/facturation-mensuelle/preview', {
                mois,
                annee,
                client_ids: clientIds
            });
            console.log('✅ Aperçu reçu:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur aperçu facturation mensuelle:', error);
            throw error;
        }
    },

    /**
     * Crée effectivement les factures mensuelles
     * @param {number} mois - Mois (1-12)
     * @param {number} annee - Année
     * @param {Array<number>} clientIds - IDs des clients (optionnel)
     * @returns {Promise<Object>} Résultat de la création
     */
    async createFactures(mois, annee, clientIds = []) {
        try {
            console.log('📄 Création factures:', { mois, annee, clientIds });
            const response = await axiosInstance.post('/facturation-mensuelle/create', {
                mois,
                annee,
                client_ids: clientIds
            });
            console.log('✅ Factures créées:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur création facturation mensuelle:', error);
            throw error;
        }
    }
};
