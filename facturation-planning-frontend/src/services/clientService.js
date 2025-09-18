import axiosInstance from '../axiosInstance';

/**
 * Service pour la gestion des clients
 */
export const clientService = {
    /**
     * Récupérer tous les clients
     */
    async getClients() {
        try {
            const response = await axiosInstance.get('/clients');
            console.log('📋 Clients récupérés:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération clients:', error);
            throw error;
        }
    },

    /**
     * Récupérer un client par ID
     */
    async getClientById(id) {
        try {
            const response = await axiosInstance.get(`/clients/${id}`);
            console.log('👤 Client récupéré:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération client:', error);
            throw error;
        }
    },

    /**
     * Créer un nouveau client
     */
    async createClient(clientData) {
        try {
            console.log('➕ Création client:', clientData);
            const response = await axiosInstance.post('/clients', clientData);
            console.log('✅ Client créé:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur création client:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour un client
     */
    async updateClient(id, clientData) {
        try {
            console.log('📝 Mise à jour client:', id, clientData);
            const response = await axiosInstance.put(`/clients/${id}`, clientData);
            console.log('✅ Client mis à jour:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur mise à jour client:', error);
            throw error;
        }
    },

    /**
     * Supprimer un client
     */
    async deleteClient(id) {
        try {
            console.log('🗑️ Suppression client:', id);
            await axiosInstance.delete(`/clients/${id}`);
            console.log('✅ Client supprimé');
            return true;
        } catch (error) {
            console.error('❌ Erreur suppression client:', error);
            throw error;
        }
    },

    /**
     * Rechercher des clients
     */
    async searchClients(searchTerm) {
        try {
            const response = await axiosInstance.get(`/clients/search?q=${encodeURIComponent(searchTerm)}`);
            console.log('🔍 Recherche clients:', response.data.length, 'résultats');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur recherche clients:', error);
            throw error;
        }
    },

    /**
     * Récupérer les clients par type
     */
    async getClientsByType(type) {
        try {
            const response = await axiosInstance.get(`/clients?type=${type}`);
            console.log(`👥 Clients ${type}:`, response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur récupération clients par type:', error);
            throw error;
        }
    },

    /**
     * Valider les données client avant envoi
     */
    validateClientData(clientData) {
        const errors = [];

        // Validation email
        if (!clientData.email || !clientData.email.includes('@')) {
            errors.push('Email invalide');
        }

        // Validation type client
        if (!['particulier', 'professionnel'].includes(clientData.type_client)) {
            errors.push('Type de client invalide');
        }

        // Validation spécifique selon le type
        if (clientData.type_client === 'particulier') {
            if (!clientData.nom || !clientData.prenom) {
                errors.push('Nom et prénom obligatoires pour les particuliers');
            }
        } else if (clientData.type_client === 'professionnel') {
            if (!clientData.raison_sociale) {
                errors.push('Raison sociale obligatoire pour les professionnels');
            }
        }

        // Validation téléphone (optionnel mais format si présent)
        if (clientData.telephone && !/^[\d\s\-\+\(\)\.]+$/.test(clientData.telephone)) {
            errors.push('Format de téléphone invalide');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

export default clientService;
