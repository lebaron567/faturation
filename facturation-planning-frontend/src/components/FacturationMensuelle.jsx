import React, { useState, useEffect } from 'react';
import { facturationMensuelleService } from '../services/facturationMensuelleService';
import axiosInstance from '../axiosInstance';
import { getClientDisplayName } from '../utils/clientUtils';
import '../styles/FacturationMensuelle.css';

const FacturationMensuelle = () => {
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const moisNoms = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await axiosInstance.get('/clients');
      setClients(response.data);
      console.log('📋 Clients chargés:', response.data.length);
    } catch (error) {
      console.error('❌ Erreur chargement clients:', error);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const data = await facturationMensuelleService.getPreview(
        mois, 
        annee, 
        selectedClients.length > 0 ? selectedClients : []
      );
      setPreview(data);
      setShowPreview(true);
    } catch (error) {
      console.error('❌ Erreur preview:', error);
      alert('Erreur lors de la génération de l\'aperçu: ' + (error.response?.data || error.message));
    }
    setLoading(false);
  };

  const handleCreateFactures = async () => {
    if (!preview) return;
    
    const confirm = window.confirm(
      `Créer ${preview.nb_clients} facture(s) pour un total de ${preview.total_general_ttc?.toFixed(2)}€ TTC ?\n\nCette action est irréversible.`
    );
    
    if (!confirm) return;

    setCreating(true);
    try {
      const result = await facturationMensuelleService.createFactures(
        mois, 
        annee, 
        selectedClients.length > 0 ? selectedClients : []
      );
      alert(`✅ ${result.factures_creees?.length || 0} facture(s) créée(s) avec succès !`);
      setShowPreview(false);
      setPreview(null);
    } catch (error) {
      console.error('❌ Erreur création factures:', error);
      alert('Erreur lors de la création des factures: ' + (error.response?.data || error.message));
    }
    setCreating(false);
  };

  const toggleClient = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectAllClients = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const formatDuree = (duree) => {
    if (!duree || duree === 0) return '';
    const heures = Math.floor(duree);
    const minutes = Math.round((duree - heures) * 60);
    return minutes > 0 ? `${heures}h${minutes.toString().padStart(2, '0')}` : `${heures}h`;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="facturation-mensuelle">
      <div className="header">
        <h2>💰 Facturation Mensuelle</h2>
        <p>Générez automatiquement les factures basées sur les plannings du mois</p>
      </div>

      <div className="selection-panel">
        <div className="period-selection">
          <h3>📅 Période</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Mois</label>
              <select value={mois} onChange={(e) => setMois(parseInt(e.target.value))}>
                {moisNoms.slice(1).map((nom, index) => (
                  <option key={index + 1} value={index + 1}>{nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Année</label>
              <input
                type="number"
                value={annee}
                onChange={(e) => setAnnee(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </div>

        <div className="client-selection">
          <h3>👥 Clients (optionnel)</h3>
          <p>Laissez vide pour facturer tous les clients ayant des plannings facturables</p>
          
          {clients.length > 0 && (
            <>
              <div className="select-all">
                <button 
                  onClick={selectAllClients}
                  className="btn-select-all"
                >
                  {selectedClients.length === clients.length ? '❌ Désélectionner tout' : '✅ Sélectionner tout'}
                </button>
                <span className="selection-count">
                  {selectedClients.length} / {clients.length} client(s) sélectionné(s)
                </span>
              </div>

              <div className="clients-grid">
                {clients.map(client => (
                  <label key={client.id} className="client-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClient(client.id)}
                    />
                    <span>{getClientDisplayName(client)}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="actions">
          <button 
            onClick={handlePreview} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '⏳ Génération...' : '👁️ Aperçu de la facturation'}
          </button>
        </div>
      </div>

      {showPreview && preview && (
        <div className="preview-panel">
          <div className="preview-header">
            <h3>📋 Aperçu - {preview.nom_mois} {preview.annee}</h3>
            <div className="preview-stats">
              <span>👥 {preview.nb_clients} client(s)</span>
              <span>📝 {preview.nb_prestations} prestation(s)</span>
              <span className="total-ht">💶 {preview.total_general_ht?.toFixed(2)}€ HT</span>
              <span className="total-ttc">💰 {preview.total_general_ttc?.toFixed(2)}€ TTC</span>
            </div>
          </div>

          {preview.nb_clients === 0 ? (
            <div className="no-data">
              <p>🚫 Aucune prestation facturable trouvée pour cette période.</p>
              <p>Vérifiez que vous avez des plannings de type "Intervention", "Formation" ou "Divers" avec des tarifs définis.</p>
            </div>
          ) : (
            <div className="clients-preview">
              {preview.clients_facturation?.map(client => (
                <div key={client.client_id} className="client-preview">
                  <div className="client-header">
                    <h4>{client.client_nom}</h4>
                    <div className="client-totals">
                      <span>{client.prestations?.length || 0} prestation(s)</span>
                      {client.nb_heures > 0 && <span>{formatDuree(client.nb_heures)}</span>}
                      {client.nb_forfaits > 0 && <span>{client.nb_forfaits} forfait(s)</span>}
                      <strong>{client.total_ttc?.toFixed(2)}€ TTC</strong>
                    </div>
                  </div>
                  
                  <div className="prestations-list">
                    {client.prestations?.map((prestation, index) => (
                      <div key={index} className="prestation-item">
                        <div className="prestation-date">
                          {formatDate(prestation.date)}
                        </div>
                        <div className="prestation-desc">
                          <strong>{prestation.prestation}</strong>
                          {prestation.objet && ` - ${prestation.objet}`}
                          {prestation.type_facturation === 'horaire' && prestation.duree > 0 && (
                            <span className="duree"> ({formatDuree(prestation.duree)})</span>
                          )}
                          {prestation.type_facturation === 'forfait' && (
                            <span className="forfait"> (forfait)</span>
                          )}
                        </div>
                        <div className="prestation-montant">
                          {prestation.montant_ttc?.toFixed(2)}€ TTC
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="preview-actions">
            <button 
              onClick={() => setShowPreview(false)}
              className="btn-secondary"
            >
              ❌ Annuler
            </button>
            {preview.nb_clients > 0 && (
              <button 
                onClick={handleCreateFactures}
                disabled={creating}
                className="btn-success"
              >
                {creating ? '⏳ Création...' : `✅ Créer ${preview.nb_clients} facture(s)`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturationMensuelle;
