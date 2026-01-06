-- ==========================================
-- FARE EPARGNE - SCHÉMA BASE DE DONNÉES
-- Version : 1.0.0
-- Date : 19/11/2025
-- ==========================================

-- Suppression des tables si elles existent (ordre inverse des dépendances)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS produits CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- TABLE: users
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    civilite VARCHAR(10),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    fonction VARCHAR(100),
    telephone VARCHAR(20),
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'conseiller',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Contraintes
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'conseiller')),
    CONSTRAINT chk_users_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour optimisation
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_actif ON users(actif);

-- ==========================================
-- TABLE: clients (TABLE PRINCIPALE - 120+ champs)
-- ==========================================
CREATE TABLE clients (
    -- Identifiants
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conseiller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    numero_client VARCHAR(50) UNIQUE,
    statut VARCHAR(50) DEFAULT 'prospect',
    
    -- ==========================================
    -- SECTION 1 : IDENTITÉ TITULAIRE 1
    -- Note: Champs nullable pour permettre les brouillons
    -- ==========================================
    t1_civilite VARCHAR(10),
    t1_nom VARCHAR(100),
    t1_nom_jeune_fille VARCHAR(100),
    t1_prenom VARCHAR(100),
    t1_date_naissance DATE,
    t1_lieu_naissance VARCHAR(100),
    t1_nationalite VARCHAR(100) DEFAULT 'Française',
    t1_adresse TEXT,
    t1_email VARCHAR(255),
    t1_telephone VARCHAR(50),
    t1_us_person BOOLEAN DEFAULT FALSE,
    t1_regime_protection_juridique BOOLEAN DEFAULT FALSE,
    t1_regime_protection_forme VARCHAR(100),
    t1_representant_legal VARCHAR(255),
    t1_residence_fiscale VARCHAR(100) DEFAULT 'France',
    t1_residence_fiscale_autre VARCHAR(255),
    t1_profession VARCHAR(100),
    t1_retraite_depuis DATE,
    t1_chomage_depuis DATE,
    t1_ancienne_profession VARCHAR(100),
    t1_chef_entreprise BOOLEAN DEFAULT FALSE,
    t1_entreprise_denomination VARCHAR(255),
    t1_entreprise_forme_juridique VARCHAR(100),
    t1_entreprise_siege_social TEXT,
    
    -- ==========================================
    -- SECTION 2 : IDENTITÉ TITULAIRE 2 (OPTIONNEL)
    -- ==========================================
    t2_civilite VARCHAR(10),
    t2_nom VARCHAR(100),
    t2_nom_jeune_fille VARCHAR(100),
    t2_prenom VARCHAR(100),
    t2_date_naissance DATE,
    t2_lieu_naissance VARCHAR(100),
    t2_nationalite VARCHAR(100),
    t2_adresse TEXT,
    t2_email VARCHAR(255),
    t2_telephone VARCHAR(50),
    t2_us_person BOOLEAN DEFAULT FALSE,
    t2_regime_protection_juridique BOOLEAN DEFAULT FALSE,
    t2_regime_protection_forme VARCHAR(100),
    t2_representant_legal VARCHAR(255),
    t2_residence_fiscale VARCHAR(100),
    t2_residence_fiscale_autre VARCHAR(255),
    t2_profession VARCHAR(100),
    t2_retraite_depuis DATE,
    t2_chomage_depuis DATE,
    t2_ancienne_profession VARCHAR(100),
    t2_chef_entreprise BOOLEAN DEFAULT FALSE,
    t2_entreprise_denomination VARCHAR(255),
    t2_entreprise_forme_juridique VARCHAR(100),
    t2_entreprise_siege_social TEXT,
    
    -- ==========================================
    -- SECTION 3 : SITUATION FAMILIALE
    -- ==========================================
    situation_familiale VARCHAR(50),  -- nullable pour brouillons
    date_mariage DATE,
    contrat_mariage BOOLEAN DEFAULT FALSE,
    regime_matrimonial VARCHAR(100),
    date_pacs DATE,
    convention_pacs BOOLEAN DEFAULT FALSE,
    regime_pacs VARCHAR(100),
    date_divorce DATE,
    donation_entre_epoux BOOLEAN DEFAULT FALSE,
    donation_entre_epoux_date DATE,
    donation_entre_epoux_montant DECIMAL(15,2),
    donation_enfants BOOLEAN DEFAULT FALSE,
    donation_enfants_date DATE,
    donation_enfants_montant DECIMAL(15,2),
    nombre_enfants INTEGER DEFAULT 0,
    nombre_enfants_charge INTEGER DEFAULT 0,
    enfants JSONB,
    
    -- ==========================================
    -- SECTION 4 : SITUATION FINANCIÈRE
    -- ==========================================
    revenus_annuels_foyer VARCHAR(50),  -- nullable pour brouillons
    patrimoine_global VARCHAR(50),  -- nullable pour brouillons
    charges_annuelles_pourcent DECIMAL(5,2),
    charges_annuelles_montant DECIMAL(15,2),
    capacite_epargne_mensuelle DECIMAL(15,2),
    impot_revenu BOOLEAN DEFAULT FALSE,
    impot_fortune_immobiliere BOOLEAN DEFAULT FALSE,
    
    -- Répartition patrimoine (pourcentages)
    patrimoine_financier_pourcent DECIMAL(5,2),
    patrimoine_immobilier_pourcent DECIMAL(5,2),
    patrimoine_professionnel_pourcent DECIMAL(5,2),
    patrimoine_autres_pourcent DECIMAL(5,2),
    
    -- ==========================================
    -- SECTION 5 : ORIGINE DES FONDS
    -- ==========================================
    origine_fonds_nature VARCHAR(100),  -- nullable pour brouillons
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
    origine_fonds_provenance_etablissement VARCHAR(255),
    
    -- ==========================================
    -- SECTION 6 : PATRIMOINE (JSONB pour flexibilité)
    -- ==========================================
    patrimoine_financier JSONB,
    patrimoine_immobilier JSONB,
    patrimoine_professionnel JSONB,
    
    -- ==========================================
    -- SECTION 7 : CONNAISSANCE ET EXPÉRIENCE (KYC)
    -- ==========================================
    -- Produits monétaires
    kyc_monetaires_detention BOOLEAN DEFAULT FALSE,
    kyc_monetaires_operations VARCHAR(50),
    kyc_monetaires_duree VARCHAR(50),
    kyc_monetaires_volume VARCHAR(50),
    kyc_monetaires_q1 VARCHAR(20),
    kyc_monetaires_q2 VARCHAR(20),
    
    -- Obligations
    kyc_obligations_detention BOOLEAN DEFAULT FALSE,
    kyc_obligations_operations VARCHAR(50),
    kyc_obligations_duree VARCHAR(50),
    kyc_obligations_volume VARCHAR(50),
    kyc_obligations_q1 VARCHAR(20),
    kyc_obligations_q2 VARCHAR(20),
    
    -- Actions
    kyc_actions_detention BOOLEAN DEFAULT FALSE,
    kyc_actions_operations VARCHAR(50),
    kyc_actions_duree VARCHAR(50),
    kyc_actions_volume VARCHAR(50),
    kyc_actions_q1 VARCHAR(20),
    kyc_actions_q2 VARCHAR(20),
    
    -- SCPI
    kyc_scpi_detention BOOLEAN DEFAULT FALSE,
    kyc_scpi_operations VARCHAR(50),
    kyc_scpi_duree VARCHAR(50),
    kyc_scpi_volume VARCHAR(50),
    kyc_scpi_q1 VARCHAR(20),
    kyc_scpi_q2 VARCHAR(20),
    
    -- Private Equity
    kyc_pe_detention BOOLEAN DEFAULT FALSE,
    kyc_pe_operations VARCHAR(50),
    kyc_pe_duree VARCHAR(50),
    kyc_pe_volume VARCHAR(50),
    kyc_pe_q1 VARCHAR(20),
    kyc_pe_q2 VARCHAR(20),
    
    -- ETF
    kyc_etf_detention BOOLEAN DEFAULT FALSE,
    kyc_etf_operations VARCHAR(50),
    kyc_etf_duree VARCHAR(50),
    kyc_etf_volume VARCHAR(50),
    kyc_etf_q1 VARCHAR(20),
    kyc_etf_q2 VARCHAR(20),
    
    -- Dérivés
    kyc_derives_detention BOOLEAN DEFAULT FALSE,
    kyc_derives_operations VARCHAR(50),
    kyc_derives_duree VARCHAR(50),
    kyc_derives_volume VARCHAR(50),
    kyc_derives_q1 VARCHAR(20),
    kyc_derives_q2 VARCHAR(20),
    
    -- Structurés
    kyc_structures_detention BOOLEAN DEFAULT FALSE,
    kyc_structures_operations VARCHAR(50),
    kyc_structures_duree VARCHAR(50),
    kyc_structures_volume VARCHAR(50),
    kyc_structures_q1 VARCHAR(20),
    kyc_structures_q2 VARCHAR(20),
    
    -- Gestion portefeuille
    kyc_portefeuille_mandat BOOLEAN DEFAULT FALSE,
    kyc_portefeuille_gestion_personnelle BOOLEAN DEFAULT FALSE,
    kyc_portefeuille_gestion_conseiller BOOLEAN DEFAULT FALSE,
    kyc_portefeuille_experience_pro BOOLEAN DEFAULT FALSE,
    
    -- Culture financière
    kyc_culture_presse_financiere BOOLEAN DEFAULT FALSE,
    kyc_culture_suivi_bourse BOOLEAN DEFAULT FALSE,
    kyc_culture_releves_bancaires BOOLEAN DEFAULT FALSE,
    
    -- ==========================================
    -- SECTION 8 : PROFIL DE RISQUE
    -- ==========================================
    objectifs_investissement VARCHAR(255),  -- nullable pour brouillons
    horizon_placement VARCHAR(50),  -- nullable pour brouillons
    tolerance_risque VARCHAR(50),  -- nullable pour brouillons
    pertes_maximales_acceptables VARCHAR(50),  -- nullable pour brouillons
    experience_perte BOOLEAN DEFAULT FALSE,
    experience_perte_niveau VARCHAR(50),
    reaction_perte VARCHAR(100),
    reaction_gain VARCHAR(100),
    liquidite_importante BOOLEAN DEFAULT TRUE,
    pourcentage_patrimoine_investi VARCHAR(50),
    
    -- Profil calculé
    profil_risque_calcule VARCHAR(50),
    profil_risque_score INTEGER,
    profil_risque_date_calcul TIMESTAMP,
    
    -- ==========================================
    -- SECTION 9 : PRÉFÉRENCES DURABILITÉ
    -- ==========================================
    durabilite_souhait BOOLEAN DEFAULT FALSE,
    durabilite_niveau_preference VARCHAR(50),
    durabilite_importance_environnement INTEGER,
    durabilite_importance_social INTEGER,
    durabilite_importance_gouvernance INTEGER,
    durabilite_exclusions JSONB,
    durabilite_investissement_impact BOOLEAN DEFAULT FALSE,
    durabilite_investissement_solidaire BOOLEAN DEFAULT FALSE,
    durabilite_taxonomie_pourcent VARCHAR(50),
    durabilite_investissements_pourcent VARCHAR(50),
    durabilite_prise_compte_pai VARCHAR(50),
    durabilite_impact_selection BOOLEAN DEFAULT FALSE,
    durabilite_confirmation BOOLEAN DEFAULT FALSE,
    durabilite_criteres JSONB,
    
    -- ==========================================
    -- SECTION 10 : LCB-FT (Lutte Blanchiment)
    -- ==========================================
    lcb_ft_niveau_risque VARCHAR(50),
    lcb_ft_ppe BOOLEAN DEFAULT FALSE,
    lcb_ft_ppe_fonction VARCHAR(255),
    lcb_ft_ppe_famille BOOLEAN DEFAULT FALSE,
    lcb_ft_gel_avoirs_verifie BOOLEAN DEFAULT FALSE,
    lcb_ft_gel_avoirs_date_verification DATE,
    lcb_ft_justificatifs JSONB,
    
    -- ==========================================
    -- Données formulaire et documents
    -- ==========================================
    form_data JSONB,
    documents_selectionnes JSONB,

    -- ==========================================
    -- SECTION 11 : WORKFLOW RÉGLEMENTAIRE
    -- ==========================================
    -- Suivi du parcours réglementaire
    etape_parcours VARCHAR(50) DEFAULT 'identite',

    -- Lettre de Mission
    contexte_prestation TEXT,
    lettre_mission_generee BOOLEAN DEFAULT FALSE,
    lettre_mission_date_generation TIMESTAMP,
    lettre_mission_signee BOOLEAN DEFAULT FALSE,
    lettre_mission_date_signature TIMESTAMP,

    -- Document d'Entrée en Relation (DER)
    der_genere BOOLEAN DEFAULT FALSE,
    der_date_generation TIMESTAMP,
    der_signe BOOLEAN DEFAULT FALSE,
    der_date_signature TIMESTAMP,

    -- Déclaration d'Adéquation
    adequation_generee BOOLEAN DEFAULT FALSE,
    adequation_date_generation TIMESTAMP,
    adequation_signee BOOLEAN DEFAULT FALSE,
    adequation_date_signature TIMESTAMP,

    -- RTO (Relevé des Transactions et Opérations)
    rto_applicable BOOLEAN DEFAULT FALSE,
    rto_genere BOOLEAN DEFAULT FALSE,
    rto_date_generation TIMESTAMP,
    rto_signe BOOLEAN DEFAULT FALSE,
    rto_date_signature TIMESTAMP,

    -- ==========================================
    -- Métadonnées
    -- ==========================================
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    validated_at TIMESTAMP,
    validated_by UUID REFERENCES users(id),
    
    -- Contraintes (modifiées pour accepter NULL/brouillons)
    CONSTRAINT chk_clients_statut CHECK (statut IS NULL OR statut IN ('brouillon', 'prospect', 'client_actif', 'client_inactif')),
    CONSTRAINT chk_clients_t1_civilite CHECK (t1_civilite IS NULL OR t1_civilite IN ('Monsieur', 'Madame')),
    CONSTRAINT chk_clients_t2_civilite CHECK (t2_civilite IS NULL OR t2_civilite IN ('Monsieur', 'Madame')),
    CONSTRAINT chk_clients_situation_familiale CHECK (situation_familiale IS NULL OR situation_familiale IN ('Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf(ve)', 'Union libre')),
    CONSTRAINT chk_clients_revenus CHECK (revenus_annuels_foyer IS NULL OR revenus_annuels_foyer IN ('<50000', '50000-100000', '100001-150000', '150001-500000', '>500000')),
    CONSTRAINT chk_clients_patrimoine CHECK (patrimoine_global IS NULL OR patrimoine_global IN ('<100000', '100001-300000', '300001-500000', '500001-1000000', '1000001-5000000', '>5000000')),
    CONSTRAINT chk_clients_horizon CHECK (horizon_placement IS NULL OR horizon_placement = '' OR horizon_placement IN ('<1an', '1-3ans', '3-5ans', '5-8ans', '>8ans')),
    CONSTRAINT chk_clients_profil_risque CHECK (profil_risque_calcule IS NULL OR profil_risque_calcule IN ('Sécuritaire', 'Prudent', 'Equilibré', 'Dynamique')),
    CONSTRAINT chk_clients_lcb_ft CHECK (lcb_ft_niveau_risque IS NULL OR lcb_ft_niveau_risque IN ('Faible', 'Simplifié', 'Standard', 'Complémentaire', 'Renforcé')),
    CONSTRAINT chk_clients_etape_parcours CHECK (etape_parcours IS NULL OR etape_parcours IN ('identite', 'situation', 'kyc', 'profil_risque', 'durabilite', 'lcb_ft', 'der_genere', 'der_signe', 'lettre_mission', 'lettre_mission_signee', 'adequation', 'rto', 'complet'))
);

-- Index pour optimisation
CREATE INDEX idx_clients_conseiller ON clients(conseiller_id);
CREATE INDEX idx_clients_numero ON clients(numero_client);
CREATE INDEX idx_clients_statut ON clients(statut);
CREATE INDEX idx_clients_t1_nom ON clients(t1_nom);
CREATE INDEX idx_clients_t1_email ON clients(t1_email);
CREATE INDEX idx_clients_profil_risque ON clients(profil_risque_calcule);
CREATE INDEX idx_clients_lcb_ft ON clients(lcb_ft_niveau_risque);
CREATE INDEX idx_clients_etape_parcours ON clients(etape_parcours);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- ==========================================
-- TABLE: produits
-- ==========================================
CREATE TABLE produits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type_produit VARCHAR(50) NOT NULL,
    nom_produit VARCHAR(255) NOT NULL,
    fournisseur VARCHAR(255) NOT NULL,
    montant_investi DECIMAL(15,2),
    date_souscription DATE,
    statut VARCHAR(50) DEFAULT 'actif',
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT chk_produits_type CHECK (type_produit IN ('Assurance-vie', 'SCPI', 'PEA', 'Compte-titres', 'FCPI', 'FIP', 'PER', 'Crédit', 'Autre')),
    CONSTRAINT chk_produits_statut CHECK (statut IN ('actif', 'cloture', 'en_cours'))
);

-- Index
CREATE INDEX idx_produits_client ON produits(client_id);
CREATE INDEX idx_produits_type ON produits(type_produit);
CREATE INDEX idx_produits_statut ON produits(statut);

-- ==========================================
-- TABLE: documents
-- ==========================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type_document VARCHAR(50) NOT NULL,
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_fichier TEXT NOT NULL,
    taille_octets INTEGER,
    hash_fichier VARCHAR(64),
    genere_par UUID REFERENCES users(id),
    date_generation TIMESTAMP DEFAULT NOW(),
    date_signature TIMESTAMP,
    signe BOOLEAN DEFAULT FALSE,
    doc_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT chk_documents_type CHECK (type_document IN ('DER', 'KYC', 'QCC', 'Lettre_Mission_CIF', 'Declaration_Adequation_CIF', 'Convention_RTO', 'Rapport_Conseil_IAS', 'PROFIL_RISQUE', 'Export_CSV'))
);

-- Index
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_type ON documents(type_document);
CREATE INDEX idx_documents_signe ON documents(signe);
CREATE INDEX idx_documents_date ON documents(date_generation DESC);

-- ==========================================
-- TABLE: audit_logs
-- ==========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT chk_audit_action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'GENERATE_DOC'))
);

-- Index
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ==========================================
-- TRIGGERS pour updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- FIN DU SCHÉMA
-- ==========================================