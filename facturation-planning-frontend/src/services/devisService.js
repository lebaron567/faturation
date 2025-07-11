import axios from "../axiosInstance";

// Service API pour la gestion des devis
export const DevisAPI = {
    // Récupérer tous les devis
    getAll: async () => {
        const response = await axios.get("/devis");
        return response.data;
    },

    // Récupérer un devis par ID
    getById: async (id) => {
        const response = await axios.get(`/devis/${id}`);
        return response.data;
    },

    // Créer un nouveau devis
    create: async (devisData) => {
        const response = await axios.post("/devis", devisData);
        return response.data;
    },

    // Mettre à jour un devis
    update: async (id, devisData) => {
        const response = await axios.put(`/devis/${id}`, devisData);
        return response.data;
    },

    // Supprimer un devis
    delete: async (id) => {
        await axios.delete(`/devis/${id}`);
    },

    // Mettre à jour le statut d'un devis
    updateStatus: async (id, statut) => {
        const response = await axios.patch(`/devis/${id}/statut`, { statut });
        return response.data;
    },

    // Générer un PDF (pour affichage)
    generatePDF: async (id) => {
        const response = await axios.get(`/devis/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Télécharger un PDF
    downloadPDF: async (id) => {
        const response = await axios.get(`/devis/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Récupérer les devis par entreprise
    getByEntreprise: async (entrepriseId) => {
        const response = await axios.get(`/entreprises/${entrepriseId}/devis`);
        return response.data;
    },

    // Récupérer les devis par client
    getByClient: async (clientId) => {
        const response = await axios.get(`/clients/${clientId}/devis`);
        return response.data;
    }
};

// Utilitaires pour les devis
export const DevisUtils = {
    // Formater le prix
    formatPrice: (price) => {
        return price ? price.toFixed(2) + ' €' : '0.00 €';
    },

    // Formater la date
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    },

    // Obtenir la couleur du statut
    getStatusColor: (status) => {
        const colors = {
            'brouillon': '#6c757d',
            'envoyé': '#007bff',
            'accepté': '#28a745',
            'refusé': '#dc3545',
            'expiré': '#fd7e14'
        };
        return colors[status] || colors['brouillon'];
    },

    // Obtenir les options de statut
    getStatusOptions: () => [
        { value: "brouillon", label: "Brouillon", color: "#6c757d" },
        { value: "envoyé", label: "Envoyé", color: "#007bff" },
        { value: "accepté", label: "Accepté", color: "#28a745" },
        { value: "refusé", label: "Refusé", color: "#dc3545" },
        { value: "expiré", label: "Expiré", color: "#fd7e14" }
    ],

    // Calculer les totaux d'un devis
    calculateTotals: (lignes) => {
        let sousTotal = 0;
        let totalTVA = 0;

        lignes.forEach(ligne => {
            const montantHT = ligne.quantite * ligne.prix_unitaire;
            const montantTVA = montantHT * (ligne.tva / 100);

            sousTotal += montantHT;
            totalTVA += montantTVA;
        });

        return {
            sousTotal,
            totalTVA,
            totalTTC: sousTotal + totalTVA
        };
    },

    // Générer une référence de devis
    generateReference: (id, prefix = "DEVIS") => {
        return `${prefix}-${String(id).padStart(4, '0')}`;
    },

    // Vérifier si un devis est expiré
    isExpired: (dateExpiration) => {
        return new Date(dateExpiration) < new Date();
    },

    // Obtenir les statistiques des devis
    getStatistics: (devisList) => {
        const stats = {
            total: devisList.length,
            brouillon: 0,
            envoye: 0,
            accepte: 0,
            refuse: 0,
            expire: 0,
            totalMontant: 0
        };

        devisList.forEach(devis => {
            const statut = devis.statut || 'brouillon';
            stats[statut.replace('é', 'e')] = (stats[statut.replace('é', 'e')] || 0) + 1;
            stats.totalMontant += devis.total_ttc || 0;
        });

        return stats;
    }
};

export default DevisAPI;
