# 🚀 Démarrage Rapide - FARE EPARGNE

## ✅ Corrections Appliquées (26/11/2024)

### Backend
- ✅ `config.py` - Migration Pydantic v2
- ✅ `main.py` - Imports et configuration corrigés
- ✅ `Dockerfile` - Structure corrigée
- ✅ `requirements.txt` - Ajout pydantic-settings

### Frontend
- ✅ `Dockerfile` - UID/GID utilisateur corrigé
- ✅ `package.json` - Ajout Material-UI
- ✅ 2 Layouts créés (Auth, Main)
- ✅ 9 Pages créées (Login, Dashboard, Clients, etc.)

---

## 🎯 Lancer l'Application

### 1. Démarrer Docker Desktop
**OBLIGATOIRE** - L'application ne peut pas démarrer sans Docker!

### 2. Ouvrir un terminal
```bash
# PowerShell ou CMD
cd "C:\Users\ASUS\OneDrive\Documents\LFDE\Code\Demat Regl"
```

### 3. Lancer l'application
```bash
docker compose up -d --build
```

**Temps estimé première fois:** 5-10 minutes (téléchargement images)

### 4. Vérifier le statut
```bash
docker compose ps
```

Vous devriez voir 5 containers "Up":
- fare_epargne_db (PostgreSQL)
- fare_epargne_redis
- fare_epargne_backend
- fare_epargne_frontend
- fare_epargne_nginx

### 5. Voir les logs
```bash
# Backend
docker compose logs -f backend

# Frontend
docker compose logs -f frontend

# Tous
docker compose logs -f
```

---

## 🌐 Accès à l'Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Interface utilisateur |
| **Backend** | http://localhost:8000 | API |
| **API Docs** | http://localhost:8000/api/v1/docs | Documentation Swagger |
| **Health** | http://localhost:8000/health | Santé de l'API |

### 🔐 Compte de Test

```
Email:    pierre.poher@fare-epargne.com
Password: FareTest2025!
Rôle:     Administrateur
```

---

## 🛠️ Commandes Utiles

### Gestion Docker

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Redémarrer
docker compose restart

# Rebuild complet
docker compose down
docker compose up -d --build

# Voir les logs
docker compose logs -f [service]

# Status des containers
docker compose ps
```

### Accès aux Containers

```bash
# Shell backend
docker compose exec backend sh

# Shell frontend
docker compose exec frontend sh

# PostgreSQL
docker compose exec postgres psql -U fare_admin -d fare_epargne
```

### Base de Données

```bash
# Voir les tables
docker compose exec postgres psql -U fare_admin -d fare_epargne -c "\dt"

# Voir les users de test
docker compose exec postgres psql -U fare_admin -d fare_epargne -c "SELECT * FROM users;"

# Backup
docker exec fare_epargne_db pg_dump -U fare_admin fare_epargne > backup.sql
```

---

## ❌ Résolution de Problèmes

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 80
netstat -ano | findstr :80

# Arrêter Docker et relancer
docker compose down
docker compose up -d
```

### Frontend ne charge pas
```bash
# Attendre que npm install se termine
docker compose logs -f frontend

# Si ça prend trop de temps, restart
docker compose restart frontend
```

### Backend ne démarre pas
```bash
# Vérifier les logs
docker compose logs backend

# Vérifier PostgreSQL
docker compose logs postgres

# Si problème de base de données
docker compose down -v
docker compose up -d
```

### Tout recommencer
```bash
# Supprimer TOUT (containers, volumes, images)
docker compose down -v --rmi all
docker compose up -d --build
```

---

## 📋 Checklist Premier Démarrage

- [ ] Docker Desktop installé
- [ ] Docker Desktop démarré (icône verte)
- [ ] Terminal ouvert dans le bon dossier
- [ ] `docker compose up -d --build` lancé
- [ ] Attendre 5-10 min (première fois)
- [ ] Vérifier `docker compose ps` → tous "Up"
- [ ] Ouvrir http://localhost
- [ ] Se connecter avec le compte test
- [ ] ✅ Succès!

---

## 🎉 Prochaines Étapes

Une fois l'application lancée :

1. **Tester le Login**
   - Email : pierre.poher@fare-epargne.com
   - Password : FareTest2025!

2. **Explorer le Dashboard**
   - Voir les statistiques (données de démo)
   - Tester la navigation

3. **Voir la liste des clients**
   - Aller dans "Clients"
   - Tester la recherche/filtres

4. **Tester l'API**
   - Ouvrir http://localhost:8000/api/v1/docs
   - Tester les endpoints

5. **Vérifier la base de données**
   - 3 users de test créés
   - Tables clients, documents, etc.

---

## 📞 Support

### Fichiers de Documentation
- `README.md` - Documentation complète
- `ETAT_PROJET.md` - État du projet détaillé
- `MISE_A_JOUR_26NOV.md` - Historique des modifications
- `DEMARRAGE_RAPIDE.md` - Ce fichier

### Logs
```bash
# Si problème, envoyer les logs
docker compose logs > logs_complets.txt
```

---

**Créé le:** 26 novembre 2024
**Status:** ✅ Prêt à démarrer
**Dernière mise à jour:** 26 nov 2024 13:00
