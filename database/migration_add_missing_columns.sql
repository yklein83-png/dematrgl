-- ==========================================
-- MIGRATION: Add missing columns to clients table
-- Date: 2026-01-06
-- ==========================================

-- Origine des fonds (colonnes manquantes)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS origine_economique_cession_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS origine_economique_cession_immo BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS origine_economique_cession_mobiliere BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS origine_economique_gains_jeu BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS origine_economique_assurance_vie BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS origine_economique_autres VARCHAR(255);

-- Patrimoine détaillé (JSONB)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS patrimoine_emprunts JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS patrimoine_revenus JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS patrimoine_charges JSONB;

-- KYC Obligations
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_obligations_operations VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_obligations_duree VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_obligations_volume VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_obligations_q1 VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_obligations_q2 VARCHAR(20);

-- KYC Actions (colonnes manquantes)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_actions_q1 VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_actions_q2 VARCHAR(20);

-- KYC SCPI (colonnes manquantes)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_scpi_volume VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_scpi_q1 VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_scpi_q2 VARCHAR(20);

-- KYC Private Equity
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_pe_detention BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_pe_operations VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_pe_duree VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_pe_volume VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_pe_q1 VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_pe_q2 VARCHAR(20);

-- KYC ETF
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_etf_detention BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_etf_operations VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_etf_duree VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_etf_volume VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_etf_q1 VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_etf_q2 VARCHAR(20);

-- KYC Dérivés
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_derives_detention BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_derives_operations VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_derives_duree VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_derives_volume VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_derives_q1 VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_derives_q2 VARCHAR(20);

-- KYC Structurés
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_structures_detention BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_structures_operations VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_structures_duree VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_structures_volume VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_structures_q1 VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_structures_q2 VARCHAR(20);

-- KYC Portefeuille
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_portefeuille_mandat BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_portefeuille_gestion_personnelle BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_portefeuille_experience_pro BOOLEAN DEFAULT FALSE;

-- Profil de risque
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profil_risque_date_calcul TIMESTAMP WITH TIME ZONE;

-- Durabilité (ESG)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_niveau_preference VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_importance_environnement INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_importance_social INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_importance_gouvernance INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_exclusions JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_investissement_impact BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_investissement_solidaire BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_prise_compte_pai VARCHAR(10);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_confirmation BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS durabilite_investissements_pourcent VARCHAR(20);

-- LCB-FT
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lcb_ft_ppe_fonction VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lcb_ft_ppe_famille BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lcb_ft_justificatifs JSONB;

-- Données formulaire
ALTER TABLE clients ADD COLUMN IF NOT EXISTS form_data JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS documents_selectionnes JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS etape_parcours VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contexte_prestation VARCHAR(100);

-- Lettre de mission
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_generee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_date_generation TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_signee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lettre_mission_date_signature TIMESTAMP WITH TIME ZONE;

-- DER
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_genere BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_date_generation TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_signe BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS der_date_signature TIMESTAMP WITH TIME ZONE;

-- Adéquation
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_generee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_date_generation TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_signee BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS adequation_date_signature TIMESTAMP WITH TIME ZONE;

-- RTO
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_applicable BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_genere BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_date_generation TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_signe BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rto_date_signature TIMESTAMP WITH TIME ZONE;

-- ==========================================
-- Vérification
-- ==========================================
SELECT 'Migration completed successfully' as status;
