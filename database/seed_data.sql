-- ==========================================
-- FARE EPARGNE - DONNÉES DE SEED
-- Version : 1.0.0
-- Date : 19/11/2025
-- ==========================================

-- Nettoyage des données existantes
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE produits CASCADE;
TRUNCATE TABLE clients CASCADE;
TRUNCATE TABLE users CASCADE;

-- ==========================================
-- USERS (Conseillers)
-- ==========================================
-- Password pour tous : Fare2025
-- Hash généré avec bcrypt cost=12
INSERT INTO users (id, email, civilite, nom, prenom, fonction, telephone, mot_de_passe_hash, role, actif) VALUES
('11111111-1111-1111-1111-111111111111', 'pierre.poher@fare-epargne.com', 'M.', 'Poher', 'Pierre', 'Directeur', '+689 87 00 00 01', '$2b$12$UDnDM4HTbGVqQ8OoVJ98C.2EL8ExcCKPUg4STdp/uw4eDY3Xj.sP6', 'admin', true),
('22222222-2222-2222-2222-222222222222', 'marie.teva@fare-epargne.com', 'Mme', 'Teva', 'Marie', 'Conseillère en gestion de patrimoine', '+689 87 00 00 02', '$2b$12$UDnDM4HTbGVqQ8OoVJ98C.2EL8ExcCKPUg4STdp/uw4eDY3Xj.sP6', 'conseiller', true),
('33333333-3333-3333-3333-333333333333', 'jean.wong@fare-epargne.com', 'M.', 'Wong', 'Jean', 'Conseiller en gestion de patrimoine', '+689 87 00 00 03', '$2b$12$UDnDM4HTbGVqQ8OoVJ98C.2EL8ExcCKPUg4STdp/uw4eDY3Xj.sP6', 'conseiller', true);

-- ==========================================
-- CLIENTS
-- ==========================================
INSERT INTO clients (
    id,
    conseiller_id,
    numero_client,
    statut,
    -- Titulaire 1
    t1_civilite,
    t1_nom,
    t1_nom_jeune_fille,
    t1_prenom,
    t1_date_naissance,
    t1_lieu_naissance,
    t1_nationalite,
    t1_adresse,
    t1_email,
    t1_telephone,
    t1_us_person,
    t1_regime_protection_juridique,
    t1_residence_fiscale,
    t1_profession,
    t1_chef_entreprise,
    t1_entreprise_denomination,
    t1_entreprise_forme_juridique,
    -- Titulaire 2
    t2_civilite,
    t2_nom,
    t2_prenom,
    t2_date_naissance,
    t2_lieu_naissance,
    t2_nationalite,
    t2_adresse,
    t2_email,
    t2_telephone,
    -- Situation familiale
    situation_familiale,
    date_mariage,
    contrat_mariage,
    regime_matrimonial,
    nombre_enfants,
    nombre_enfants_charge,
    enfants,
    -- Situation financière
    revenus_annuels_foyer,
    patrimoine_global,
    charges_annuelles_pourcent,
    charges_annuelles_montant,
    capacite_epargne_mensuelle,
    impot_revenu,
    impot_fortune_immobiliere,
    patrimoine_financier_pourcent,
    patrimoine_immobilier_pourcent,
    patrimoine_professionnel_pourcent,
    patrimoine_autres_pourcent,
    -- Origine des fonds
    origine_fonds_nature,
    origine_fonds_montant_prevu,
    origine_economique_revenus,
    origine_economique_epargne,
    origine_economique_heritage,
    origine_fonds_provenance_etablissement,
    -- Patrimoine détaillé (JSONB)
    patrimoine_financier,
    patrimoine_immobilier,
    patrimoine_professionnel,
    -- KYC - Expérience financière
    kyc_monetaires_detention,
    kyc_monetaires_operations,
    kyc_monetaires_duree,
    kyc_monetaires_volume,
    kyc_monetaires_q1,
    kyc_monetaires_q2,
    kyc_obligations_detention,
    kyc_actions_detention,
    kyc_actions_operations,
    kyc_actions_duree,
    kyc_actions_volume,
    kyc_scpi_detention,
    kyc_scpi_operations,
    kyc_scpi_duree,
    kyc_portefeuille_gestion_conseiller,
    kyc_culture_presse_financiere,
    kyc_culture_suivi_bourse,
    kyc_culture_releves_bancaires,
    -- Profil de risque
    objectifs_investissement,
    horizon_placement,
    tolerance_risque,
    pertes_maximales_acceptables,
    experience_perte,
    experience_perte_niveau,
    reaction_perte,
    reaction_gain,
    liquidite_importante,
    pourcentage_patrimoine_investi,
    profil_risque_calcule,
    profil_risque_score,
    -- Durabilité
    durabilite_souhait,
    durabilite_taxonomie_pourcent,
    durabilite_investissements_pourcent,
    durabilite_impact_selection,
    durabilite_criteres,
    -- LCB-FT
    lcb_ft_niveau_risque,
    lcb_ft_ppe,
    lcb_ft_gel_avoirs_verifie,
    lcb_ft_gel_avoirs_date_verification,
    validated_at,
    validated_by
) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'FAR-2025-0001',
    'client_actif',
    -- Titulaire 1
    'Monsieur',
    'TEAMO',
    NULL,
    'Robert',
    '1975-03-15',
    'Papeete',
    'Française',
    'BP 1234, 98713 Papeete, Tahiti',
    'robert.teamo@gmail.com',
    '+689 87 12 34 56',
    false,
    false,
    'France',
    'Chef d''entreprise',
    true,
    'Teamo Import Export SARL',
    'SARL',
    -- Titulaire 2
    'Madame',
    'TEAMO',
    'Vaiana',
    '1978-07-22',
    'Moorea',
    'Française',
    'BP 1234, 98713 Papeete, Tahiti',
    'vaiana.teamo@gmail.com',
    '+689 87 12 34 57',
    -- Situation familiale
    'Marié(e)',
    '2005-06-15',
    true,
    'Communauté réduite aux acquêts',
    2,
    2,
    '[{"prenom": "Moana", "nom": "TEAMO", "date_naissance": "2010-03-10", "lien_parente": "Fille", "a_charge": true}, {"prenom": "Maui", "nom": "TEAMO", "date_naissance": "2012-08-20", "lien_parente": "Fils", "a_charge": true}]'::jsonb,
    -- Situation financière
    '100001-150000',
    '500001-1000000',
    25.00,
    37500.00,
    2500.00,
    true,
    false,
    30.00,
    50.00,
    15.00,
    5.00,
    -- Origine des fonds
    'Liquidités',
    150000.00,
    true,
    true,
    false,
    'Banque de Tahiti',
    -- Patrimoine financier
    '[{"designation": "Assurance-vie BDT", "organisme": "Banque de Tahiti", "valeur": 80000, "date_souscription": "2015-01-15"}, {"designation": "PEA Socredo", "organisme": "Socredo", "valeur": 45000, "date_souscription": "2018-06-01"}]'::jsonb,
    -- Patrimoine immobilier
    '[{"designation": "Résidence principale Punaauia", "forme_propriete": "Pleine propriété", "date_achat": "2010-01-01", "valeur_achat": 45000000, "valeur_actuelle": 65000000, "credit_en_cours": false}]'::jsonb,
    -- Patrimoine professionnel
    '[{"designation": "Parts SARL Teamo Import", "detenteur": "50% des parts", "valeur_patrimoniale": 15000000}]'::jsonb,
    -- KYC
    true,
    '1-5 par an',
    '+4 ans',
    '10000-50000',
    'Vrai',
    'Vrai',
    false,
    true,
    '1-5 par an',
    '-4 ans',
    '5000-10000',
    true,
    '1-5 par an',
    '+10 ans',
    true,
    true,
    false,
    true,
    -- Profil de risque
    'Valorisation de capital, Diversification',
    '5-8ans',
    'Equilibré',
    'Maximum 15%',
    true,
    'Entre 10 et 20%',
    'Ne rien changer',
    'Conserver position',
    false,
    '10-25%',
    'Equilibré',
    65,
    -- Durabilité
    true,
    '≥25%',
    '≥25%',
    true,
    '{"criteres": ["Emissions GES", "Biodiversité", "Egalité H/F"]}'::jsonb,
    -- LCB-FT
    'Standard',
    false,
    true,
    '2025-11-01',
    '2025-11-02 10:30:00',
    '22222222-2222-2222-2222-222222222222'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'FAR-2025-0002',
    'prospect',
    -- Titulaire 1
    'Madame',
    'MARTIN',
    'DUBOIS',
    'Sophie',
    '1982-11-28',
    'Lyon',
    'Française',
    'Villa Lotus, Route de la Plage, 98729 Moorea',
    'sophie.martin@hotmail.com',
    '+689 87 98 76 54',
    false,
    false,
    'France',
    'Médecin libéral',
    false,
    NULL,
    NULL,
    -- Pas de Titulaire 2
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    -- Situation familiale
    'Divorcé(e)',
    NULL,
    false,
    NULL,
    1,
    1,
    '[{"prenom": "Emma", "nom": "MARTIN", "date_naissance": "2015-09-12", "lien_parente": "Fille", "a_charge": true}]'::jsonb,
    -- Situation financière
    '150001-500000',
    '300001-500000',
    30.00,
    60000.00,
    3500.00,
    true,
    false,
    40.00,
    45.00,
    10.00,
    5.00,
    -- Origine des fonds
    'Instruments financiers',
    200000.00,
    false,
    true,
    false,
    'Banque de Polynésie',
    -- Patrimoine financier
    '[{"designation": "Compte-titres BP", "organisme": "Banque de Polynésie", "valeur": 120000, "date_souscription": "2020-03-01"}]'::jsonb,
    -- Patrimoine immobilier
    '[{"designation": "Appartement Tahiti", "forme_propriete": "Pleine propriété", "date_achat": "2022-01-01", "valeur_achat": 35000000, "valeur_actuelle": 38000000, "credit_en_cours": true}]'::jsonb,
    NULL,
    -- KYC simplifié
    true,
    '<1 par an',
    '+4 ans',
    '<5000',
    'Vrai',
    'Vrai',
    false,
    false,
    NULL,
    NULL,
    NULL,
    false,
    NULL,
    NULL,
    false,
    false,
    false,
    true,
    -- Profil de risque
    'Préservation du capital, Recherche de revenus',
    '3-5ans',
    'Prudent',
    'Maximum 10%',
    false,
    NULL,
    NULL,
    NULL,
    true,
    '<10%',
    'Prudent',
    35,
    -- Durabilité
    false,
    NULL,
    NULL,
    false,
    NULL,
    -- LCB-FT
    'Simplifié',
    false,
    true,
    '2025-11-15',
    NULL,
    NULL
);

-- ==========================================
-- PRODUITS
-- ==========================================
INSERT INTO produits (client_id, type_produit, nom_produit, fournisseur, montant_investi, date_souscription, statut, details) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Assurance-vie', 'Himene Vie', 'UAF Life', 80000.00, '2015-01-15', 'actif', '{"numero_contrat": "AV-2015-1234", "support": "Multisupport"}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SCPI', 'Corum Origin', 'Corum AM', 50000.00, '2023-06-01', 'actif', '{"nombre_parts": 100, "rendement_previsionnel": 5.2}'::jsonb),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PEA', 'PEA Classique', 'Banque de Polynésie', 45000.00, '2020-03-01', 'actif', '{"numero_compte": "PEA-2020-5678"}'::jsonb);

-- ==========================================
-- DOCUMENTS
-- ==========================================
INSERT INTO documents (client_id, type_document, nom_fichier, chemin_fichier, taille_octets, genere_par, signe, doc_metadata) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DER', 'DER_TEAMO_Robert_2025_11_02.docx', '/exports/2025/11/DER_TEAMO_Robert_2025_11_02.docx', 125000, '22222222-2222-2222-2222-222222222222', true, '{"version": "1.0", "template": "DER_v2025"}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'KYC', 'KYC_TEAMO_Robert_2025_11_02.docx', '/exports/2025/11/KYC_TEAMO_Robert_2025_11_02.docx', 98000, '22222222-2222-2222-2222-222222222222', true, '{"version": "1.0", "template": "KYC_v2025"}'::jsonb),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'DER', 'DER_MARTIN_Sophie_2025_11_15.docx', '/exports/2025/11/DER_MARTIN_Sophie_2025_11_15.docx', 125000, '22222222-2222-2222-2222-222222222222', false, '{"version": "1.0", "template": "DER_v2025"}'::jsonb);

-- ==========================================
-- AUDIT LOGS
-- ==========================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent) VALUES
('22222222-2222-2222-2222-222222222222', 'CREATE', 'client', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"numero_client": "FAR-2025-0001"}'::jsonb, '192.168.1.10', 'Mozilla/5.0'),
('22222222-2222-2222-2222-222222222222', 'GENERATE_DOC', 'document', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"type": "DER"}'::jsonb, '192.168.1.10', 'Mozilla/5.0'),
('22222222-2222-2222-2222-222222222222', 'CREATE', 'client', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"numero_client": "FAR-2025-0002"}'::jsonb, '192.168.1.10', 'Mozilla/5.0');

-- ==========================================
-- FIN DES DONNÉES DE SEED
-- ==========================================

-- Affichage récapitulatif
SELECT 'Users créés:' as info, COUNT(*) as total FROM users;
SELECT 'Clients créés:' as info, COUNT(*) as total FROM clients;
SELECT 'Produits créés:' as info, COUNT(*) as total FROM produits;
SELECT 'Documents créés:' as info, COUNT(*) as total FROM documents;
SELECT 'Audit logs créés:' as info, COUNT(*) as total FROM audit_logs;