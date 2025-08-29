import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook personnalisé pour gérer les données d'entreprise
 * @returns {Object} - Contient l'entreprise_id, l'utilisateur et des fonctions utiles
 */
export const useEntreprise = () => {
    const { user, isAuthenticated } = useContext(AuthContext);

    /**
     * Vérifie si l'utilisateur a un entreprise_id valide
     * @returns {boolean}
     */
    const hasValidEntrepriseId = () => {
        return isAuthenticated && user && user.entreprise_id;
    };

    /**
     * Récupère l'entreprise_id de l'utilisateur connecté
     * @returns {number|null}
     */
    const getEntrepriseId = () => {
        return hasValidEntrepriseId() ? user.entreprise_id : null;
    };

    /**
     * Vérifie l'authentification et l'entreprise avant une action
     * @param {string} action - Description de l'action pour le message d'erreur
     * @returns {boolean} - True si OK, False sinon (et affiche une alerte)
     */
    const checkEntrepriseAccess = (action = "effectuer cette action") => {
        if (!isAuthenticated) {
            alert("⚠️ Vous devez être connecté pour " + action + ".");
            return false;
        }

        if (!hasValidEntrepriseId()) {
            console.error("❌ Utilisateur sans entreprise_id:", user);
            alert("⚠️ Impossible de " + action + ". Veuillez vous reconnecter.");
            return false;
        }

        return true;
    };

    return {
        user,
        isAuthenticated,
        entrepriseId: getEntrepriseId(),
        hasValidEntrepriseId,
        getEntrepriseId,
        checkEntrepriseAccess
    };
};
