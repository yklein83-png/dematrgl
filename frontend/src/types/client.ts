/**
 * Types pour le formulaire client complet
 * Conformité AMF/ACPR - MIF2 - SFDR
 */

// ==========================================
// DOCUMENTS RÉGLEMENTAIRES
// ==========================================
export type DocumentType =
  | 'DER'           // Document d'Entrée en Relation (obligatoire)
  | 'QCC'           // Questionnaire Connaissance Client (obligatoire)
  | 'PROFIL_RISQUE' // Profil de Risque (obligatoire)
  | 'LETTRE_MISSION'// Lettre de Mission (obligatoire)
  | 'DECLARATION_ADEQUATION' // Déclaration d'Adéquation (obligatoire)
  | 'CONVENTION_RTO' // Convention RTO (optionnel)
  | 'RAPPORT_IAS';   // Rapport Conseil IAS (optionnel)

export interface DocumentSelection {
  type: DocumentType;
  label: string;
  description: string;
  obligatoire: boolean;
  selected: boolean;
}

// ==========================================
// TYPES ÉNUMÉRÉS
// ==========================================

// Civilité
export type Civilite = 'M' | 'Mme';

// Situation familiale
export type SituationFamiliale =
  | 'marie'
  | 'pacse'
  | 'celibataire'
  | 'veuf'
  | 'divorce'
  | 'union_libre';

// Tranches revenus
export type TrancheRevenus =
  | '<50000'
  | '50000-100000'
  | '100001-150000'
  | '150001-500000'
  | '>500000';

// Tranches patrimoine
export type TranchePatrimoine =
  | '<100000'
  | '100001-300000'
  | '300001-500000'
  | '500001-1000000'
  | '1000001-5000000'
  | '>5000000';

// Forme de détention
export type FormeDetention =
  | 'pleine_propriete'
  | 'usufruit'
  | 'nue_propriete'
  | 'indivision';

// Niveau de connaissance KYC
export type NiveauConnaissance =
  | 'aucune'
  | 'basique'
  | 'moyenne'
  | 'avancee'
  | 'expert';

// Fréquence opération
export type FrequenceOperation =
  | 'jamais'
  | 'rarement'
  | 'occasionnel'
  | 'regulier'
  | 'frequent';

// Types d'instruments financiers
export type TypeInstrument =
  | 'livrets'
  | 'comptes_terme'
  | 'obligations'
  | 'actions'
  | 'opcvm'
  | 'assurance_vie_euros'
  | 'assurance_vie_uc'
  | 'per'
  | 'scpi'
  | 'private_equity'
  | 'produits_structures'
  | 'derives'
  | 'crypto'
  | 'crowdfunding';

// Horizon de placement
export type HorizonPlacement =
  | 'court_terme'
  | 'moyen_terme'
  | 'long_terme'
  | 'tres_long_terme';

// Objectif principal
export type ObjectifPrincipal =
  | 'securite'
  | 'revenus_reguliers'
  | 'croissance_moderee'
  | 'croissance_dynamique';

// Niveau de risque
export type NiveauRisque =
  | 'securitaire'
  | 'prudent'
  | 'equilibre'
  | 'dynamique'
  | 'offensif';

// Préférence ESG
export type NiveauPreferenceESG =
  | 'non_interesse'
  | 'interesse'
  | 'prioritaire'
  | 'exclusif';

// ==========================================
// STRUCTURE TITULAIRE
// ==========================================
export interface Titulaire {
  // Identité
  civilite: Civilite;
  nom: string;
  nomJeuneFille?: string;
  prenom: string;
  dateNaissance: Date | null;
  lieuNaissance: string;
  paysNaissance: string;
  nationalite: string;

  // Contact
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  telephone: string;
  telephoneFixe?: string;
  email: string;

  // FATCA
  usPerson: boolean;
  tin?: string; // Tax Identification Number si US Person

  // Protection juridique
  regimeProtection: boolean;
  regimeProtectionType?: string;
  representantLegal?: string;
  representantLegalAdresse?: string;

  // Résidence fiscale
  residenceFiscale: string;
  residenceFiscaleAutre?: string;
  numeroFiscal?: string;

  // Profession
  situationProfessionnelle: string;
  profession: string;
  employeur?: string;
  secteurActivite?: string;
  dateDebutActivite?: Date | null;
  retraiteDepuis?: Date | null;
  chomageDepuis?: Date | null;
  ancienneProfession?: string;

  // Chef d'entreprise
  chefEntreprise: boolean;
  entrepriseDenomination?: string;
  entrepriseFormeJuridique?: string;
  entrepriseSiegeSocial?: string;
  entrepriseSiret?: string;
  entrepriseCapital?: number;
  entreprisePartsDetenues?: number;
}

// ==========================================
// SITUATION FAMILIALE
// ==========================================
export interface SituationFamilialeData {
  situation: SituationFamiliale;
  dateMariage?: Date | null;
  contratMariage: boolean;
  regimeMatrimonial?: string;
  datePacs?: Date | null;
  conventionPacs: boolean;
  regimePacs?: string;
  dateDivorce?: Date | null;

  // Donations
  donationEntreEpoux: boolean;
  donationEntreEpouxDate?: Date | null;
  donationEntreEpouxMontant?: number;
  donationEnfants: boolean;
  donationEnfantsDate?: Date | null;
  donationEnfantsMontant?: number;

  // Enfants
  nombreEnfants: number;
  nombreEnfantsACharge: number;
  enfants: Enfant[];

  // Informations complémentaires
  informationsComplementaires?: string;
}

export interface Enfant {
  prenom: string;
  dateNaissance: Date | null;
  aCharge: boolean;
}

// ==========================================
// SITUATION FINANCIÈRE
// ==========================================
export interface SituationFinanciereData {
  revenusAnnuelsFoyer: TrancheRevenus;
  patrimoineGlobal: TranchePatrimoine;

  // Engagements
  chargesAnnuellesPourcent?: number;
  chargesAnnuellesMontant?: number;
  capaciteEpargneMensuelle?: number;

  // Répartition patrimoine
  patrimoineFinancierPourcent?: number;
  patrimoineImmobilierPourcent?: number;
  patrimoineProfessionnelPourcent?: number;
  patrimoineAutresPourcent?: number;

  // Imposition
  impotRevenu: boolean;
  impotFortuneImmobiliere: boolean;
}

// ==========================================
// ORIGINE DES FONDS (LCB-FT)
// ==========================================
export interface OrigineFondsData {
  nature: 'liquidites' | 'instruments_financiers' | 'les_deux';
  montantPrevu?: number;

  // Origine économique (choix multiples)
  origineRevenus: boolean;
  origineEpargne: boolean;
  origineHeritage: boolean;
  origineCessionPro: boolean;
  origineCessionImmo: boolean;
  origineCessionMobiliere: boolean;
  origineGainsJeu: boolean;
  origineAssuranceVie: boolean;
  origineAutres?: string;

  // Provenance
  etablissementBancaireOrigine?: string;
}

// ==========================================
// PATRIMOINE DÉTAILLÉ
// ==========================================
export interface ActifFinancier {
  designation: string;
  organisme: string;
  valeur: number;
  detenteur: string;
  formeDetention: FormeDetention;
  dateSouscription?: Date | null;
}

export interface ActifImmobilier {
  designation: string;
  formePropriete: FormeDetention;
  valeurAcquisition: number;
  valeurActuelle: number;
  revenusAnnuels: number;
  chargesAnnuelles: number;
  creditEnCours: boolean;
  capitalRestantDu: number;
}

export interface ActifProfessionnel {
  designation: string;
  capitalDetenu: number;
  valeur: number;
  chargesAnnuelles: number;
}

export interface EmpruntData {
  objet: string;
  emprunteur: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  capitalInitial: number;
  capitalRestant: number;
  echeanceMensuelle: number;
  tauxInteret: number;
}

export interface RevenuData {
  type: string;
  montantAnnuel: number;
  beneficiaire: string;
}

export interface ChargeData {
  type: string;
  montantAnnuel: number;
  debiteur: string;
}

export interface PatrimoineData {
  actifsFinanciers: ActifFinancier[];
  actifsImmobiliers: ActifImmobilier[];
  actifsProfessionnels: ActifProfessionnel[];
  emprunts: EmpruntData[];
  revenus: RevenuData[];
  charges: ChargeData[];
}

// ==========================================
// KYC - CONNAISSANCE & EXPÉRIENCE
// ==========================================
export interface ConnaissanceInstrument {
  niveau: NiveauConnaissance;
  frequence: FrequenceOperation;
}

export interface KYCData {
  // Formation
  niveauEtudes?: string;
  domaineEtudes?: string;
  formationFinanciere: boolean;
  formationFinanciereDetail?: string;

  // Expérience professionnelle
  experienceProfessionnelleFinance: boolean;
  experienceFinanceDuree?: string;
  experienceFinancePoste?: string;

  // Connaissance des instruments
  connaissanceInstruments: Partial<Record<TypeInstrument, ConnaissanceInstrument>>;

  // Expérience investissement
  anneesPremierInvestissement?: string;
  montantMoyenOperation?: string;
  gestionParProfessionnel: boolean;
  conseillerActuel: boolean;

  // Sources d'information
  sourcesPresse: boolean;
  sourcesInternet: boolean;
  sourcesConseiller: boolean;
  sourcesBanque: boolean;
  sourcesEntourage: boolean;
  sourcesReseauxSociaux: boolean;

  // Compréhension des risques
  comprendRisquePerte: boolean;
  comprendRisqueLiquidite: boolean;
  comprendRisqueChange: boolean;
  comprendEffetLevier: boolean;
}

// ==========================================
// PROFIL DE RISQUE
// ==========================================
export interface ProfilRisqueData {
  horizonPlacement?: HorizonPlacement;
  objectifPrincipal?: ObjectifPrincipal;
  tolerancePerte?: number;
  reactionBaisse?: string;
  partRisquee?: number;
  importanceGarantieCapital?: number;

  // Objectifs spécifiques
  objectifRetraite: boolean;
  objectifTransmission: boolean;
  objectifProjetVie: boolean;
  objectifRevenuComplementaire: boolean;
  objectifOptimisationFiscale: boolean;
  objectifEpargneSecurite: boolean;
  objectifAutre?: string;

  // Profil validé
  profilValide?: NiveauRisque;
}

// ==========================================
// CONTEXTE DE MISSION
// ==========================================

export type TypePrestation =
  | 'diagnostic'
  | 'assistance_suivi'
  | 'conseil_investissement';

export type ModeConseil =
  | 'independant'
  | 'non_independant';

export type ModeRemuneration =
  | 'honoraires'
  | 'retrocessions'
  | 'mixte';

export type FrequenceSuivi =
  | 'annuel'
  | 'semestriel'
  | 'trimestriel'
  | 'mensuel'
  | 'ponctuel';

export type InstrumentFinancier =
  | 'assurance_vie'
  | 'per'
  | 'scpi_opci'
  | 'fonds_opcvm'
  | 'actions_titres_vifs'
  | 'obligations'
  | 'private_equity'
  | 'crowdfunding'
  | 'produits_structures'
  | 'compte_titres'
  | 'pea';

export interface ContexteMissionData {
  // Type de prestation
  typePrestation?: TypePrestation;
  modeConseil?: ModeConseil;

  // Instruments souhaités
  instrumentsSouhaites: InstrumentFinancier[];

  // Rémunération
  remunerationMode?: ModeRemuneration;
  honorairesMontant?: number;
  honorairesDescription?: string;

  // Suivi
  frequenceSuivi?: FrequenceSuivi;

  // DER - Date de remise du Document d'Entrée en Relation
  dateRemiseDER?: Date | null;

  // Signatures de la Lettre de Mission
  dateSignature?: Date | null;
  lieuSignature: string;
  nombreExemplaires: number;

  // Métadonnées conseiller (pré-remplies côté serveur)
  conseillerId?: string;
  conseillerNom?: string;
  conseillerPrenom?: string;
  conseillerTitre?: string;
}

// ==========================================
// RTO - CONVENTION RÉCEPTION TRANSMISSION ORDRES
// ==========================================

export type TypeClientRTO = 'personne_physique' | 'personne_morale';

export type ModeCommunicationRTO = 'courrier' | 'fax' | 'email' | 'autre';

export interface PersonneMoraleRTO {
  raisonSociale: string;
  objetSocial: string;
  formeJuridique: string;
  numeroRCS: string;
  villeRCS: string;
  siegeSocial: string;
  codePostalSiege: string;
  villeSiege: string;
  representantCivilite: string;
  representantNom: string;
  representantPrenom: string;
  representantQualite: string; // PDG, Gérant, etc.
}

export interface RTOData {
  // Type de client
  typeClient: TypeClientRTO;

  // Si personne physique - prof lib / entrepreneur
  estProfessionLiberal: boolean;
  siretProfessionnel?: string;
  activiteProfessionnelle?: string; // "avocat au barreau de...", "consultant", etc.

  // Si personne morale
  personneMorale?: PersonneMoraleRTO;

  // Comptes titres (multi)
  comptes: CompteRTO[];

  // Modes de communication pour transmission ordres
  modesCommunication: ModeCommunicationRTO[];
  modesCommunicationAutre?: string;
}

export interface CompteRTO {
  type: string; // PEA, Compte-titres, etc.
  numero: string;
  etablissement: string;
}

export const defaultPersonneMoraleRTO: PersonneMoraleRTO = {
  raisonSociale: '',
  objetSocial: '',
  formeJuridique: '',
  numeroRCS: '',
  villeRCS: '',
  siegeSocial: '',
  codePostalSiege: '',
  villeSiege: '',
  representantCivilite: 'M',
  representantNom: '',
  representantPrenom: '',
  representantQualite: '',
};

export const defaultRTOData: RTOData = {
  typeClient: 'personne_physique',
  estProfessionLiberal: false,
  comptes: [],
  modesCommunication: ['email'],
};

// ==========================================
// DURABILITÉ (ESG)
// ==========================================
export interface ExclusionsESG {
  armement: boolean;
  tabac: boolean;
  alcool: boolean;
  jeux_hasard: boolean;
  energies_fossiles: boolean;
  nucleaire: boolean;
  ogm: boolean;
  pornographie: boolean;
  tests_animaux: boolean;
  deforestation: boolean;
}

export interface DurabiliteData {
  interesseESG?: boolean;
  niveauPreference?: NiveauPreferenceESG;

  // Priorités
  importanceEnvironnement?: number;
  importanceSocial?: number;
  importanceGouvernance?: number;

  // Exclusions
  exclusions: Partial<ExclusionsESG>;

  // Impact
  investissementImpact: boolean;
  investissementSolidaire: boolean;

  // Taxonomie UE
  alignementTaxonomieMin?: number;

  // PAI
  prendreEnComptePAI?: string;

  // Confirmation
  confirmationPreferences: boolean;
}

// ==========================================
// FORMULAIRE CLIENT COMPLET
// ==========================================
export interface ClientFormData {
  // Sélection des documents
  documentsSelectionnes: DocumentType[];

  // Titulaires
  titulaire1: Titulaire;
  hasTitulaire2: boolean;
  titulaire2?: Titulaire;

  // Sections
  situationFamiliale: SituationFamilialeData;
  situationFinanciere: SituationFinanciereData;
  origineFonds: OrigineFondsData;
  patrimoine: PatrimoineData;
  kyc: KYCData;
  profilRisque: ProfilRisqueData;
  durabilite: DurabiliteData;
  contexteMission: ContexteMissionData;
  rto: RTOData;

  // Métadonnées
  dateCreation?: Date;
  dateMiseAJour?: Date;
  conseillerId?: string;
}

// ==========================================
// VALEURS PAR DÉFAUT
// ==========================================
export const defaultTitulaire: Titulaire = {
  civilite: 'M',
  nom: '',
  prenom: '',
  dateNaissance: null,
  lieuNaissance: '',
  paysNaissance: 'France',
  nationalite: 'Française',
  adresse: '',
  codePostal: '',
  ville: '',
  pays: 'France',
  telephone: '',
  email: '',
  usPerson: false,
  regimeProtection: false,
  residenceFiscale: 'France',
  situationProfessionnelle: '',
  profession: '',
  chefEntreprise: false,
};

export const defaultSituationFamiliale: SituationFamilialeData = {
  situation: 'celibataire',
  contratMariage: false,
  conventionPacs: false,
  donationEntreEpoux: false,
  donationEnfants: false,
  nombreEnfants: 0,
  nombreEnfantsACharge: 0,
  enfants: [],
};

export const defaultSituationFinanciere: SituationFinanciereData = {
  revenusAnnuelsFoyer: '<50000',
  patrimoineGlobal: '<100000',
  impotRevenu: false,
  impotFortuneImmobiliere: false,
};

export const defaultOrigineFonds: OrigineFondsData = {
  nature: 'liquidites',
  origineRevenus: false,
  origineEpargne: false,
  origineHeritage: false,
  origineCessionPro: false,
  origineCessionImmo: false,
  origineCessionMobiliere: false,
  origineGainsJeu: false,
  origineAssuranceVie: false,
};

export const defaultPatrimoine: PatrimoineData = {
  actifsFinanciers: [],
  actifsImmobiliers: [],
  actifsProfessionnels: [],
  emprunts: [],
  revenus: [],
  charges: [],
};

export const defaultKYC: KYCData = {
  formationFinanciere: false,
  experienceProfessionnelleFinance: false,
  connaissanceInstruments: {},
  gestionParProfessionnel: false,
  conseillerActuel: false,
  sourcesPresse: false,
  sourcesInternet: false,
  sourcesConseiller: false,
  sourcesBanque: false,
  sourcesEntourage: false,
  sourcesReseauxSociaux: false,
  comprendRisquePerte: false,
  comprendRisqueLiquidite: false,
  comprendRisqueChange: false,
  comprendEffetLevier: false,
};

export const defaultProfilRisque: ProfilRisqueData = {
  objectifRetraite: false,
  objectifTransmission: false,
  objectifProjetVie: false,
  objectifRevenuComplementaire: false,
  objectifOptimisationFiscale: false,
  objectifEpargneSecurite: false,
};

export const defaultDurabilite: DurabiliteData = {
  exclusions: {},
  investissementImpact: false,
  investissementSolidaire: false,
  confirmationPreferences: false,
};

export const defaultContexteMission: ContexteMissionData = {
  instrumentsSouhaites: [],
  lieuSignature: 'Papeete',
  nombreExemplaires: 2,
  dateRemiseDER: null,
  dateSignature: null,
};

export const defaultClientFormData: ClientFormData = {
  documentsSelectionnes: ['DER', 'QCC', 'PROFIL_RISQUE', 'LETTRE_MISSION', 'DECLARATION_ADEQUATION'],
  titulaire1: defaultTitulaire,
  hasTitulaire2: false,
  situationFamiliale: defaultSituationFamiliale,
  situationFinanciere: defaultSituationFinanciere,
  origineFonds: defaultOrigineFonds,
  patrimoine: defaultPatrimoine,
  kyc: defaultKYC,
  profilRisque: defaultProfilRisque,
  durabilite: defaultDurabilite,
  contexteMission: defaultContexteMission,
  rto: defaultRTOData,
};

// ==========================================
// LISTE DES DOCUMENTS DISPONIBLES
// ==========================================
export const DOCUMENTS_DISPONIBLES: DocumentSelection[] = [
  {
    type: 'DER',
    label: 'DER - Document d\'Entrée en Relation',
    description: 'Présentation du cabinet, statuts réglementaires, RGPD',
    obligatoire: true,
    selected: true,
  },
  {
    type: 'QCC',
    label: 'QCC - Questionnaire Connaissance Client',
    description: 'Identité, situation familiale, patrimoine, origine des fonds',
    obligatoire: true,
    selected: true,
  },
  {
    type: 'PROFIL_RISQUE',
    label: 'Profil de Risque',
    description: 'Évaluation de la tolérance au risque et calcul du profil',
    obligatoire: true,
    selected: true,
  },
  {
    type: 'LETTRE_MISSION',
    label: 'Lettre de Mission CIF',
    description: 'Contrat de prestation, type de mission, honoraires',
    obligatoire: true,
    selected: true,
  },
  {
    type: 'DECLARATION_ADEQUATION',
    label: 'Déclaration d\'Adéquation',
    description: 'Justification du conseil et préconisations',
    obligatoire: true,
    selected: true,
  },
  {
    type: 'CONVENTION_RTO',
    label: 'Convention RTO',
    description: 'Convention de réception-transmission d\'ordres',
    obligatoire: false,
    selected: false,
  },
  {
    type: 'RAPPORT_IAS',
    label: 'Rapport Conseil IAS',
    description: 'Rapport pour les produits d\'assurance',
    obligatoire: false,
    selected: false,
  },
];
