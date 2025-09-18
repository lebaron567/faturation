import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export const useAsyncOperation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showSuccess, showError, showWarning } = useToast();

    const execute = async (operation, options = {}) => {
        const {
            successMessage = 'Opération réussie !',
            errorMessage = 'Une erreur est survenue',
            loadingMessage = null,
            showSuccessToast = true,
            showErrorToast = true,
            onSuccess = null,
            onError = null
        } = options;

        setLoading(true);
        setError(null);

        let loadingToastId = null;
        if (loadingMessage) {
            loadingToastId = showWarning(loadingMessage, 0); // 0 = ne se ferme pas automatiquement
        }

        try {
            const result = await operation();

            if (loadingToastId) {
                // Fermer le toast de chargement
                setTimeout(() => {
                    // Le toast sera remplacé par le toast de succès
                }, 100);
            }

            if (showSuccessToast && successMessage) {
                showSuccess(successMessage);
            }

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (err) {
            console.error('Async operation error:', err);
            setError(err);

            if (loadingToastId) {
                // Fermer le toast de chargement
                setTimeout(() => {
                    // Le toast sera remplacé par le toast d'erreur
                }, 100);
            }

            if (showErrorToast) {
                const message = err.response?.data?.message || err.message || errorMessage;
                showError(message);
            }

            if (onError) {
                onError(err);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        execute
    };
};

// Hook spécialisé pour les opérations CRUD
export const useCrudOperations = (entityName = 'élément') => {
    const asyncOp = useAsyncOperation();

    const create = (operation, data) => {
        return asyncOp.execute(operation, {
            successMessage: `${entityName} créé avec succès ! ✨`,
            errorMessage: `Erreur lors de la création du ${entityName}`,
            loadingMessage: `Création en cours...`
        });
    };

    const update = (operation, data) => {
        return asyncOp.execute(operation, {
            successMessage: `${entityName} mis à jour avec succès ! 🔄`,
            errorMessage: `Erreur lors de la mise à jour du ${entityName}`,
            loadingMessage: `Mise à jour en cours...`
        });
    };

    const remove = (operation, data) => {
        return asyncOp.execute(operation, {
            successMessage: `${entityName} supprimé avec succès ! 🗑️`,
            errorMessage: `Erreur lors de la suppression du ${entityName}`,
            loadingMessage: `Suppression en cours...`
        });
    };

    const fetch = (operation) => {
        return asyncOp.execute(operation, {
            showSuccessToast: false,
            errorMessage: `Erreur lors du chargement des ${entityName}s`,
            loadingMessage: `Chargement...`
        });
    };

    return {
        ...asyncOp,
        create,
        update,
        remove,
        fetch
    };
};