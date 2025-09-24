import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import LoadingSpinner from './LoadingSpinner';
import clientService from '../services/clientService';
import salarieService from '../services/salarieService';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        clients: { total: 0, particuliers: 0, professionnels: 0 },
        salaries: { total: 0, actifs: 0, inactifs: 0 },
        factures: { total: 0, payees: 0, enAttente: 0, montantTotal: 0 },
        devis: { total: 0, acceptes: 0, enCours: 0, refuses: 0 }
    });

    const { loading, execute } = useAsyncOperation();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            await execute(async () => {
                // Chargement parallèle des données
                const [clientsData, salariesData] = await Promise.all([
                    clientService.getClients(),
                    salarieService.getSalaries()
                ]);

                // Calcul des statistiques clients
                const clientStats = {
                    total: clientsData.length,
                    particuliers: clientsData.filter(c => c.type_client === 'particulier').length,
                    professionnels: clientsData.filter(c => c.type_client === 'professionnel').length
                };

                // Calcul des statistiques salariés
                const salarieStats = {
                    total: salariesData.length,
                    actifs: salariesData.filter(s => s.status === 'actif').length,
                    inactifs: salariesData.filter(s => s.status === 'inactif').length
                };

                setStats(prev => ({
                    ...prev,
                    clients: clientStats,
                    salaries: salarieStats
                }));
            }, {
                showSuccessToast: false,
                errorMessage: 'Erreur lors du chargement des statistiques'
            });
        } catch (error) {
            console.error('Erreur dashboard:', error);
        }
    };

    const StatCard = ({ title, value, subtitle, icon, color, trend, onClick }) => (
        <div
            className={`stat-card ${color} ${onClick ? 'clickable' : ''}`}
            onClick={onClick}
        >
            <div className="stat-header">
                <div className="stat-icon">{icon}</div>
                {trend && (
                    <div className={`stat-trend ${trend.type}`}>
                        {trend.type === 'up' ? '📈' : trend.type === 'down' ? '📉' : '➡️'}
                        {trend.value}
                    </div>
                )}
            </div>
            <div className="stat-content">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
                {subtitle && <p className="stat-subtitle">{subtitle}</p>}
            </div>
        </div>
    );

    const QuickAction = ({ title, description, icon, onClick, color = 'primary' }) => (
        <button className={`quick-action ${color}`} onClick={onClick}>
            <div className="quick-action-icon">{icon}</div>
            <div className="quick-action-content">
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
        </button>
    );

    const navigateTo = (path) => {
        window.location.href = path;
    };

    if (loading) {
        return <LoadingSpinner size="large" fullscreen />;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>📊 Tableau de bord</h1>
                <p>Aperçu de votre activité</p>
            </div>

            {/* Statistiques principales */}
            <div className="stats-grid">
                <StatCard
                    title="Total Clients"
                    value={stats.clients.total}
                    subtitle={`${stats.clients.particuliers} particuliers • ${stats.clients.professionnels} professionnels`}
                    icon="👥"
                    color="blue"
                    onClick={() => navigateTo('/clients/gestion')}
                />

                <StatCard
                    title="Salariés Actifs"
                    value={stats.salaries.actifs}
                    subtitle={`${stats.salaries.total} total • ${stats.salaries.inactifs} inactifs`}
                    icon="👨‍💼"
                    color="green"
                    onClick={() => navigateTo('/salaries/gestion')}
                />

                <StatCard
                    title="Factures"
                    value={stats.factures.total}
                    subtitle={`${stats.factures.payees} payées • ${stats.factures.enAttente} en attente`}
                    icon="🧾"
                    color="purple"
                    onClick={() => navigateTo('/factures')}
                />

                <StatCard
                    title="Devis"
                    value={stats.devis.total}
                    subtitle={`${stats.devis.acceptes} acceptés • ${stats.devis.enCours} en cours`}
                    icon="📋"
                    color="orange"
                    onClick={() => navigateTo('/devis/manager')}
                />
            </div>

            {/* Actions rapides */}
            <div className="dashboard-section">
                <h2>⚡ Actions rapides</h2>
                <div className="quick-actions-grid">
                    <QuickAction
                        title="Nouveau Client"
                        description="Ajouter un nouveau client"
                        icon="👤"
                        onClick={() => navigateTo('/clients/ajouter')}
                        color="blue"
                    />

                    <QuickAction
                        title="Créer Devis"
                        description="Créer un nouveau devis"
                        icon="✨"
                        onClick={() => navigateTo('/devis/creer')}
                        color="green"
                    />

                    <QuickAction
                        title="Nouvelle Facture"
                        description="Créer une nouvelle facture"
                        icon="➕"
                        onClick={() => navigateTo('/factures/creer')}
                        color="purple"
                    />

                    <QuickAction
                        title="Planning"
                        description="Voir le planning"
                        icon="📅"
                        onClick={() => navigateTo('/planning')}
                        color="orange"
                    />
                </div>
            </div>

            {/* Bouton de rafraîchissement */}
            <div className="dashboard-footer">
                <button
                    className="refresh-button"
                    onClick={loadDashboardData}
                    disabled={loading}
                >
                    {loading ? '⏳' : '🔄'} Actualiser
                </button>
            </div>
        </div>
    );
};

export default Dashboard;