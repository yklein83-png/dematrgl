/**
 * Utilitaire de transformation form_data → format plat
 * Utilisé par DocumentEditor pour mapper TOUS les champs du tunnel Nouveau Client
 * vers le format attendu par le DocumentEditor
 */

// Transformation des civilités
export const mapCivilite = (val: string): string => {
  const map: Record<string, string> = {
    'M': 'Monsieur', 'Mme': 'Madame',
    'Monsieur': 'Monsieur', 'Madame': 'Madame'
  };
  return map[val] || val;
};

// Transformation des situations familiales
export const mapSituationFamiliale = (val: string): string => {
  const map: Record<string, string> = {
    'marie': 'Marié(e)', 'pacse': 'Pacsé(e)', 'celibataire': 'Célibataire',
    'veuf': 'Veuf(ve)', 'divorce': 'Divorcé(e)', 'union_libre': 'Concubinage',
    'Marié(e)': 'Marié(e)', 'Pacsé(e)': 'Pacsé(e)', 'Célibataire': 'Célibataire',
    'Veuf(ve)': 'Veuf(ve)', 'Divorcé(e)': 'Divorcé(e)', 'Concubinage': 'Concubinage',
  };
  return map[val] || val;
};

// Transformation des tranches revenus
export const mapTrancheRevenus = (val: string): string => {
  const map: Record<string, string> = {
    '<50000': '< 50 000 €', '50000-100000': '50 000 € - 100 000 €',
    '100001-150000': '100 001 € - 150 000 €', '150001-500000': '150 000 € - 500 000 €',
    '>500000': '> 500 000 €',
  };
  return map[val] || val;
};

// Transformation des tranches patrimoine
export const mapTranchePatrimoine = (val: string): string => {
  const map: Record<string, string> = {
    '<100000': '< 100 000 €', '100001-300000': '100 001 € - 300 000 €',
    '300001-500000': '300 001 € - 500 000 €', '500001-1000000': '500 001 € - 1 000 000 €',
    '1000001-5000000': '1 000 001 € - 5 000 000 €', '>5000000': '> 5 000 000 €',
  };
  return map[val] || val;
};

// Transformation horizon placement
export const mapHorizonPlacement = (val: string): string => {
  const map: Record<string, string> = {
    'court_terme': '< 1 an', 'moyen_terme': '1 - 3 ans',
    'long_terme': '3 - 5 ans', 'tres_long_terme': '> 5 ans',
  };
  return map[val] || val;
};

/**
 * Transforme les données du formulaire de création (form_data JSONB)
 * vers le format plat attendu par DocumentEditor
 * VERSION COMPLÈTE - Mappe TOUS les champs
 */
export function transformFormDataToFlat(formData: any): Record<string, any> {
  const result: Record<string, any> = {};

  // ==========================================
  // TITULAIRE 1 - COMPLET
  // ==========================================
  if (formData.titulaire1) {
    const t1 = formData.titulaire1;
    result.t1_civilite = mapCivilite(t1.civilite);
    result.t1_nom = t1.nom;
    result.t1_nom_naissance = t1.nomJeuneFille;
    result.t1_prenom = t1.prenom;
    result.t1_date_naissance = t1.dateNaissance;
    result.t1_lieu_naissance = t1.lieuNaissance;
    result.t1_pays_naissance = t1.paysNaissance;
    result.t1_nationalite = t1.nationalite;
    result.t1_adresse = t1.adresse;
    result.t1_code_postal = t1.codePostal;
    result.t1_ville = t1.ville;
    result.t1_pays_residence = t1.pays;
    result.t1_telephone = t1.telephone;
    result.t1_telephone_fixe = t1.telephoneFixe;
    result.t1_email = t1.email;
    result.t1_us_person = t1.usPerson;
    result.t1_tin = t1.tin;
    result.t1_residence_fiscale = t1.residenceFiscale;
    result.t1_residence_fiscale_autre = t1.residenceFiscaleAutre;
    result.t1_nif = t1.numeroFiscal;
    result.t1_situation_pro = t1.situationProfessionnelle;
    result.t1_profession = t1.profession;
    result.t1_secteur_activite = t1.secteurActivite;
    result.t1_employeur = t1.employeur;
    result.t1_date_debut_activite = t1.dateDebutActivite;
    result.t1_retraite_depuis = t1.retraiteDepuis;
    result.t1_chomage_depuis = t1.chomageDepuis;
    result.t1_ancienne_profession = t1.ancienneProfession;
    // Protection juridique
    result.t1_regime_protection = t1.regimeProtection;
    result.t1_regime_protection_type = t1.regimeProtectionType;
    result.t1_representant_legal = t1.representantLegal;
    result.t1_representant_legal_adresse = t1.representantLegalAdresse;
    // Chef d'entreprise
    result.t1_chef_entreprise = t1.chefEntreprise;
    result.t1_entreprise_denomination = t1.entrepriseDenomination;
    result.t1_entreprise_forme_juridique = t1.entrepriseFormeJuridique;
    result.t1_entreprise_siege_social = t1.entrepriseSiegeSocial;
    result.t1_entreprise_siret = t1.entrepriseSiret;
    result.t1_entreprise_capital = t1.entrepriseCapital;
    result.t1_entreprise_parts_detenues = t1.entreprisePartsDetenues;
  }

  // ==========================================
  // TITULAIRE 2 - COMPLET
  // ==========================================
  if (formData.hasTitulaire2 && formData.titulaire2) {
    const t2 = formData.titulaire2;
    result.t2_civilite = mapCivilite(t2.civilite);
    result.t2_nom = t2.nom;
    result.t2_nom_naissance = t2.nomJeuneFille;
    result.t2_prenom = t2.prenom;
    result.t2_date_naissance = t2.dateNaissance;
    result.t2_lieu_naissance = t2.lieuNaissance;
    result.t2_pays_naissance = t2.paysNaissance;
    result.t2_nationalite = t2.nationalite;
    result.t2_adresse = t2.adresse;
    result.t2_code_postal = t2.codePostal;
    result.t2_ville = t2.ville;
    result.t2_pays_residence = t2.pays;
    result.t2_telephone = t2.telephone;
    result.t2_email = t2.email;
    result.t2_us_person = t2.usPerson;
    result.t2_residence_fiscale = t2.residenceFiscale;
    result.t2_nif = t2.numeroFiscal;
    result.t2_situation_pro = t2.situationProfessionnelle;
    result.t2_profession = t2.profession;
    result.t2_secteur_activite = t2.secteurActivite;
    result.t2_employeur = t2.employeur;
    result.t2_chef_entreprise = t2.chefEntreprise;
  }

  // ==========================================
  // SITUATION FAMILIALE - COMPLET
  // ==========================================
  if (formData.situationFamiliale) {
    const sf = formData.situationFamiliale;
    result.situation_familiale = mapSituationFamiliale(sf.situation);
    result.date_mariage = sf.dateMariage;
    result.contrat_mariage = sf.contratMariage;
    result.regime_matrimonial = sf.regimeMatrimonial;
    result.date_pacs = sf.datePacs;
    result.convention_pacs = sf.conventionPacs;
    result.regime_pacs = sf.regimePacs;
    result.date_divorce = sf.dateDivorce;
    // Donations
    result.donation_entre_epoux = sf.donationEntreEpoux;
    result.donation_entre_epoux_date = sf.donationEntreEpouxDate;
    result.donation_entre_epoux_montant = sf.donationEntreEpouxMontant;
    result.donation_enfants = sf.donationEnfants;
    result.donation_enfants_date = sf.donationEnfantsDate;
    result.donation_enfants_montant = sf.donationEnfantsMontant;
    // Enfants
    result.nombre_enfants = sf.nombreEnfants;
    result.enfants_a_charge = sf.nombreEnfantsACharge;
    result.informations_complementaires = sf.informationsComplementaires;
    // Détail des enfants (tableau JSONB)
    if (sf.enfants && sf.enfants.length > 0) {
      result.enfants = sf.enfants;
    }
  }

  // ==========================================
  // SITUATION FINANCIÈRE - COMPLET
  // ==========================================
  if (formData.situationFinanciere) {
    const fin = formData.situationFinanciere;
    result.revenus_annuels_foyer = mapTrancheRevenus(fin.revenusAnnuelsFoyer);
    result.patrimoine_global = mapTranchePatrimoine(fin.patrimoineGlobal);
    result.charges_annuelles_pourcent = fin.chargesAnnuellesPourcent;
    result.charges_annuelles_montant = fin.chargesAnnuellesMontant;
    result.capacite_epargne_mensuelle = fin.capaciteEpargneMensuelle;
    result.patrimoine_financier_pourcent = fin.patrimoineFinancierPourcent;
    result.patrimoine_immobilier_pourcent = fin.patrimoineImmobilierPourcent;
    result.patrimoine_professionnel_pourcent = fin.patrimoineProfessionnelPourcent;
    result.patrimoine_autres_pourcent = fin.patrimoineAutresPourcent;
    result.impot_revenu = fin.impotRevenu;
    result.impot_fortune_immobiliere = fin.impotFortuneImmobiliere;
  }

  // ==========================================
  // ORIGINE DES FONDS - COMPLET
  // ==========================================
  if (formData.origineFonds) {
    const of = formData.origineFonds;
    result.origine_nature = of.nature;
    result.montant_investi_prevu = of.montantPrevu;
    result.origine_economique_revenus = of.origineRevenus;
    result.origine_economique_epargne = of.origineEpargne;
    result.origine_economique_heritage = of.origineHeritage;
    result.origine_economique_cession = of.origineCessionPro;
    result.origine_economique_vente_immo = of.origineCessionImmo;
    result.origine_economique_cession_mobiliere = of.origineCessionMobiliere;
    result.origine_economique_gains_jeu = of.origineGainsJeu;
    result.origine_economique_assurance_vie = of.origineAssuranceVie;
    result.origine_economique_autre = of.origineAutres;
    result.etablissement_bancaire_origine = of.etablissementBancaireOrigine;
  }

  // ==========================================
  // PATRIMOINE - COMPLET (avec tableaux JSONB)
  // ==========================================
  if (formData.patrimoine) {
    const pat = formData.patrimoine;
    if (pat.actifsFinanciers?.length > 0) result.patrimoine_financier = pat.actifsFinanciers;
    if (pat.actifsImmobiliers?.length > 0) result.patrimoine_immobilier = pat.actifsImmobiliers;
    if (pat.actifsProfessionnels?.length > 0) result.patrimoine_professionnel = pat.actifsProfessionnels;
    if (pat.emprunts?.length > 0) result.patrimoine_emprunts = pat.emprunts;
    if (pat.revenus?.length > 0) result.patrimoine_revenus = pat.revenus;
    if (pat.charges?.length > 0) result.patrimoine_charges = pat.charges;
  }

  // ==========================================
  // KYC - COMPLET
  // ==========================================
  if (formData.kyc) {
    const kyc = formData.kyc;
    // Formation
    result.niveau_etudes = kyc.niveauEtudes;
    result.domaine_etudes = kyc.domaineEtudes;
    result.formation_financiere = kyc.formationFinanciere;
    result.formation_financiere_detail = kyc.formationFinanciereDetail;
    // Expérience professionnelle
    result.experience_professionnelle_finance = kyc.experienceProfessionnelleFinance;
    result.experience_finance_duree = kyc.experienceFinanceDuree;
    result.experience_finance_poste = kyc.experienceFinancePoste;
    // Expérience investissement
    result.annees_premier_investissement = kyc.anneesPremierInvestissement;
    result.montant_moyen_operation = kyc.montantMoyenOperation;
    result.gestion_mandat = kyc.gestionParProfessionnel;
    result.gestion_conseiller = kyc.conseillerActuel;
    // Sources d'information
    result.lecture_presse_financiere = kyc.sourcesPresse;
    result.sources_internet = kyc.sourcesInternet;
    result.sources_conseiller = kyc.sourcesConseiller;
    result.sources_banque = kyc.sourcesBanque;
    result.sources_entourage = kyc.sourcesEntourage;
    result.sources_reseaux_sociaux = kyc.sourcesReseauxSociaux;
    // Compréhension des risques
    result.comprend_risque_perte = kyc.comprendRisquePerte;
    result.comprend_risque_liquidite = kyc.comprendRisqueLiquidite;
    result.comprend_risque_change = kyc.comprendRisqueChange;
    result.comprend_effet_levier = kyc.comprendEffetLevier;
    // Connaissance des instruments (map vers champs plats)
    if (kyc.connaissanceInstruments) {
      Object.entries(kyc.connaissanceInstruments).forEach(([type, data]: [string, any]) => {
        if (data) {
          result[`kyc_${type}_niveau`] = data.niveau;
          result[`kyc_${type}_frequence`] = data.frequence;
        }
      });
    }
  }

  // ==========================================
  // PROFIL DE RISQUE - COMPLET
  // ==========================================
  if (formData.profilRisque) {
    const pr = formData.profilRisque;
    result.horizon_placement = mapHorizonPlacement(pr.horizonPlacement);
    result.objectif_principal = pr.objectifPrincipal;
    result.tolerance_perte = pr.tolerancePerte;
    result.pertes_maximales_acceptables = pr.tolerancePerte ? `Maximum ${pr.tolerancePerte}%` : undefined;
    result.reaction_perte = pr.reactionBaisse;
    result.part_risquee = pr.partRisquee;
    result.importance_garantie_capital = pr.importanceGarantieCapital;
    // Objectifs spécifiques
    result.objectif_retraite = pr.objectifRetraite;
    result.objectif_transmission = pr.objectifTransmission;
    result.objectif_projet_vie = pr.objectifProjetVie;
    result.objectif_revenus = pr.objectifRevenuComplementaire;
    result.objectif_fiscal = pr.objectifOptimisationFiscale;
    result.objectif_preservation = pr.objectifEpargneSecurite;
    result.objectif_autre = pr.objectifAutre;
    // Profil validé
    result.profil_risque_calcule = pr.profilValide;
  }

  // ==========================================
  // DURABILITÉ ESG - COMPLET
  // ==========================================
  if (formData.durabilite) {
    const dur = formData.durabilite;
    result.durabilite_integration = dur.interesseESG;
    result.durabilite_niveau_preference = dur.niveauPreference;
    result.durabilite_importance_environnement = dur.importanceEnvironnement;
    result.durabilite_importance_social = dur.importanceSocial;
    result.durabilite_importance_gouvernance = dur.importanceGouvernance;
    result.durabilite_impact = dur.investissementImpact;
    result.durabilite_investissement_solidaire = dur.investissementSolidaire;
    result.durabilite_alignement_taxonomie_min = dur.alignementTaxonomieMin;
    result.durabilite_prise_compte_pai = dur.prendreEnComptePAI;
    result.durabilite_confirmation = dur.confirmationPreferences;
    // Exclusions ESG
    if (dur.exclusions) {
      result.esg_exclusion_armement = dur.exclusions.armement;
      result.esg_exclusion_tabac = dur.exclusions.tabac;
      result.esg_exclusion_alcool = dur.exclusions.alcool;
      result.esg_exclusion_jeux_hasard = dur.exclusions.jeux_hasard;
      result.esg_exclusion_energies_fossiles = dur.exclusions.energies_fossiles;
      result.esg_exclusion_nucleaire = dur.exclusions.nucleaire;
      result.esg_exclusion_ogm = dur.exclusions.ogm;
      result.esg_exclusion_pornographie = dur.exclusions.pornographie;
      result.esg_exclusion_tests_animaux = dur.exclusions.tests_animaux;
      result.esg_exclusion_deforestation = dur.exclusions.deforestation;
    }
  }

  // ==========================================
  // CONTEXTE MISSION - COMPLET
  // ==========================================
  if (formData.contexteMission) {
    const cm = formData.contexteMission;
    result.type_prestation = cm.typePrestation;
    result.mode_conseil = cm.modeConseil;
    result.instruments_souhaites = cm.instrumentsSouhaites;
    result.remuneration_mode = cm.remunerationMode;
    result.honoraires_montant = cm.honorairesMontant;
    result.honoraires_description = cm.honorairesDescription;
    result.frequence_suivi = cm.frequenceSuivi;
    result.date_remise_der = cm.dateRemiseDER;
    result.date_signature = cm.dateSignature;
    result.lieu_signature = cm.lieuSignature;
    result.nombre_exemplaires = cm.nombreExemplaires;
  }

  // ==========================================
  // RTO - COMPLET
  // ==========================================
  if (formData.rto) {
    const rto = formData.rto;
    result.rto_type_client = rto.typeClient;
    result.rto_profession_liberal = rto.estProfessionLiberal;
    result.rto_siret_professionnel = rto.siretProfessionnel;
    result.rto_activite_professionnelle = rto.activiteProfessionnelle;
    result.rto_modes_communication = rto.modesCommunication;
    result.rto_modes_communication_autre = rto.modesCommunicationAutre;
    // Personne morale
    if (rto.personneMorale) {
      const pm = rto.personneMorale;
      result.rto_pm_raison_sociale = pm.raisonSociale;
      result.rto_pm_objet_social = pm.objetSocial;
      result.rto_pm_forme_juridique = pm.formeJuridique;
      result.rto_pm_numero_rcs = pm.numeroRCS;
      result.rto_pm_ville_rcs = pm.villeRCS;
      result.rto_pm_siege_social = pm.siegeSocial;
      result.rto_pm_code_postal_siege = pm.codePostalSiege;
      result.rto_pm_ville_siege = pm.villeSiege;
      result.rto_pm_representant_civilite = pm.representantCivilite;
      result.rto_pm_representant_nom = pm.representantNom;
      result.rto_pm_representant_prenom = pm.representantPrenom;
      result.rto_pm_representant_qualite = pm.representantQualite;
    }
    // Comptes RTO
    if (rto.comptes?.length > 0) result.rto_comptes = rto.comptes;
  }

  return result;
}
