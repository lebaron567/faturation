/**
 * Utilitaires pour la gestion des erreurs API
 */

/**
 * Extraire un message d'erreur lisible depuis une erreur Axios
 */
export const getErrorMessage = (error) => {
    // Erreur réseau (CORS, serveur non accessible)
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        return {
            type: 'network',
            message: 'Problème de connexion - Vérifiez que le serveur est démarré',
            details: 'Le backend n\'est pas accessible sur http://localhost:8080'
        };
    }

    // Erreur de timeout
    if (error.code === 'ECONNABORTED') {
        return {
            type: 'timeout',
            message: 'La requête a pris trop de temps - Réessayez',
            details: 'Timeout de 10 secondes dépassé'
        };
    }

    // Erreur avec réponse du serveur
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
            case 400:
                return {
                    type: 'validation',
                    message: 'Données invalides',
                    details: data?.message || 'Vérifiez les informations saisies'
                };

            case 401:
                return {
                    type: 'auth',
                    message: 'Non autorisé',
                    details: 'Token JWT expiré ou invalide - Reconnectez-vous'
                };

            case 403:
                return {
                    type: 'forbidden',
                    message: 'Accès refusé',
                    details: 'Vous n\'avez pas les permissions pour cette action'
                };

            case 404:
                return {
                    type: 'not_found',
                    message: 'Ressource non trouvée',
                    details: data?.message || 'L\'élément demandé n\'existe pas'
                };

            case 409:
                return {
                    type: 'conflict',
                    message: 'Conflit de données',
                    details: data?.message || 'Cette ressource existe déjà'
                };

            case 500:
                return {
                    type: 'server',
                    message: 'Erreur serveur',
                    details: 'Une erreur est survenue côté serveur - Réessayez plus tard'
                };

            default:
                return {
                    type: 'unknown',
                    message: `Erreur HTTP ${status}`,
                    details: data?.message || 'Une erreur inattendue est survenue'
                };
        }
    }

    // Erreur générique
    return {
        type: 'unknown',
        message: 'Erreur inconnue',
        details: error.message || 'Une erreur inattendue est survenue'
    };
};

/**
 * Afficher une notification d'erreur utilisateur-friendly
 */
export const showErrorNotification = (error) => {
    const errorInfo = getErrorMessage(error);

    // En développement, afficher les détails
    if (process.env.REACT_APP_DEBUG === 'true') {
        console.error('🔍 Détails de l\'erreur:', {
            type: errorInfo.type,
            message: errorInfo.message,
            details: errorInfo.details,
            originalError: error
        });
    }

    // Afficher à l'utilisateur
    alert(`❌ ${errorInfo.message}\n\n${errorInfo.details}`);
};

/**
 * Vérifier si une erreur est liée à CORS
 */
export const isCorsError = (error) => {
    return error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK';
};

/**
 * Vérifier si une erreur est liée à l'authentification JWT
 */
export const isAuthError = (error) => {
    return error.response?.status === 401;
};

/**
 * Gestion centralisée des erreurs avec retry automatique
 */
export const handleApiError = async (error, retryFn = null, maxRetries = 1) => {
    const errorInfo = getErrorMessage(error);

    console.error('❌ Erreur API:', errorInfo);

    // Retry automatique pour les erreurs réseau
    if (errorInfo.type === 'network' && retryFn && maxRetries > 0) {
        console.log('🔄 Tentative de retry...');

        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s

        try {
            return await retryFn();
        } catch (retryError) {
            return handleApiError(retryError, retryFn, maxRetries - 1);
        }
    }

    // Afficher l'erreur à l'utilisateur
    showErrorNotification(error);

    throw error;
};
