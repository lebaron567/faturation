/**
 * Utilitaires pour la gestion des plannings
 */

// Types d'événements disponibles (synchronisés avec le backend)
export const TYPES_EVENEMENTS = [
  'Absence',
  'Annulation',
  'Congé',
  'Divers',
  'Formation',
  'Intervention',
  'Maladie',
  'Rappel téléphonique',
  'RDV privé',
  'Réunion',
  'RTT',
  'Visite médicale'
];

/**
 * Récupère les types d'événements depuis l'API
 * @returns {Promise<Array<string>>} Liste des types d'événements
 */
export const fetchTypesEvenements = async () => {
  try {
    const response = await fetch('http://localhost:8080/plannings/types-evenements');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des types d\'événements');
    }
    return await response.json();
  } catch (error) {
    console.warn('Erreur API, utilisation des types par défaut:', error);
    return TYPES_EVENEMENTS;
  }
};/**
 * Retourne l'icône associée à un type d'événement
 * @param {string} type - Le type d'événement
 * @returns {string} L'icône correspondante
 */
export const getTypeEvenementIcon = (type) => {
  const icons = {
    'Absence': '🚫',
    'Annulation': '❌',
    'Congé': '🏖️',
    'Divers': '📋',
    'Formation': '📚',
    'Intervention': '🔧',
    'Maladie': '🤒',
    'Rappel téléphonique': '📞',
    'RDV privé': '👤',
    'Réunion': '👥',
    'RTT': '🕐',
    'Visite médicale': '🏥'
  };

  return icons[type] || '📅';
};

/**
 * Retourne la couleur associée à un type d'événement
 * @param {string} type - Le type d'événement
 * @returns {string} La couleur CSS correspondante
 */
export const getTypeEvenementColor = (type) => {
  const colors = {
    'Absence': '#ff6b6b',
    'Annulation': '#e74c3c',
    'Congé': '#3498db',
    'Divers': '#95a5a6',
    'Formation': '#9b59b6',
    'Intervention': '#2ecc71',
    'Maladie': '#e67e22',
    'Rappel téléphonique': '#f39c12',
    'RDV privé': '#34495e',
    'Réunion': '#16a085',
    'RTT': '#8e44ad',
    'Visite médicale': '#c0392b'
  };

  return colors[type] || '#74b9ff';
};

/**
 * Vérifie si un type d'événement nécessite des informations de facturation
 * @param {string} type - Le type d'événement
 * @returns {boolean} True si la facturation est nécessaire
 */
export const requiresFacturation = (type) => {
  const facturableTypes = ['Intervention', 'Formation', 'Divers'];
  return facturableTypes.includes(type);
};

/**
 * Formate l'affichage d'un type d'événement avec son icône
 * @param {string} type - Le type d'événement
 * @returns {string} Le type formaté avec icône
 */
export const formatTypeEvenement = (type) => {
  const icon = getTypeEvenementIcon(type);
  return `${icon} ${type}`;
};
