import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = (isAuthenticated) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyPress = (event) => {
            // Ignorer si l'utilisateur tape dans un input
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // Raccourcis avec Ctrl/Cmd
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'h':
                        event.preventDefault();
                        if (isAuthenticated) navigate('/');
                        break;
                    case 'p':
                        event.preventDefault();
                        if (isAuthenticated) navigate('/planning');
                        break;
                    case 'd':
                        event.preventDefault();
                        if (isAuthenticated) navigate('/devis');
                        break;
                    case 'm':
                        event.preventDefault();
                        if (isAuthenticated) navigate('/devis/manager');
                        break;
                    case 'f':
                        event.preventDefault();
                        if (isAuthenticated) navigate('/factures');
                        break;
                    case 'n':
                        event.preventDefault();
                        if (isAuthenticated) navigate('/factures/creer');
                        break;
                    case 'c':
                        event.preventDefault();
                        if (isAuthenticated) navigate('/clients/ajouter');
                        break;
                    default:
                        break;
                }
            }

            // Raccourcis sans modificateur
            switch (event.key) {
                case 'Escape':
                    // Fermer les modales ou revenir en arrière
                    event.preventDefault();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [navigate, isAuthenticated]);

    // Retourner les raccourcis disponibles pour affichage
    return {
        shortcuts: [
            { key: 'Ctrl + H', description: 'Accueil', path: '/' },
            { key: 'Ctrl + P', description: 'Planning', path: '/planning' },
            { key: 'Ctrl + D', description: 'Créer un devis', path: '/devis' },
            { key: 'Ctrl + M', description: 'Gérer les devis', path: '/devis/manager' },
            { key: 'Ctrl + F', description: 'Factures', path: '/factures' },
            { key: 'Ctrl + C', description: 'Nouveau client', path: '/clients/ajouter' },
            { key: 'Échap', description: 'Fermer/Retour', path: null }
        ]
    };
};
