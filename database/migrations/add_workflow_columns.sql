-- ==========================================
-- Migration: Ajout des colonnes Workflow
-- Date: 2025-12-08
-- Description: Ajout du suivi du parcours réglementaire
-- ==========================================

-- Section 11: Workflow Réglementaire

-- Etape du parcours
ALTER TABLE clients ADD COLUMN IF NOT EXISTS etape_parcours VARCHAR(50) DEFAULT 'identite';

-- Lettre de Mission
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contexte_prestation TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_generee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_date_generation TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_signee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_date_signature TIMESTAMP;

-- Document d'Entrée en Relation (DER)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_genere BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_date_generation TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_signe BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_date_signature TIMESTAMP;

-- Déclaration d'Adéquation
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_generee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_date_generation TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_signee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_date_signature TIMESTAMP;

-- RTO (Relevé des Transactions et Opérations)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_applicable BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_genere BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_date_generation TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_signe BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_date_signature TIMESTAMP;

-- Index pour etape_parcours
CREATE INDEX IF NOT EXISTS idx_clients_etape_parcours ON clients(etape_parcours);

-- Contrainte pour les valeurs autorisées de etape_parcours
-- Note: On ajoute la contrainte seulement si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_clients_etape_parcours'
    ) THEN
        ALTER TABLE clients ADD CONSTRAINT chk_clients_etape_parcours
        CHECK (etape_parcours IS NULL OR etape_parcours IN (
            'identite', 'situation', 'kyc', 'profil_risque', 'durabilite', 'lcb_ft',
            'der_genere', 'der_signe', 'lettre_mission', 'lettre_mission_signee',
            'adequation', 'rto', 'complet'
        ));
    END IF;
END $$;

-- Vérification
SELECT 'Migration workflow terminée' as status;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'clients'
AND column_name LIKE '%etape%' OR column_name LIKE '%lettre%' OR column_name LIKE '%der_%' OR column_name LIKE '%adequation%' OR column_name LIKE '%rto_%';
