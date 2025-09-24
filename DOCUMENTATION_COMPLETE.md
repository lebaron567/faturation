# 📚 Documentation Complète - Application de Facturation

**Projet** : Application de Gestion de Facturation et Planning  
**Auteur** : Émeric - ODI SERVICE PRO  
**Date** : Septembre 2025  
**Version** : 2.0 - Production Ready

---

## 🎯 Vue d'ensemble du Projet

### Architecture Générale
```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 Frontend (React.js)                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Dashboard     │ │ Gestion Clients │ │ Facturation     │ │
│  │  Statistiques   │ │   & Salariés    │ │   & Devis       │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   🔧 Backend (Go + Gin)                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │      API        │ │   Middleware    │ │     Models      │ │
│  │   Controllers   │ │   JWT + CORS    │ │   GORM + DB     │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                🗄️ Base de données PostgreSQL                │
│     Tables : Clients, Salariés, Factures, Devis, etc.     │
└─────────────────────────────────────────────────────────────┘
```

### Technologies Utilisées
- **Frontend** : React.js 18, React Router, Axios, CSS3
- **Backend** : Go 1.23, Gin Framework, GORM, JWT
- **Base de données** : PostgreSQL 16
- **Containerisation** : Docker + Docker Compose
- **Proxy** : Caddy Server
- **Production** : Scripts de déploiement, monitoring, sécurité

---

## 🚀 Backend (Go + Gin)

### Structure du Projet Backend

```
facturation-planning-backend/
├── main.go                 # Point d'entrée principal
├── go.mod & go.sum        # Gestion des dépendances
├── Dockerfile             # Configuration Docker
├── auth/
│   └── jwt.go             # Gestion JWT
├── config/
│   ├── database.go        # Configuration BDD
│   └── company.go         # Configuration entreprise
├── controllers/
│   ├── auth_controller.go      # Authentification
│   ├── client_controller.go    # Gestion clients
│   ├── devis_controller.go     # Gestion devis
│   ├── factures_controllers.go # Gestion factures
│   ├── planning_controller.go  # Gestion planning
│   ├── salaries_controllers.go # Gestion salariés
│   └── entreprise_controller.go
├── database/
│   └── migrations.go      # Migrations automatiques
├── middlewares/
│   ├── auth_middleware.go # Middleware JWT
│   └── cors_middleware.go # Configuration CORS
├── models/
│   ├── client.go         # Modèle client
│   ├── facture.go        # Modèle facture
│   ├── devis.go          # Modèle devis
│   ├── planning.go       # Modèle planning
│   ├── salarie.go        # Modèle salarié
│   └── entreprise.go     # Modèle entreprise
├── routes/
│   ├── routes.go         # Configuration routes
│   ├── auth_routes.go    # Routes authentification
│   └── facture_routes.go # Routes factures
├── templates/            # Templates PDF
├── assets/              # Assets (fonts, logos)
└── utils/
    └── pdf.go           # Génération PDF
```

### Fonctionnalités Backend Développées

#### 🔐 **Système d'Authentification**
```go
// auth/jwt.go
func GenerateJWT(userID uint) (string, error)
func ValidateJWT(tokenString string) (*Claims, error)

// controllers/auth_controller.go
func Login(c *gin.Context)        // POST /login
func Register(c *gin.Context)     // POST /register
func GetProfile(c *gin.Context)   // GET /profile
```

**Fonctionnalités :**
- Génération et validation JWT
- Hashage sécurisé des mots de passe (bcrypt)
- Middleware de protection des routes
- Gestion des sessions utilisateur

#### 👥 **Gestion des Clients**
```go
// controllers/client_controller.go
func GetClients(c *gin.Context)     // GET /clients
func CreateClient(c *gin.Context)   // POST /clients
func UpdateClient(c *gin.Context)   // PUT /clients/:id
func DeleteClient(c *gin.Context)   // DELETE /clients/:id
func GetClient(c *gin.Context)      // GET /clients/:id
```

**Modèle Client :**
```go
type Client struct {
    ID                uint      `json:"id" gorm:"primaryKey"`
    TypeClient        string    `json:"type_client"`
    NomOrganisme      *string   `json:"nom_organisme"`
    Nom               *string   `json:"nom"`
    Prenom            *string   `json:"prenom"`
    Adresse           string    `json:"adresse"`
    ComplementAdresse string    `json:"complement_adresse"`
    CodePostal        string    `json:"code_postal"`
    Ville             string    `json:"ville"`
    Email             string    `json:"email"`
    Telephone         string    `json:"telephone"`
    EntrepriseID      uint      `json:"entreprise_id"`
    CreatedAt         time.Time `json:"created_at"`
    UpdatedAt         time.Time `json:"updated_at"`
}
```

**Fonctionnalités :**
- Support clients particuliers et professionnels
- Validation des données
- Relations avec entreprises
- CRUD complet

#### 👨‍💼 **Gestion des Salariés**
```go
// controllers/salaries_controllers.go
func GetSalaries(c *gin.Context)    // GET /salaries
func CreateSalarie(c *gin.Context)  // POST /salaries
func UpdateSalarie(c *gin.Context)  // PUT /salaries/:id
func DeleteSalarie(c *gin.Context)  // DELETE /salaries/:id
```

**Modèle Salarié :**
```go
type Salarie struct {
    ID           uint      `json:"id" gorm:"primaryKey"`
    Nom          string    `json:"nom"`
    Prenom       string    `json:"prenom"`
    Email        string    `json:"email"`
    Telephone    string    `json:"telephone"`
    Poste        string    `json:"poste"`
    Salaire      float64   `json:"salaire"`
    Status       string    `json:"status"`
    EntrepriseID uint      `json:"entreprise_id"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}
```

#### 💰 **Gestion des Factures**
```go
// controllers/factures_controllers.go
func GetFactures(c *gin.Context)      // GET /factures
func CreateFacture(c *gin.Context)    // POST /factures
func UpdateFacture(c *gin.Context)    // PUT /factures/:id
func DeleteFacture(c *gin.Context)    // DELETE /factures/:id
func GenerateFacturePDF(c *gin.Context) // GET /factures/:id/pdf
```

**Modèle Facture :**
```go
type Facture struct {
    ID           uint      `json:"id" gorm:"primaryKey"`
    Numero       string    `json:"numero" gorm:"unique"`
    ClientID     uint      `json:"client_id"`
    Client       Client    `json:"client" gorm:"foreignKey:ClientID"`
    DateFacture  time.Time `json:"date_facture"`
    DateEcheance time.Time `json:"date_echeance"`
    Montant      float64   `json:"montant"`
    TVA          float64   `json:"tva"`
    TotalTTC     float64   `json:"total_ttc"`
    Status       string    `json:"status"`
    Notes        string    `json:"notes"`
    EntrepriseID uint      `json:"entreprise_id"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}
```

**Fonctionnalités :**
- Génération automatique des numéros
- Calcul automatique TVA et totaux
- Génération PDF avec templates
- Statuts : brouillon, envoyée, payée, annulée

#### 📋 **Gestion des Devis**
```go
// controllers/devis_controller.go
func GetDevis(c *gin.Context)         // GET /devis
func CreateDevis(c *gin.Context)      // POST /devis
func UpdateDevis(c *gin.Context)      // PUT /devis/:id
func DeleteDevis(c *gin.Context)      // DELETE /devis/:id
func GenerateDevisPDF(c *gin.Context) // GET /devis/:id/pdf
func ConvertToFacture(c *gin.Context) // POST /devis/:id/convert
```

**Modèle Devis avec Lignes :**
```go
type Devis struct {
    ID          uint        `json:"id" gorm:"primaryKey"`
    Numero      string      `json:"numero" gorm:"unique"`
    ClientID    uint        `json:"client_id"`
    Client      Client      `json:"client"`
    Titre       string      `json:"titre"`
    DateDevis   time.Time   `json:"date_devis"`
    ValiditeJours int       `json:"validite_jours"`
    Status      string      `json:"status"`
    SousTotal   float64     `json:"sous_total"`
    TVA         float64     `json:"tva"`
    Total       float64     `json:"total"`
    Notes       string      `json:"notes"`
    Lignes      []LigneDevis `json:"lignes"`
    EntrepriseID uint       `json:"entreprise_id"`
    CreatedAt   time.Time   `json:"created_at"`
    UpdatedAt   time.Time   `json:"updated_at"`
}

type LigneDevis struct {
    ID          uint    `json:"id" gorm:"primaryKey"`
    DevisID     uint    `json:"devis_id"`
    Description string  `json:"description"`
    Quantite    float64 `json:"quantite"`
    PrixUnitaire float64 `json:"prix_unitaire"`
    Total       float64 `json:"total"`
}
```

**Fonctionnalités :**
- Système de lignes détaillées
- Conversion devis → facture
- Gestion des statuts et validité
- Calculs automatiques

#### 📅 **Gestion du Planning**
```go
// controllers/planning_controller.go
func GetPlannings(c *gin.Context)    // GET /plannings
func CreatePlanning(c *gin.Context)  // POST /plannings
func UpdatePlanning(c *gin.Context)  // PUT /plannings/:id
func DeletePlanning(c *gin.Context)  // DELETE /plannings/:id
```

#### 🏥 **Health Check et Monitoring**
```go
// routes/routes.go
r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"healthy","timestamp":"` + time.Now().Format(time.RFC3339) + `"}`))
})
```

### Configuration et Déploiement Backend

#### Variables d'Environnement
```env
DB_HOST=db
DB_PORT=5432
DB_NAME=facturation
DB_USER=facturation_user
DB_PASSWORD=change_me_secure_password_123
PORT=8080
ENV=production
CORS_ORIGINS=http://localhost
```

#### Migrations Automatiques
```go
// database/migrations.go
func RunMigrations() {
    config.DB.AutoMigrate(
        &models.Entreprise{},
        &models.Client{},
        &models.Salarie{},
        &models.Facture{},
        &models.Devis{},
        &models.LigneDevis{},
        &models.Planning{},
    )
}
```

---

## 🎨 Frontend (React.js)

### Structure du Projet Frontend

```
facturation-planning-frontend/
├── package.json           # Dépendances Node.js
├── Dockerfile            # Configuration Docker
├── public/              # Assets publics
└── src/
    ├── App.jsx          # Composant principal + routes
    ├── index.js         # Point d'entrée React
    ├── axiosInstance.js # Configuration Axios
    ├── components/      # Composants React
    ├── contexts/        # Contextes React (Auth, Toast)
    ├── hooks/          # Hooks personnalisés
    ├── services/       # Services API
    └── styles/         # Fichiers CSS
```

### Contextes et Hooks Développés

#### 🔐 **AuthContext**
```jsx
// contexts/AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const login = async (credentials) => { /* ... */ };
    const logout = () => { /* ... */ };
    const checkAuth = () => { /* ... */ };
    
    return (
        <AuthContext.Provider value={{
            isAuthenticated, user, login, logout, loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
```

#### 🍞 **ToastContext** (Notifications)
```jsx
// contexts/ToastContext.jsx
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    
    const showSuccess = (message) => addToast(message, 'success');
    const showError = (message) => addToast(message, 'error');
    const showWarning = (message) => addToast(message, 'warning');
    const showInfo = (message) => addToast(message, 'info');
    
    return (
        <ToastContext.Provider value={{
            showSuccess, showError, showWarning, showInfo
        }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
```

#### ⚡ **useAsyncOperation** (Hook Personnalisé)
```jsx
// hooks/useAsyncOperation.js
export const useAsyncOperation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showSuccess, showError } = useToast();

    const execute = async (operation, options = {}) => {
        try {
            setLoading(true);
            setError(null);
            const result = await operation();
            if (options.showSuccessToast) {
                showSuccess(options.successMessage);
            }
            return result;
        } catch (err) {
            setError(err);
            if (options.showErrorToast) {
                showError(options.errorMessage);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, execute };
};
```

### Composants Principaux Développés

#### 📊 **Dashboard** (Page d'accueil)
```jsx
// components/Dashboard.jsx
const Dashboard = () => {
    const [stats, setStats] = useState({
        clients: { total: 0, particuliers: 0, professionnels: 0 },
        salaries: { total: 0, actifs: 0, inactifs: 0 },
        factures: { total: 0, payees: 0, enAttente: 0 },
        devis: { total: 0, acceptes: 0, enCours: 0 }
    });

    // Cartes de statistiques
    const StatCard = ({ title, value, subtitle, icon, color, onClick }) => (
        <div className={`stat-card ${color}`} onClick={onClick}>
            <div className="stat-icon">{icon}</div>
            <h3 className="stat-value">{value}</h3>
            <p className="stat-title">{title}</p>
            {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
    );

    // Actions rapides
    const QuickAction = ({ title, description, icon, onClick }) => (
        <button className="quick-action" onClick={onClick}>
            <div className="quick-action-icon">{icon}</div>
            <div className="quick-action-content">
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
        </button>
    );

    return (
        <div className="dashboard">
            <div className="stats-grid">
                <StatCard title="Total Clients" value={stats.clients.total} /* ... */ />
                <StatCard title="Salariés Actifs" value={stats.salaries.actifs} /* ... */ />
                {/* ... */}
            </div>
            
            <div className="quick-actions-grid">
                <QuickAction title="Nouveau Client" /* ... */ />
                <QuickAction title="Créer Devis" /* ... */ />
                {/* ... */}
            </div>
        </div>
    );
};
```

**Fonctionnalités Dashboard :**
- Statistiques en temps réel (clients, salariés, factures, devis)
- Cartes interactives cliquables
- Actions rapides vers les principales fonctionnalités
- Design responsive et moderne
- Loading states et gestion d'erreurs

#### 👥 **GestionClients**
```jsx
// components/GestionClients.jsx
const GestionClients = () => {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        typeClient: '',
        sortBy: 'nom'
    });

    // Fonctionnalités
    const handleSearch = (searchTerm) => { /* ... */ };
    const handleFilter = (filterType, value) => { /* ... */ };
    const handleSort = (sortField) => { /* ... */ };
    const handleEdit = (client) => { /* ... */ };
    const handleDelete = (clientId) => { /* ... */ };

    return (
        <div className="gestion-clients">
            <SearchAndFilter 
                onSearch={handleSearch}
                onFilter={handleFilter}
                onSort={handleSort}
            />
            <ClientsTable 
                clients={filteredClients}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};
```

**Fonctionnalités GestionClients :**
- Liste complète des clients avec pagination
- Recherche temps réel par nom/email/ville
- Filtres par type (particulier/professionnel)
- Tri par différents critères
- Actions CRUD (Créer, Lire, Modifier, Supprimer)
- Modals de confirmation pour suppressions

#### 👨‍💼 **GestionSalaries**
```jsx
// components/GestionSalaries.jsx
const GestionSalaries = () => {
    const [salaries, setSalaries] = useState([]);
    const { loading, execute } = useAsyncOperation();

    const loadSalaries = async () => {
        await execute(async () => {
            const data = await salarieService.getSalaries();
            setSalaries(data);
        }, {
            errorMessage: 'Erreur lors du chargement des salariés',
            showSuccessToast: false
        });
    };

    // Interface similaire à GestionClients
    return (
        <div className="gestion-salaries">
            {/* Interface de gestion des salariés */}
        </div>
    );
};
```

#### 📄 **FactureManager & DevisManager**
Composants similaires pour la gestion des factures et devis avec :
- Listes avec filtres et recherche
- Génération PDF
- Gestion des statuts
- Conversion devis → facture

#### 🔄 **LoadingSpinner**
```jsx
// components/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'medium', message, fullscreen = false }) => {
    if (fullscreen) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner-container">
                    <div className={`loading-spinner ${size}`}></div>
                    {message && <p className="loading-message">{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className={`loading-spinner ${size}`}>
            {message && <span className="loading-text">{message}</span>}
        </div>
    );
};

// Composants skeleton pour un meilleur UX
export const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
    </div>
);
```

### Services API Frontend

#### 🔌 **Configuration Axios**
```javascript
// axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token JWT
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

#### 👥 **clientService**
```javascript
// services/clientService.js
export const clientService = {
    async getClients() {
        const response = await axiosInstance.get('/clients');
        return response.data;
    },

    async createClient(clientData) {
        const response = await axiosInstance.post('/clients', clientData);
        return response.data;
    },

    async updateClient(id, clientData) {
        const response = await axiosInstance.put(`/clients/${id}`, clientData);
        return response.data;
    },

    async deleteClient(id) {
        await axiosInstance.delete(`/clients/${id}`);
    },

    async getClient(id) {
        const response = await axiosInstance.get(`/clients/${id}`);
        return response.data;
    }
};
```

Services similaires pour : `salarieService`, `factureService`, `devisService`, `authService`

### Routing et Navigation

#### 🛣️ **Configuration des Routes**
```jsx
// App.jsx
function AppContent() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <Routes>
                    {/* Routes publiques */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Routes protégées */}
                    <Route path="/" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/clients/gestion" element={
                        <ProtectedRoute><GestionClients /></ProtectedRoute>
                    } />
                    <Route path="/clients/ajouter" element={
                        <ProtectedRoute><AjouterClient /></ProtectedRoute>
                    } />
                    <Route path="/salaries/gestion" element={
                        <ProtectedRoute><GestionSalaries /></ProtectedRoute>
                    } />
                    <Route path="/factures" element={
                        <ProtectedRoute><FactureManager /></ProtectedRoute>
                    } />
                    <Route path="/factures/creer" element={
                        <ProtectedRoute><FactureFormComplet /></ProtectedRoute>
                    } />
                    <Route path="/devis/manager" element={
                        <ProtectedRoute><DevisManager /></ProtectedRoute>
                    } />
                    <Route path="/devis/creer" element={
                        <ProtectedRoute><DevisFormComplet /></ProtectedRoute>
                    } />
                    <Route path="/planning" element={
                        <ProtectedRoute><Planning /></ProtectedRoute>
                    } />
                    <Route path="/documents" element={
                        <ProtectedRoute><GestionDocuments /></ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>
    );
}
```

#### 🛡️ **ProtectedRoute**
```jsx
// components/ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner fullscreen message="Vérification de l'authentification..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
```

---

## 🐳 Infrastructure et Déploiement

### Configuration Docker

#### 🔧 **docker-compose.yml**
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: facturation
      POSTGRES_USER: facturation_user
      POSTGRES_PASSWORD: change_me_secure_password_123
    volumes:
      - dbdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U facturation_user -d facturation"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    build:
      context: ./facturation-planning-backend
      dockerfile: Dockerfile
    environment:
      DB_HOST: "db"
      DB_PORT: "5432"
      DB_NAME: "facturation"
      DB_USER: "facturation_user"
      DB_PASSWORD: "change_me_secure_password_123"
      PORT: "8080"
      ENV: "production"
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  web:
    build:
      context: ./facturation-planning-frontend
      dockerfile: Dockerfile
    volumes:
      - webdist:/usr/share/web
    depends_on:
      - api
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddydata:/data
      - caddyconfig:/config
      - webdist:/usr/share/web:ro
    depends_on:
      - api
      - web
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  dbdata:
  webdist:
  caddydata:
  caddyconfig:
```

#### 🌐 **Caddyfile** (Proxy Reverse)
```
localhost {
    # Servir le frontend
    root * /usr/share/web
    file_server

    # Proxifier les requêtes API
    handle /api/* {
        reverse_proxy api:8080
    }

    # Proxifier directement les endpoints sans /api
    handle /clients* {
        reverse_proxy api:8080
    }
    handle /factures* {
        reverse_proxy api:8080
    }
    handle /devis* {
        reverse_proxy api:8080
    }
    handle /auth* {
        reverse_proxy api:8080
    }
    handle /login* {
        reverse_proxy api:8080
    }
    handle /register* {
        reverse_proxy api:8080
    }
    handle /salaries* {
        reverse_proxy api:8080
    }
    handle /plannings* {
        reverse_proxy api:8080
    }
    handle /entreprises* {
        reverse_proxy api:8080
    }
    handle /health* {
        reverse_proxy api:8080
    }

    # Headers de sécurité
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
    }

    # Compression
    encode gzip

    # Logs
    log {
        output file /var/log/caddy/access.log
        format json
    }
}
```

### Scripts de Production

#### 💾 **Sauvegarde Automatique** (`backup.sh`)
```bash
#!/usr/bin/env bash

# Configuration
BACKUP_DIR="./backups"
DB_CONTAINER="faturation-db-1"
DB_NAME="facturation"
DB_USER="facturation_user"
RETENTION_DAYS=7

# Créer le répertoire de sauvegarde
mkdir -p "$BACKUP_DIR"

# Nom du fichier de sauvegarde avec timestamp
BACKUP_FILE="facturation_backup_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

echo "🔄 Début de la sauvegarde PostgreSQL..."

# Effectuer la sauvegarde
if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_PATH"; then
    echo "✅ Sauvegarde créée : $BACKUP_FILE"
    
    # Compression
    gzip "$BACKUP_PATH"
    echo "🗜️ Sauvegarde compressée : ${BACKUP_FILE}.gz"
    
    # Nettoyage des anciennes sauvegardes
    find "$BACKUP_DIR" -name "facturation_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "🧹 Nettoyage des sauvegardes anciennes (>$RETENTION_DAYS jours)"
    
    echo "🎉 Sauvegarde terminée avec succès !"
else
    echo "❌ Erreur lors de la sauvegarde"
    exit 1
fi
```

#### 🔄 **Script de Déploiement** (`deploy-enhanced.sh`)
```bash
#!/bin/bash

# Déploiement intelligent avec vérifications
deploy() {
    echo "🚀 Début du déploiement..."
    
    # Sauvegarde pré-déploiement
    ./backup.sh
    
    # Mise à jour du code
    git pull origin main
    
    # Vérification des changements Docker
    if git diff --name-only HEAD~1 HEAD | grep -E "(Dockerfile|docker-compose.yml)"; then
        echo "🔄 Changements Docker détectés, rebuild complet..."
        docker-compose down
        docker-compose up -d --build
    else
        echo "🔄 Redémarrage simple..."
        docker-compose restart
    fi
    
    # Vérification de santé
    sleep 10
    if curl -f http://localhost:8080/health; then
        echo "✅ Déploiement réussi !"
    else
        echo "❌ Échec du déploiement"
        exit 1
    fi
}
```

#### 🛡️ **Sécurisation du Serveur** (`security-hardening.sh`)
```bash
#!/bin/bash

# Script de sécurisation pour production
echo "🛡️ Configuration de la sécurité..."

# Configuration UFW (firewall)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configuration fail2ban
apt install -y fail2ban
systemctl enable fail2ban

# Sécurisation SSH
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh

# Mises à jour automatiques
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo "✅ Sécurisation terminée"
```

#### 📊 **Monitoring avec Uptime Kuma** (`monitoring/docker-compose.yml`)
```yaml
version: '3.8'

services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - uptime-kuma-data:/app/data
    environment:
      - UPTIME_KUMA_DISABLE_FRAME_SAMEORIGIN=true
    networks:
      - facturation_default

volumes:
  uptime-kuma-data:

networks:
  facturation_default:
    external: true
```

---

## 🔄 Workflow de Développement et CI/CD

### Structure des Branches
```
main (production)
├── develop (développement)
├── feature/dashboard-stats
├── feature/pdf-generation
├── feature/user-management
└── hotfix/security-patches
```

### Pipeline CI/CD (GitHub Actions)
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: 1.23
      - name: Run tests
        run: |
          cd facturation-planning-backend
          go test ./...

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd facturation-planning-frontend
          npm ci
      - name: Run tests
        run: |
          cd facturation-planning-frontend
          npm test

  deploy:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Scripts de déploiement
          ./deploy-enhanced.sh
```

---

## 📈 Fonctionnalités Avancées Implémentées

### 🔐 Sécurité
- **JWT Authentication** : Tokens sécurisés avec expiration
- **CORS Configuration** : Protection contre les attaques cross-origin
- **Input Validation** : Validation côté frontend et backend
- **SQL Injection Protection** : GORM avec prepared statements
- **Password Hashing** : bcrypt pour les mots de passe
- **HTTPS Ready** : Configuration Caddy pour SSL/TLS

### ⚡ Performance
- **Database Indexing** : Index sur les champs fréquemment utilisés
- **Connection Pooling** : Pool de connexions PostgreSQL
- **Image Optimization** : Compression des assets
- **Lazy Loading** : Chargement paresseux des composants
- **Caching** : Cache navigateur et service worker ready

### 🎨 UX/UI
- **Responsive Design** : Interface adaptative mobile/desktop
- **Dark/Light Mode Ready** : Variables CSS pour thèmes
- **Loading States** : Indicateurs de chargement intelligents
- **Error Handling** : Gestion gracieuse des erreurs
- **Toast Notifications** : Feedback utilisateur immédiat
- **Keyboard Shortcuts** : Navigation clavier avancée

### 📊 Analytics et Monitoring
- **Health Checks** : Endpoint `/health` pour surveillance
- **Logging** : Logs structurés JSON
- **Metrics** : Métriques applicatives
- **Error Tracking** : Centralisation des erreurs
- **Performance Monitoring** : Temps de réponse et ressources

---

## 📋 API Endpoints Disponibles

### 🔐 Authentication
- `POST /login` - Connexion utilisateur
- `POST /register` - Inscription utilisateur
- `GET /profile` - Profil utilisateur (protégé)

### 👥 Clients
- `GET /clients` - Liste des clients
- `POST /clients` - Créer un client
- `GET /clients/:id` - Détails d'un client
- `PUT /clients/:id` - Modifier un client
- `DELETE /clients/:id` - Supprimer un client

### 👨‍💼 Salariés
- `GET /salaries` - Liste des salariés
- `POST /salaries` - Créer un salarié
- `GET /salaries/:id` - Détails d'un salarié
- `PUT /salaries/:id` - Modifier un salarié
- `DELETE /salaries/:id` - Supprimer un salarié

### 💰 Factures
- `GET /factures` - Liste des factures
- `POST /factures` - Créer une facture
- `GET /factures/:id` - Détails d'une facture
- `PUT /factures/:id` - Modifier une facture
- `DELETE /factures/:id` - Supprimer une facture
- `GET /factures/:id/pdf` - Générer PDF facture

### 📋 Devis
- `GET /devis` - Liste des devis
- `POST /devis` - Créer un devis
- `GET /devis/:id` - Détails d'un devis
- `PUT /devis/:id` - Modifier un devis
- `DELETE /devis/:id` - Supprimer un devis
- `GET /devis/:id/pdf` - Générer PDF devis
- `POST /devis/:id/convert` - Convertir en facture

### 📅 Planning
- `GET /plannings` - Liste des plannings
- `POST /plannings` - Créer un planning
- `GET /plannings/:id` - Détails d'un planning
- `PUT /plannings/:id` - Modifier un planning
- `DELETE /plannings/:id` - Supprimer un planning

### 🏢 Entreprises
- `GET /entreprises` - Liste des entreprises
- `POST /entreprises` - Créer une entreprise

### 🏥 Health Check
- `GET /health` - Statut de l'application

---

## 🚀 Guide de Déploiement

### Prérequis
- Docker et Docker Compose
- Git
- Serveur Linux (Ubuntu/Debian recommandé)
- Nom de domaine (optionnel pour HTTPS)

### Installation Rapide
```bash
# 1. Cloner le projet
git clone https://github.com/lebaron567/faturation.git
cd faturation

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Lancement
docker-compose up -d --build

# 4. Vérification
curl http://localhost/health
```

### Configuration Production
```bash
# 1. Sécurisation
sudo ./security-hardening.sh

# 2. Monitoring
cd monitoring
docker-compose up -d

# 3. Sauvegardes automatiques
crontab -e
# Ajouter : 0 2 * * * /path/to/backup.sh

# 4. Déploiement automatisé
./deploy-enhanced.sh
```

### Variables d'Environnement
```env
# Base de données
DB_HOST=db
DB_PORT=5432
DB_NAME=facturation
DB_USER=facturation_user
DB_PASSWORD=your_secure_password

# API
PORT=8080
ENV=production
JWT_SECRET=your_jwt_secret

# Frontend
REACT_APP_API_URL=http://localhost:8080

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 🎯 Roadmap et Améliorations Futures

### Version 2.1 (Q4 2025)
- [ ] **Module CRM** : Gestion avancée des prospects
- [ ] **Facturation récurrente** : Abonnements automatiques
- [ ] **Multi-entreprises** : Support de plusieurs entreprises
- [ ] **API REST complète** : Documentation OpenAPI/Swagger
- [ ] **Mobile App** : Application React Native

### Version 2.2 (Q1 2026)
- [ ] **Comptabilité** : Module comptable complet
- [ ] **Reporting avancé** : Graphiques et analyses
- [ ] **Intégrations** : Banques, comptables externes
- [ ] **Workflow automatisé** : Relances automatiques
- [ ] **Multi-devises** : Support international

### Version 3.0 (Q2 2026)
- [ ] **Intelligence artificielle** : Analyse prédictive
- [ ] **Microservices** : Architecture distribuée
- [ ] **Real-time** : WebSockets pour temps réel
- [ ] **Blockchain** : Factures vérifiables
- [ ] **IoT Integration** : Capteurs et données terrain

---

## 🤝 Contribution et Maintenance

### Structure de l'Équipe
- **Développeur Principal** : Émeric (Full-stack)
- **DevOps** : Gestion infrastructure et déploiement
- **Testing** : Tests automatisés et manuels
- **UI/UX** : Design et expérience utilisateur

### Guidelines de Contribution
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **Backend Go** : gofmt, golint, go vet
- **Frontend React** : ESLint, Prettier
- **CSS** : BEM methodology
- **Git** : Conventional Commits
- **Tests** : Couverture minimum 80%

---

## 📞 Support et Documentation

### Contacts
- **Email** : aide.odiservicepro@gmail.com
- **Téléphone** : 02 51 99 36 91
- **Entreprise** : ODI SERVICE PRO
- **SIRET** : 83377432600023

### Documentation Technique
- **API Documentation** : `/swagger/index.html`
- **Frontend Storybook** : `/storybook`
- **Database Schema** : `docs/database-schema.md`
- **Deployment Guide** : `docs/deployment.md`

### Versions et Changelog
- **Version actuelle** : 2.0.0
- **Dernière mise à jour** : Septembre 2025
- **Changelog** : `CHANGELOG.md`
- **Breaking Changes** : `BREAKING_CHANGES.md`

---

**🎉 Application de Facturation - Production Ready !**

Cette documentation représente l'état complet de l'application de facturation développée pour ODI SERVICE PRO. Le système est maintenant prêt pour la production avec toutes les fonctionnalités essentielles, la sécurité, le monitoring et les outils de déploiement automatisé.

L'application continue d'évoluer avec de nouvelles fonctionnalités ajoutées régulièrement selon les besoins métier et les retours utilisateurs.