-- ==========================================
-- Migration: Permettre les brouillons (données partielles)
-- Date: 2026-01-06
-- ==========================================
-- Problème: Le schéma initial exige toutes les données dès la création
-- Solution: Permettre NULL et "brouillon" pour sauvegarder progressivement

-- ==========================================
-- PARTIE 1: SUPPRIMER LES CONTRAINTES CHECK
-- ==========================================

-- Statut - Ajouter "brouillon"
ALTER TABLE clients DROP CONSTRAINT IF EXISTS chk_clients_statut;

-- Civilité T1 - Accepter NULL pour brouillons
ALTER TABLE clients DROP CONSTRAINT IF EXISTS chk_clients_t1_civilite;

-- Situation familiale
ALTER TABLE clients DROP CONSTRAINT IF EXISTS chk_clients_situation_familiale;

-- Revenus
ALTER TABLE clients DROP CONSTRAINT IF EXISTS chk_clients_revenus;

-- Patrimoine
ALTER TABLE clients DROP CONSTRAINT IF EXISTS chk_clients_patrimoine;

-- Horizon placement
ALTER TABLE clients DROP CONSTRAINT IF EXISTS chk_clients_horizon;

-- ==========================================
-- PARTIE 2: RECRÉER LES CONTRAINTES AVEC NULL AUTORISÉ
-- ==========================================

-- Statut: ajouter "brouillon"
ALTER TABLE clients ADD CONSTRAINT chk_clients_statut
    CHECK (statut IS NULL OR statut IN ('brouillon', 'prospect', 'client_actif', 'client_inactif'));

-- Civilité T1: accepter NULL
ALTER TABLE clients ADD CONSTRAINT chk_clients_t1_civilite
    CHECK (t1_civilite IS NULL OR t1_civilite IN ('Monsieur', 'Madame'));

-- Situation familiale: accepter NULL
ALTER TABLE clients ADD CONSTRAINT chk_clients_situation_familiale
    CHECK (situation_familiale IS NULL OR situation_familiale IN ('Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf(ve)', 'Union libre'));

-- Revenus: accepter NULL
ALTER TABLE clients ADD CONSTRAINT chk_clients_revenus
    CHECK (revenus_annuels_foyer IS NULL OR revenus_annuels_foyer IN ('<50000', '50000-100000', '100001-150000', '150001-500000', '>500000'));

-- Patrimoine: accepter NULL
ALTER TABLE clients ADD CONSTRAINT chk_clients_patrimoine
    CHECK (patrimoine_global IS NULL OR patrimoine_global IN ('<100000', '100001-300000', '300001-500000', '500001-1000000', '1000001-5000000', '>5000000'));

-- Horizon placement: accepter NULL et chaîne vide
ALTER TABLE clients ADD CONSTRAINT chk_clients_horizon
    CHECK (horizon_placement IS NULL OR horizon_placement = '' OR horizon_placement IN ('<1an', '1-3ans', '3-5ans', '5-8ans', '>8ans'));

-- ==========================================
-- PARTIE 3: SUPPRIMER LES CONTRAINTES NOT NULL
-- ==========================================

-- Section 1: Identité Titulaire 1
ALTER TABLE clients ALTER COLUMN t1_civilite DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_nom DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_prenom DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_date_naissance DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_lieu_naissance DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_adresse DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_email DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_telephone DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN t1_profession DROP NOT NULL;

-- Section 3: Situation familiale
ALTER TABLE clients ALTER COLUMN situation_familiale DROP NOT NULL;

-- Section 4: Situation financière
ALTER TABLE clients ALTER COLUMN revenus_annuels_foyer DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN patrimoine_global DROP NOT NULL;

-- Section 5: Origine des fonds
ALTER TABLE clients ALTER COLUMN origine_fonds_nature DROP NOT NULL;

-- Section 8: Profil de risque
ALTER TABLE clients ALTER COLUMN objectifs_investissement DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN horizon_placement DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN tolerance_risque DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN pertes_maximales_acceptables DROP NOT NULL;

-- ==========================================
-- PARTIE 4: VÉRIFICATION
-- ==========================================

-- Vérifier les contraintes CHECK
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'clients'::regclass
AND contype = 'c'
ORDER BY conname;

-- Vérifier les colonnes nullables
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
AND column_name IN (
    't1_civilite', 't1_nom', 't1_prenom', 't1_date_naissance',
    't1_lieu_naissance', 't1_adresse', 't1_email', 't1_telephone',
    't1_profession', 'situation_familiale', 'revenus_annuels_foyer',
    'patrimoine_global', 'origine_fonds_nature', 'objectifs_investissement',
    'horizon_placement', 'tolerance_risque', 'pertes_maximales_acceptables'
)
ORDER BY column_name;
