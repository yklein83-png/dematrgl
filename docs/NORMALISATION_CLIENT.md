# Plan de Normalisation du Modèle Client

## État Actuel

Le modèle `Client` contient **127 colonnes** dans une seule table, ce qui pose plusieurs problèmes :

| Problème | Impact |
|----------|--------|
| Redondance (T1/T2) | 46 colonnes dupliquées pour titulaires |
| Maintenabilité | Difficile d'ajouter de nouveaux champs |
| Performance | Lecture de toutes les colonnes même si non nécessaires |
| Flexibilité | Impossible d'avoir 3+ titulaires |

## Architecture Cible

### Schéma Normalisé Proposé

```
┌─────────────┐
│   clients   │
│ (table hub) │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│  titulaires  │ │ famille  │ │ finances │ │   kyc    │ │  compliance  │
│ (1:n, type)  │ │  (1:1)   │ │  (1:1)   │ │  (1:1)   │ │    (1:1)     │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘
```

### Tables Normalisées

#### 1. `clients` (table principale allégée)
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conseiller_id UUID NOT NULL REFERENCES users(id),
    numero_client VARCHAR(50) UNIQUE,
    statut VARCHAR(50) DEFAULT 'prospect',

    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES users(id)
);
```

#### 2. `titulaires` (remplace t1_* et t2_*)
```sql
CREATE TABLE titulaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('principal', 'secondaire')),

    -- Identité
    civilite VARCHAR(10),
    nom VARCHAR(100) NOT NULL,
    nom_jeune_fille VARCHAR(100),
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    nationalite VARCHAR(100) DEFAULT 'Française',

    -- Contact
    adresse TEXT,
    email VARCHAR(255),
    telephone VARCHAR(50),

    -- Fiscal
    us_person BOOLEAN DEFAULT FALSE,
    residence_fiscale VARCHAR(100) DEFAULT 'France',
    residence_fiscale_autre VARCHAR(255),

    -- Protection juridique
    regime_protection_juridique BOOLEAN DEFAULT FALSE,
    regime_protection_forme VARCHAR(100),
    representant_legal VARCHAR(255),

    -- Profession
    profession VARCHAR(100),
    retraite_depuis DATE,
    chomage_depuis DATE,
    ancienne_profession VARCHAR(100),
    chef_entreprise BOOLEAN DEFAULT FALSE,
    entreprise_denomination VARCHAR(255),
    entreprise_forme_juridique VARCHAR(100),
    entreprise_siege_social TEXT,

    UNIQUE (client_id, type)
);

CREATE INDEX idx_titulaires_client ON titulaires(client_id);
```

#### 3. `situations_familiales` (situation famille)
```sql
CREATE TABLE situations_familiales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,

    situation VARCHAR(50) NOT NULL,
    date_mariage DATE,
    contrat_mariage BOOLEAN DEFAULT FALSE,
    regime_matrimonial VARCHAR(100),
    date_pacs DATE,
    convention_pacs BOOLEAN DEFAULT FALSE,
    regime_pacs VARCHAR(100),
    date_divorce DATE,

    -- Donations
    donation_entre_epoux BOOLEAN DEFAULT FALSE,
    donation_entre_epoux_date DATE,
    donation_entre_epoux_montant DECIMAL(15,2),
    donation_enfants BOOLEAN DEFAULT FALSE,
    donation_enfants_date DATE,
    donation_enfants_montant DECIMAL(15,2),

    -- Enfants
    nombre_enfants INTEGER DEFAULT 0,
    nombre_enfants_charge INTEGER DEFAULT 0,
    enfants JSONB  -- Détails des enfants
);
```

#### 4. `situations_financieres` (finances)
```sql
CREATE TABLE situations_financieres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,

    -- Revenus et patrimoine
    revenus_annuels_foyer VARCHAR(50),
    patrimoine_global VARCHAR(50),
    charges_annuelles_pourcent DECIMAL(5,2),
    charges_annuelles_montant DECIMAL(15,2),
    capacite_epargne_mensuelle DECIMAL(15,2),

    -- Impôts
    impot_revenu BOOLEAN DEFAULT FALSE,
    impot_fortune_immobiliere BOOLEAN DEFAULT FALSE,

    -- Répartition patrimoine
    patrimoine_financier_pourcent DECIMAL(5,2),
    patrimoine_immobilier_pourcent DECIMAL(5,2),
    patrimoine_professionnel_pourcent DECIMAL(5,2),
    patrimoine_autres_pourcent DECIMAL(5,2),

    -- Détails JSONB
    patrimoine_financier JSONB,
    patrimoine_immobilier JSONB,
    patrimoine_professionnel JSONB,
    patrimoine_emprunts JSONB,
    patrimoine_revenus JSONB,
    patrimoine_charges JSONB,

    -- Origine des fonds
    origine_fonds_nature VARCHAR(100),
    origine_fonds_montant_prevu DECIMAL(15,2),
    origine_economique_revenus BOOLEAN DEFAULT FALSE,
    origine_economique_epargne BOOLEAN DEFAULT FALSE,
    origine_economique_heritage BOOLEAN DEFAULT FALSE,
    origine_economique_cession_pro BOOLEAN DEFAULT FALSE,
    origine_economique_cession_immo BOOLEAN DEFAULT FALSE,
    origine_economique_cession_mobiliere BOOLEAN DEFAULT FALSE,
    origine_economique_gains_jeu BOOLEAN DEFAULT FALSE,
    origine_economique_assurance_vie BOOLEAN DEFAULT FALSE,
    origine_economique_autres VARCHAR(255),
    origine_fonds_provenance_etablissement VARCHAR(255)
);
```

#### 5. `kyc_experiences` (connaissance produits)
```sql
CREATE TABLE kyc_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Type de produit
    type_produit VARCHAR(50) NOT NULL,  -- monetaires, obligations, actions, scpi, pe, etf, derives, structures

    -- Expérience
    detention BOOLEAN DEFAULT FALSE,
    operations VARCHAR(50),
    duree VARCHAR(50),
    volume VARCHAR(50),
    q1 VARCHAR(20),
    q2 VARCHAR(20),

    UNIQUE (client_id, type_produit)
);

CREATE INDEX idx_kyc_client ON kyc_experiences(client_id);
```

#### 6. `profils_risque` (profil investisseur)
```sql
CREATE TABLE profils_risque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,

    -- Objectifs
    objectifs_investissement VARCHAR(255),
    horizon_placement VARCHAR(50),
    tolerance_risque VARCHAR(50),
    pertes_maximales_acceptables VARCHAR(50),

    -- Expérience
    experience_perte BOOLEAN DEFAULT FALSE,
    experience_perte_niveau VARCHAR(50),
    reaction_perte VARCHAR(100),
    reaction_gain VARCHAR(100),
    liquidite_importante BOOLEAN DEFAULT TRUE,
    pourcentage_patrimoine_investi VARCHAR(50),

    -- Gestion portefeuille
    mandat BOOLEAN DEFAULT FALSE,
    gestion_personnelle BOOLEAN DEFAULT FALSE,
    gestion_conseiller BOOLEAN DEFAULT FALSE,
    experience_pro BOOLEAN DEFAULT FALSE,

    -- Culture financière
    presse_financiere BOOLEAN DEFAULT FALSE,
    suivi_bourse BOOLEAN DEFAULT FALSE,
    releves_bancaires BOOLEAN DEFAULT FALSE,

    -- Profil calculé
    profil_calcule VARCHAR(50),
    score INTEGER,
    date_calcul TIMESTAMPTZ
);
```

#### 7. `preferences_esg` (durabilité)
```sql
CREATE TABLE preferences_esg (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,

    souhait BOOLEAN DEFAULT FALSE,
    niveau_preference VARCHAR(50),
    importance_environnement INTEGER,
    importance_social INTEGER,
    importance_gouvernance INTEGER,
    exclusions JSONB,
    investissement_impact BOOLEAN DEFAULT FALSE,
    investissement_solidaire BOOLEAN DEFAULT FALSE,
    taxonomie_pourcent INTEGER,
    prise_compte_pai VARCHAR(10),
    confirmation BOOLEAN DEFAULT FALSE,
    criteres JSONB
);
```

#### 8. `compliance_lcb_ft` (LCB-FT)
```sql
CREATE TABLE compliance_lcb_ft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,

    niveau_risque VARCHAR(50),
    ppe BOOLEAN DEFAULT FALSE,
    ppe_fonction VARCHAR(255),
    ppe_famille BOOLEAN DEFAULT FALSE,
    gel_avoirs_verifie BOOLEAN DEFAULT FALSE,
    gel_avoirs_date_verification DATE,
    justificatifs JSONB
);

CREATE INDEX idx_compliance_niveau ON compliance_lcb_ft(niveau_risque);
```

## Vue de Compatibilité

Pour maintenir la rétrocompatibilité avec le code existant :

```sql
CREATE OR REPLACE VIEW v_clients_complet AS
SELECT
    c.*,

    -- Titulaire 1
    t1.civilite AS t1_civilite,
    t1.nom AS t1_nom,
    t1.prenom AS t1_prenom,
    -- ... autres champs t1

    -- Titulaire 2
    t2.civilite AS t2_civilite,
    t2.nom AS t2_nom,
    t2.prenom AS t2_prenom,
    -- ... autres champs t2

    -- Situation familiale
    sf.*,

    -- Finances
    fin.*,

    -- Profil risque
    pr.profil_calcule AS profil_risque_calcule,
    pr.score AS profil_risque_score,

    -- Compliance
    lcb.niveau_risque AS lcb_ft_niveau_risque,
    lcb.ppe AS lcb_ft_ppe

FROM clients c
LEFT JOIN titulaires t1 ON c.id = t1.client_id AND t1.type = 'principal'
LEFT JOIN titulaires t2 ON c.id = t2.client_id AND t2.type = 'secondaire'
LEFT JOIN situations_familiales sf ON c.id = sf.client_id
LEFT JOIN situations_financieres fin ON c.id = fin.client_id
LEFT JOIN profils_risque pr ON c.id = pr.client_id
LEFT JOIN compliance_lcb_ft lcb ON c.id = lcb.client_id;
```

## Plan de Migration

### Phase 1 : Préparation (1-2 jours)
1. ✅ Créer les index composites sur la table actuelle
2. Backup complet de la base
3. Tests de performance baseline

### Phase 2 : Création Structure (2-3 jours)
1. Créer les nouvelles tables (vides)
2. Créer la vue de compatibilité
3. Tests unitaires sur la nouvelle structure

### Phase 3 : Migration Données (1 jour)
1. Script de migration des données
2. Vérification intégrité
3. Tests E2E

### Phase 4 : Basculement (1 jour)
1. Mise à jour des requêtes vers les nouvelles tables
2. Mise en production
3. Monitoring performance

### Phase 5 : Nettoyage (post-prod)
1. Suppression ancienne table
2. Suppression vue de compatibilité
3. Documentation finale

## Avantages Attendus

| Métrique | Avant | Après |
|----------|-------|-------|
| Colonnes table principale | 127 | ~10 |
| Taille moyenne row | ~8 KB | ~1 KB |
| Index efficaces | Limité | Optimal |
| Ajout titulaire 3+ | Impossible | Simple |
| Requêtes partielles | Full scan | Index seek |

## Décision

**Recommandation : Reporter la normalisation complète**

Pour cette phase, nous appliquons uniquement :
1. ✅ Index composites (amélioration immédiate)
2. ✅ Documentation du plan de normalisation
3. ⏸️ Migration complète → Version 2.0

La normalisation complète nécessite :
- Refactoring du frontend (tous les formulaires)
- Refactoring du backend (toutes les API)
- Migration des données existantes
- Tests de non-régression complets

Ces changements sont trop risqués pour une mise en production rapide.
