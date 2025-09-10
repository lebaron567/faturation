/**
 * Utilitaires pour la gestion des clients
 */

/**
 * Retourne le nom d'affichage d'un client selon son type
 * @param {Object} client - L'objet client
 * @returns {string} Le nom d'affichage du client
 */
export const getClientDisplayName = (client) => {
    if (!client) return "Client inconnu";

    // Nouveau format avec type_client
    if (client.type_client === "particulier") {
        const parts = [];
        if (client.civilite) parts.push(client.civilite);
        if (client.prenom) parts.push(client.prenom);
        if (client.nom) parts.push(client.nom);

        if (parts.length > 0) {
            return parts.join(" ");
        }
        return "Client particulier";

    } else if (client.type_client === "professionnel") {
        if (client.nom_organisme) {
            return client.nom_organisme;
        }
        return "Organisme professionnel";
    }

    // Fallback pour l'ancien format ou données invalides
    if (client.nom_organisme) {
        return client.nom_organisme;
    }
    if (client.nom) {
        return client.nom;
    }

    return "Client sans nom";
};

/**
 * Retourne l'adresse complète d'un client
 * @param {Object} client - L'objet client
 * @returns {string} L'adresse complète
 */
export const getClientFullAddress = (client) => {
    if (!client) return "";

    const parts = [];

    if (client.adresse) parts.push(client.adresse);
    if (client.complement_adresse) parts.push(client.complement_adresse);

    const cityPart = [];
    if (client.code_postal) cityPart.push(client.code_postal);
    if (client.ville) cityPart.push(client.ville);

    if (cityPart.length > 0) {
        parts.push(cityPart.join(" "));
    }

    return parts.join("\n");
};

/**
 * Retourne le type d'icône pour un client
 * @param {Object} client - L'objet client
 * @returns {string} L'icône emoji
 */
export const getClientIcon = (client) => {
    if (!client) return "❓";

    if (client.type_client === "particulier") {
        return "👤";
    } else if (client.type_client === "professionnel") {
        return "🏢";
    }

    // Fallback pour l'ancien format
    return "🏢";
};

/**
 * Retourne le nom pour l'affichage dans les sélecteurs
 * @param {Object} client - L'objet client
 * @returns {string} Le nom formaté pour les sélecteurs
 */
export const getClientSelectLabel = (client) => {
    if (!client) return "Client inconnu";

    const displayName = getClientDisplayName(client);
    const icon = getClientIcon(client);

    if (client.email) {
        return `${icon} ${displayName} (${client.email})`;
    }

    return `${icon} ${displayName}`;
};
