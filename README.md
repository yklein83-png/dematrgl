# 🏦 FARE EPARGNE - Plateforme de Gestion Patrimoniale

**Version** : 1.0.0  
**Date** : 19 novembre 2025  
**Auteur** : Le Fare de l'Epargne  
**Statut** : MVP - Production Ready  

## 📋 Table des matières

1. [Présentation](#présentation)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Démarrage](#démarrage)
6. [Utilisation](#utilisation)
7. [Architecture](#architecture)
8. [API Documentation](#api-documentation)
9. [Tests](#tests)
10. [Déploiement](#déploiement)
11. [Maintenance](#maintenance)
12. [Support](#support)

---

## 🎯 Présentation

### Contexte
**Le Fare de l'Epargne** est un cabinet de conseil en gestion de patrimoine basé en Polynésie Française, régulé par l'AMF et l'ACPR.

### Objectif
Cette plateforme digitalise le parcours client réglementaire pour :
- ✅ Collecter les informations clients (120+ champs)
- ✅ Générer automatiquement 5 documents conformes AMF/ACPR
- ✅ Calculer le profil de risque et niveau LCB-FT
- ✅ Exporter les données pour intégration CRM

### Fonctionnalités MVP
- 🔐 Authentification JWT sécurisée
- 📝 Formulaire client multi-sections (accordéon)
- 📊 Calcul automatique profil de risque
- 🔍 Classification LCB-FT automatique
- 📄 Génération documents DOCX
- 💾 Sauvegarde automatique
- 📱 Interface responsive

### Hors scope (Phase 2)
- ❌ Signature électronique DocuSign
- ❌ Intégration Harvest CRM
- ❌ Envoi emails automatiques
- ❌ Gestion de portefeuille

---

## 🛠️ Prérequis

### Environnement requis
- **Docker** : >= 24.0.0
- **Docker Compose** : >= 2.20.0
- **Git** : >= 2.40.0
- **OS** : Linux, macOS, Windows (WSL2)
- **RAM** : Minimum 4GB disponible
- **Stockage** : 2GB libre

### Ports utilisés
- `80` : Nginx (HTTP)
- `443` : Nginx (HTTPS - production)
- `5432` : PostgreSQL
- `6379` : Redis
- `8000` : Backend FastAPI
- `5173` : Frontend React Dev

---

## 📦 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/fare-epargne/plateforme-conseil.git
cd plateforme-conseil
```

### 2. Créer les fichiers de configuration
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Modifier les variables d'environnement

#### backend/.env
```env
# ⚠️ IMPORTANT : Modifier ces valeurs en production
SECRET_KEY=VOTRE_CLE_SECRETE_MINIMUM_32_CARACTERES
DATABASE_URL=postgresql+asyncpg://fare_admin:MOT_DE_PASSE_FORT@postgres:5432/fare_epargne
REDIS_URL=redis://:MOT_DE_PASSE_REDIS@redis:6379/0
```

#### frontend/.env
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## ⚙️ Configuration

### Configuration PostgreSQL
Le schéma est automatiquement créé au démarrage via :
- `database/schema.sql` : Structure complète
- `database/seed_data.sql` : Données de test

### Configuration Nginx
Modifier `nginx.conf` pour votre domaine en production :
```nginx
server_name votre-domaine.com;
```

### Configuration SSL (Production)
```bash
# Installer Certbot
docker exec -it fare_epargne_nginx sh
apk add certbot certbot-nginx
certbot --nginx -d votre-domaine.com
```

---

## 🚀 Démarrage

### Mode Développement
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Accès aux services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost | - |
| **Backend API** | http://localhost:8000 | - |
| **API Docs** | http://localhost:8000/docs | - |
| **PostgreSQL** | localhost:5432 | fare_admin / FareEpargne2025!Secure |
| **Redis** | localhost:6379 | FareRedis2025!Secure |

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| pierre.poher@fare-epargne.com | FareTest2025! | Admin |
| marie.teva@fare-epargne.com | FareTest2025! | Conseiller |
| jean.wong@fare-epargne.com | FareTest2025! | Conseiller |

---

## 📱 Utilisation

### 1. Connexion
1. Accéder à http://localhost
2. Se connecter avec un compte de test
3. Dashboard conseiller s'affiche

### 2. Créer un client
1. Cliquer sur "Nouveau client"
2. Remplir les 8 sections du formulaire :
   - 📋 Identité (Titulaires 1 et 2)
   - 👨‍👩‍👧‍👦 Situation familiale
   - 💰 Situation financière
   - 🏦 Origine des fonds
   - 🏠 Patrimoine détaillé
   - 📊 Connaissance & Expérience
   - ⚖️ Profil de risque
   - 🌱 Préférences durabilité
3. Sauvegarde automatique toutes les 30 secondes
4. Valider le client

### 3. Générer les documents
1. Accéder à la fiche client
2. Section "Documents"
3. Cliquer sur "Générer DER"
4. Le document DOCX est généré avec les variables remplies
5. Télécharger le document

### 4. Export CSV
1. Liste des clients
2. Sélectionner les clients à exporter
3. "Actions" > "Exporter CSV Harvest"
4. Fichier CSV téléchargé

---

## 🏗️ Architecture

### Stack Technique
```yaml
Backend:
  - FastAPI 0.104.1
  - Python 3.11
  - PostgreSQL 15
  - SQLAlchemy 2.0 (async)
  - Redis 7
  - JWT Authentication

Frontend:
  - React 18.2
  - Vite 5.0
  - Tailwind CSS 3.4
  - React Hook Form 7.48
  - Axios 1.6

Infrastructure:
  - Docker & Docker Compose
  - Nginx (reverse proxy)
  - SSL Let's Encrypt
```

### Structure Base de Données
```
users (conseillers)
  ↓
clients (120+ champs)
  ↓
  ├── produits (investissements)
  ├── documents (DOCX générés)
  └── audit_logs (traçabilité)
```

---

## 📚 API Documentation

### Endpoints principaux

#### Authentication
```
POST   /api/v1/auth/login       # Connexion
POST   /api/v1/auth/register    # Création compte
POST   /api/v1/auth/refresh     # Refresh token
```

#### Clients
```
GET    /api/v1/clients          # Liste clients
POST   /api/v1/clients          # Créer client
GET    /api/v1/clients/{id}     # Détail client
PUT    /api/v1/clients/{id}     # Modifier client
DELETE /api/v1/clients/{id}     # Supprimer client
```

#### Documents
```
POST   /api/v1/documents/generate/der/{client_id}    # Générer DER
POST   /api/v1/documents/generate/kyc/{client_id}    # Générer KYC
GET    /api/v1/documents/download/{document_id}      # Télécharger
```

#### Export
```
POST   /api/v1/exports/csv      # Export CSV Harvest
```

### Documentation interactive
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

---

## 🧪 Tests

### Tests Backend
```bash
# Lancer tous les tests
docker-compose exec backend pytest

# Tests avec coverage
docker-compose exec backend pytest --cov=app

# Tests spécifiques
docker-compose exec backend pytest tests/test_auth.py
docker-compose exec backend pytest tests/test_clients.py
docker-compose exec backend pytest tests/test_docx.py
```

### Tests manuels essentiels

1. **Test authentification**
   - Login avec mauvais password → Erreur 401
   - Login correct → Token JWT retourné
   - Accès API sans token → Erreur 403

2. **Test formulaire client**
   - Champs obligatoires vides → Validation erreur
   - Email invalide → Erreur format
   - Sauvegarde auto → localStorage mis à jour

3. **Test génération document**
   - Client incomplet → Erreur validation
   - Client complet → DOCX généré avec variables

---

## 🚢 Déploiement

### Production avec Docker Compose
```bash
# Mode production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Migrations base de données
docker-compose exec backend alembic upgrade head

# Collecte logs
docker-compose logs -f > logs/production.log
```

### Backup PostgreSQL
```bash
# Backup manuel
docker exec fare_epargne_db pg_dump -U fare_admin fare_epargne > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i fare_epargne_db psql -U fare_admin fare_epargne < backup_20251119.sql

# Backup automatique (cron)
0 2 * * * docker exec fare_epargne_db pg_dump -U fare_admin fare_epargne > /backups/backup_$(date +\%Y\%m\%d).sql
```

---

## 🔧 Maintenance

### Logs
```bash
# Logs backend
docker-compose logs -f backend

# Logs frontend
docker-compose logs -f frontend

# Logs PostgreSQL
docker-compose logs -f postgres

# Tous les logs
docker-compose logs -f
```

### Monitoring
```bash
# Ressources Docker
docker stats

# Santé des conteneurs
docker-compose ps

# Espace disque PostgreSQL
docker exec fare_epargne_db psql -U fare_admin -c "SELECT pg_database_size('fare_epargne');"
```

### Mise à jour
```bash
# Pull dernière version
git pull origin main

# Rebuild images
docker-compose build

# Redémarrer services
docker-compose down && docker-compose up -d

# Appliquer migrations
docker-compose exec backend alembic upgrade head
```

---

## 🆘 Support

### Contacts
- **Email technique** : p.poher@fare-epargne.com
- **Documentation AMF** : https://www.amf-france.org
- **ORIAS** : https://www.orias.fr (N° 21003330)

### Troubleshooting

| Problème | Solution |
|----------|----------|
| Port 5432 occupé | `sudo lsof -i :5432` puis kill process |
| Docker permission denied | `sudo usermod -aG docker $USER` |
| Frontend ne compile pas | `docker-compose exec frontend npm install` |
| PostgreSQL connection refused | Vérifier healthcheck : `docker-compose ps` |
| Redis connection error | Vérifier password dans .env |

### Logs d'erreur communs
```bash
# Erreur CORS
→ Vérifier CORS_ORIGINS dans backend/.env

# Erreur "relation does not exist"
→ Exécuter : docker-compose exec backend alembic upgrade head

# Erreur "password authentication failed"
→ Vérifier DATABASE_URL dans backend/.env

# Erreur "Cannot find module"
→ docker-compose exec frontend npm install
```

---

## 📄 Licence

Copyright © 2025 Le Fare de l'Epargne - Tous droits réservés

**CONFIDENTIEL** - Usage interne uniquement

---

## 🙏 Remerciements

- Équipe Le Fare de l'Epargne
- La Compagnie CIF
- AMF & ACPR pour les guidelines réglementaires

---

**FIN DE LA DOCUMENTATION**