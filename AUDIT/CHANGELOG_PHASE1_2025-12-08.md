# CHANGELOG - Phase 1 : Sécurité Critique
## Date : 2025-12-08

---

## Résumé des Modifications

La Phase 1 du plan d'action a été complétée avec succès. Cette phase adresse les vulnérabilités de sécurité critiques identifiées dans l'audit.

---

## 1. Fichiers Créés

### `.gitignore` (racine)
- Fichier complet avec exclusions pour :
  - Fichiers d'environnement (.env, secrets)
  - Python (__pycache__, venv, .pytest_cache)
  - Node.js (node_modules, dist)
  - IDE (.vscode, .idea)
  - Docker, logs, uploads, etc.

### `.env.example` (racine)
- Template pour les variables Docker Compose
- Instructions claires pour remplacer les mots de passe
- Variables : `POSTGRES_PASSWORD`, `REDIS_PASSWORD`

### `backend/.env.example`
- Template sécurisé sans credentials réels
- Valeurs par défaut marquées "REMPLACER_*"
- Token expiry réduit à 30 minutes
- Instructions de génération de SECRET_KEY

### `frontend/.env.example`
- Template propre sans debug en production
- Instructions de configuration

### `backend/app/core/redis_client.py` (NOUVEAU)
- Client Redis async singleton
- Gestion blacklist tokens JWT
- Cache générique
- Rate limiting applicatif (backup)

---

## 2. Fichiers Modifiés

### `docker-compose.yml`
**Avant :**
```yaml
POSTGRES_PASSWORD: FareEpargne2025!Secure  # En clair !
ports:
  - "5432:5432"  # Exposé
```

**Après :**
```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD requis dans .env}
# ports commentés en production
```

**Changements :**
- ✅ Credentials via variables d'environnement
- ✅ Ports DB/Redis commentés (non exposés)
- ✅ Volumes en lecture seule (:ro)
- ✅ Resource limits ajoutés
- ✅ Health checks ajoutés
- ✅ Logging avec rotation

### `nginx.conf`
**Ajouts :**
- ✅ `server_tokens off` (masquer version)
- ✅ Rate limiting zones :
  - `auth_limit` : 3 req/min (login/register)
  - `api_limit` : 10 req/sec (API)
  - `general_limit` : 30 req/sec (frontend)
- ✅ Security headers complets :
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy
  - Content-Security-Policy
- ✅ Timeouts sécurisés (protection Slowloris)
- ✅ Cache assets statiques (1 an)
- ✅ Log séparé pour auth (`/var/log/nginx/auth.log`)
- ✅ Template HTTPS prêt (commenté)

### `backend/app/config.py`
**Changements :**
```python
# Avant
ACCESS_TOKEN_EXPIRE_MINUTES: default=480  # 8 heures !
CORS_ALLOW_HEADERS: ['*']

# Après
ACCESS_TOKEN_EXPIRE_MINUTES: default=30   # 30 minutes
CORS_ALLOW_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With']
```

### `backend/.env`
- Token expiry réduit à 30 minutes

### `backend/app/core/deps.py`
**Ajout :** Vérification blacklist avant validation token
```python
# Vérifier si le token est dans la blacklist
if await is_token_blacklisted(token):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token révoqué - veuillez vous reconnecter",
    )
```

### `backend/app/api/auth.py`
**Refonte du logout :**
```python
@router.post("/logout")
async def logout(...):
    # Calcul du temps restant
    remaining_time = max(0, int(exp - time.time()))

    # Blacklister le token
    await blacklist_token(token.credentials, remaining_time)

    return {"message": "Déconnexion réussie", "token_revoked": True}
```

---

## 3. Dossiers Créés

### `nginx/ssl/`
- Dossier pour les certificats SSL (production)
- Prêt pour Let's Encrypt

---

## 4. Résumé des Améliorations de Sécurité

| Problème | Avant | Après |
|----------|-------|-------|
| Credentials exposés | En clair dans docker-compose | Variables d'environnement |
| Ports DB exposés | 5432:5432, 6379:6379 | Commentés (réseau Docker) |
| Token expiry | 8 heures | 30 minutes |
| Logout | Log uniquement | Blacklist Redis |
| Rate limiting | Aucun | 3 niveaux (auth/api/general) |
| Headers sécurité | Basique | Complet (CSP, HSTS ready) |
| CORS | *, * | Restrictif |
| .gitignore | Vide | Complet |

---

## 5. Actions Requises par l'Utilisateur

### Immédiat
1. **Créer le fichier `.env` racine :**
   ```bash
   cp .env.example .env
   # Éditer et remplacer les mots de passe
   ```

2. **Créer le fichier `backend/.env` :**
   ```bash
   cd backend
   cp .env.example .env
   # Générer une vraie SECRET_KEY :
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   ```

3. **Rotation des anciens mots de passe** si déjà en production

### Production
1. Obtenir certificats SSL (Let's Encrypt)
2. Décommenter la config HTTPS dans nginx.conf
3. Activer la redirection HTTP → HTTPS

---

## 6. Prochaines Étapes (Phase 2)

- [ ] Setup pytest backend
- [ ] Tests auth endpoints
- [ ] Tests services (risk_calculator, lcb_ft)
- [ ] Setup Vitest frontend
- [ ] Tests composants React

---

**Phase 1 complétée avec succès !**
