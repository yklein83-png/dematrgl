-- Client de test complet pour validation des documents
INSERT INTO clients (
    conseiller_id,
    numero_client,
    statut,
    -- Titulaire 1 - Identité
    t1_civilite, t1_nom, t1_nom_jeune_fille, t1_prenom,
    t1_date_naissance, t1_lieu_naissance, t1_nationalite,
    t1_adresse, t1_email, t1_telephone,
    t1_us_person, t1_regime_protection_juridique, t1_residence_fiscale,
    -- Titulaire 1 - Profession
    t1_profession, t1_chef_entreprise,
    t1_entreprise_denomination, t1_entreprise_forme_juridique, t1_entreprise_siege_social,
    -- Titulaire 2 - Identité
    t2_civilite, t2_nom, t2_nom_jeune_fille, t2_prenom,
    t2_date_naissance, t2_lieu_naissance, t2_nationalite,
    t2_adresse, t2_email, t2_telephone,
    t2_us_person, t2_regime_protection_juridique, t2_residence_fiscale,
    t2_profession,
    -- Situation familiale
    situation_familiale, date_mariage, contrat_mariage, regime_matrimonial,
    donation_entre_epoux, donation_entre_epoux_date, donation_entre_epoux_montant,
    donation_enfants, nombre_enfants, nombre_enfants_charge, enfants,
    -- Situation financière
    revenus_annuels_foyer, patrimoine_global,
    charges_annuelles_pourcent, charges_annuelles_montant, capacite_epargne_mensuelle,
    impot_revenu, impot_fortune_immobiliere,
    patrimoine_financier_pourcent, patrimoine_immobilier_pourcent,
    patrimoine_professionnel_pourcent, patrimoine_autres_pourcent,
    -- Patrimoine détaillé (JSONB)
    patrimoine_financier, patrimoine_immobilier, patrimoine_professionnel,
    patrimoine_emprunts, patrimoine_revenus, patrimoine_charges,
    -- Origine des fonds
    origine_fonds_nature, origine_fonds_montant_prevu,
    origine_economique_revenus, origine_economique_epargne, origine_economique_heritage,
    origine_economique_cession_pro, origine_economique_cession_immo,
    origine_fonds_provenance_etablissement,
    -- KYC Produits - Monétaires
    kyc_monetaires_detention, kyc_monetaires_operations, kyc_monetaires_duree,
    kyc_monetaires_volume, kyc_monetaires_q1, kyc_monetaires_q2,
    -- KYC Produits - Obligations
    kyc_obligations_detention, kyc_obligations_operations, kyc_obligations_duree,
    kyc_obligations_volume, kyc_obligations_q1, kyc_obligations_q2,
    -- KYC Produits - Actions
    kyc_actions_detention, kyc_actions_operations, kyc_actions_duree,
    kyc_actions_volume, kyc_actions_q1, kyc_actions_q2,
    -- KYC Produits - SCPI
    kyc_scpi_detention, kyc_scpi_operations, kyc_scpi_duree,
    kyc_scpi_volume, kyc_scpi_q1, kyc_scpi_q2,
    -- KYC Produits - Private Equity
    kyc_pe_detention,
    -- KYC Produits - ETF
    kyc_etf_detention, kyc_etf_operations, kyc_etf_duree, kyc_etf_volume,
    -- KYC Mode de gestion
    kyc_portefeuille_mandat, kyc_portefeuille_gestion_personnelle,
    kyc_portefeuille_gestion_conseiller,
    -- KYC Culture financière
    kyc_culture_presse_financiere, kyc_culture_suivi_bourse, kyc_culture_releves_bancaires,
    -- Profil de risque
    objectifs_investissement, horizon_placement, tolerance_risque,
    pertes_maximales_acceptables, experience_perte, experience_perte_niveau,
    reaction_perte, reaction_gain,
    liquidite_importante, pourcentage_patrimoine_investi,
    profil_risque_calcule, profil_risque_score, profil_risque_date_calcul,
    -- ESG
    durabilite_souhait, durabilite_niveau_preference,
    durabilite_importance_environnement, durabilite_importance_social, durabilite_importance_gouvernance,
    durabilite_investissement_impact, durabilite_investissement_solidaire,
    durabilite_confirmation,
    -- LCB-FT
    lcb_ft_niveau_risque, lcb_ft_ppe, lcb_ft_ppe_famille,
    lcb_ft_gel_avoirs_verifie, lcb_ft_gel_avoirs_date_verification
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'CLI-2025-TEST',
    'client_actif',
    -- T1 Identité
    'Monsieur', 'DUPONT', NULL, 'Jean-Pierre',
    '1975-03-15', 'Paris 15ème', 'Française',
    '25 Rue de la République, 75001 Paris', 'jean-pierre.dupont@email.fr', '+33 6 12 34 56 78',
    false, false, 'France',
    -- T1 Profession
    'Directeur Commercial', true,
    'DUPONT CONSEIL SARL', 'SARL', '25 Rue de la République, 75001 Paris',
    -- T2 Identité
    'Madame', 'DUPONT', 'MARTIN', 'Marie',
    '1978-07-22', 'Lyon 3ème', 'Française',
    '25 Rue de la République, 75001 Paris', 'marie.dupont@email.fr', '+33 6 98 76 54 32',
    false, false, 'France',
    'Médecin généraliste',
    -- Situation familiale
    'Marié(e)', '2005-09-10', true, 'Séparation de biens',
    true, '2018-06-15', 200000.00,
    true, 2, 1,
    '[{"prenom": "Lucas", "age": 16, "a_charge": true}, {"prenom": "Emma", "age": 19, "a_charge": false}]'::jsonb,
    -- Situation financière
    '150001-500000', '500001-1000000',
    30.00, 75000.00, 3500.00,
    true, false,
    40.00, 45.00, 10.00, 5.00,
    -- Patrimoine détaillé
    '[{"type": "Assurance-vie", "etablissement": "AXA", "valeur": 180000}, {"type": "PEA", "etablissement": "Boursorama", "valeur": 65000}, {"type": "Compte-titres", "etablissement": "BNP", "valeur": 45000}]'::jsonb,
    '[{"type": "Résidence principale", "localisation": "Paris 1er", "valeur": 650000, "emprunt": 180000}, {"type": "Résidence secondaire", "localisation": "Deauville", "valeur": 280000, "emprunt": 0}]'::jsonb,
    '[{"type": "Parts sociales", "societe": "DUPONT CONSEIL SARL", "valeur": 120000}]'::jsonb,
    '[{"type": "Crédit immobilier RP", "etablissement": "Crédit Agricole", "montant_restant": 180000, "mensualite": 1450, "fin": "2035-09"}]'::jsonb,
    '[{"type": "Salaire T1", "montant_annuel": 95000}, {"type": "Salaire T2", "montant_annuel": 72000}, {"type": "Dividendes", "montant_annuel": 15000}]'::jsonb,
    '[{"type": "Charges courantes", "montant_annuel": 24000}, {"type": "Crédit immobilier", "montant_annuel": 17400}, {"type": "Impôts", "montant_annuel": 35000}]'::jsonb,
    -- Origine des fonds
    'Épargne régulière et revenus professionnels', 50000.00,
    true, true, false, false, false,
    'Crédit Agricole Paris',
    -- KYC Monétaires
    true, 'Plus de 50', 'Plus de 10 ans', '50 000 - 100 000 €', 'Bonne', 'Bonne',
    -- KYC Obligations
    true, '10 à 50', '5 à 10 ans', '50 000 - 100 000 €', 'Bonne', 'Moyenne',
    -- KYC Actions
    true, 'Plus de 50', 'Plus de 10 ans', '50 000 - 100 000 €', 'Bonne', 'Bonne',
    -- KYC SCPI
    true, '1 à 10', '3 à 5 ans', '10 000 - 50 000 €', 'Moyenne', 'Moyenne',
    -- KYC Private Equity
    false,
    -- KYC ETF
    true, '10 à 50', '3 à 5 ans', '10 000 - 50 000 €',
    -- KYC Mode gestion
    false, true, true,
    -- KYC Culture
    true, true, true,
    -- Profil de risque
    'Constitution et valorisation du patrimoine, préparation retraite', '5-8ans', 'Équilibré',
    '10-15%', true, '5-10%',
    'J''attends que ça remonte sans paniquer', 'Je sécurise une partie des gains',
    true, '20-30%',
    'Equilibré', 52, NOW(),
    -- ESG
    true, 'Modéré',
    7, 6, 5,
    true, false,
    true,
    -- LCB-FT
    'Standard', false, false,
    true, '2024-11-20'
) RETURNING id, numero_client, t1_nom, t1_prenom;
