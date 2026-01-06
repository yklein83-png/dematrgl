/**
 * Utilitaire de calcul de complétion des documents
 * Proposition A: Le parcours client comme source unique alimentant tous les documents
 *
 * COUVERTURE COMPLÈTE: DER, QCC, Profil Risque, Lettre de Mission, Déclaration d'Adéquation
 */

import { ClientFormData, DocumentType } from '../types/client';

// ==========================================
// DÉFINITION DES CHAMPS REQUIS PAR DOCUMENT
// ==========================================

export interface DocumentFieldRequirements {
  documentType: DocumentType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  requiredFields: FieldRequirement[];
  optionalFields?: FieldRequirement[];
}

export interface FieldRequirement {
  path: string;           // Chemin dans ClientFormData (ex: 'titulaire1.nom')
  label: string;          // Label lisible
  section: string;        // Section du parcours où se trouve ce champ
  weight?: number;        // Poids du champ (1 par défaut)
  validator?: (value: any, data: ClientFormData) => boolean; // Validation personnalisée
}

export interface DocumentCompletionResult {
  documentType: DocumentType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  completionPercentage: number;
  filledFields: number;
  totalFields: number;
  missingFields: FieldRequirement[];
  isReady: boolean; // >= 80% de complétion
}

// ==========================================
// CHAMPS REQUIS POUR CHAQUE DOCUMENT
// ==========================================

/**
 * DER - Document d'Entrée en Relation
 * Champs: identité de base du client + métadonnées
 */
const DER_REQUIREMENTS: DocumentFieldRequirements = {
  documentType: 'DER',
  label: 'Document d\'Entrée en Relation',
  shortLabel: 'DER',
  description: 'Présentation du cabinet et informations client de base',
  color: '#2196F3', // Bleu
  requiredFields: [
    { path: 'titulaire1.civilite', label: 'Civilité', section: 'Identité' },
    { path: 'titulaire1.nom', label: 'Nom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.prenom', label: 'Prénom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.email', label: 'Email', section: 'Identité' },
    { path: 'titulaire1.adresse', label: 'Adresse', section: 'Identité' },
    { path: 'titulaire1.telephone', label: 'Téléphone', section: 'Identité' },
    // Date de remise du DER (distincte de la date de signature de la Lettre de Mission)
    { path: 'contexteMission.dateRemiseDER', label: 'Date de remise du DER', section: 'Mission' },
    { path: 'contexteMission.lieuSignature', label: 'Lieu de signature', section: 'Mission' },
  ],
};

/**
 * QCC - Questionnaire Connaissance Client
 * Champs requis: identité COMPLÈTE, situation familiale, financière, origine des fonds,
 * patrimoine détaillé, KYC complet
 */
const QCC_REQUIREMENTS: DocumentFieldRequirements = {
  documentType: 'QCC',
  label: 'Questionnaire Connaissance Client',
  shortLabel: 'QCC',
  description: 'Identité, situation familiale, patrimoine, origine des fonds, KYC',
  color: '#4CAF50', // Vert
  requiredFields: [
    // === IDENTITÉ COMPLÈTE ===
    { path: 'titulaire1.civilite', label: 'Civilité', section: 'Identité' },
    { path: 'titulaire1.nom', label: 'Nom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.prenom', label: 'Prénom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.dateNaissance', label: 'Date de naissance', section: 'Identité', weight: 2 },
    { path: 'titulaire1.lieuNaissance', label: 'Lieu de naissance', section: 'Identité' },
    { path: 'titulaire1.paysNaissance', label: 'Pays de naissance', section: 'Identité' },
    { path: 'titulaire1.nationalite', label: 'Nationalité', section: 'Identité' },
    { path: 'titulaire1.adresse', label: 'Adresse', section: 'Identité' },
    { path: 'titulaire1.codePostal', label: 'Code postal', section: 'Identité' },
    { path: 'titulaire1.ville', label: 'Ville', section: 'Identité' },
    { path: 'titulaire1.telephone', label: 'Téléphone', section: 'Identité' },
    { path: 'titulaire1.email', label: 'Email', section: 'Identité' },
    { path: 'titulaire1.residenceFiscale', label: 'Résidence fiscale', section: 'Identité' },
    { path: 'titulaire1.situationProfessionnelle', label: 'Situation professionnelle', section: 'Identité' },
    { path: 'titulaire1.profession', label: 'Profession', section: 'Identité' },
    // FATCA
    {
      path: 'titulaire1.usPerson',
      label: 'US Person (FATCA)',
      section: 'Identité',
      validator: (value) => value === true || value === false, // Doit être explicitement défini
    },

    // === SITUATION FAMILIALE ===
    { path: 'situationFamiliale.situation', label: 'Situation familiale', section: 'Famille', weight: 2 },
    { path: 'situationFamiliale.nombreEnfants', label: 'Nombre d\'enfants', section: 'Famille' },
    { path: 'situationFamiliale.nombreEnfantsACharge', label: 'Enfants à charge', section: 'Famille' },
    // Conditionnels si marié/pacsé (gérés différemment)

    // === SITUATION FINANCIÈRE ===
    { path: 'situationFinanciere.revenusAnnuelsFoyer', label: 'Revenus annuels du foyer', section: 'Finances', weight: 2 },
    { path: 'situationFinanciere.patrimoineGlobal', label: 'Patrimoine global', section: 'Finances', weight: 2 },
    { path: 'situationFinanciere.capaciteEpargneMensuelle', label: 'Capacité d\'épargne mensuelle', section: 'Finances' },
    { path: 'situationFinanciere.patrimoineFinancierPourcent', label: 'Répartition patrimoine financier (%)', section: 'Finances' },
    { path: 'situationFinanciere.patrimoineImmobilierPourcent', label: 'Répartition patrimoine immobilier (%)', section: 'Finances' },
    {
      path: 'situationFinanciere.impotRevenu',
      label: 'Assujetti IR',
      section: 'Finances',
      validator: (value) => value === true || value === false,
    },

    // === ORIGINE DES FONDS (LCB-FT) - CRITIQUE ===
    { path: 'origineFonds.nature', label: 'Nature des fonds', section: 'Origine Fonds', weight: 2 },
    { path: 'origineFonds.montantPrevu', label: 'Montant prévu à investir', section: 'Origine Fonds' },
    // Au moins une origine doit être cochée
    {
      path: 'origineFonds.origineRevenus',
      label: 'Origine économique des fonds',
      section: 'Origine Fonds',
      weight: 2,
      validator: (_, data) => {
        const of = data.origineFonds;
        return of?.origineRevenus || of?.origineEpargne || of?.origineHeritage ||
               of?.origineCessionPro || of?.origineCessionImmo || of?.origineCessionMobiliere ||
               of?.origineGainsJeu || of?.origineAssuranceVie || Boolean(of?.origineAutres);
      }
    },
    { path: 'origineFonds.etablissementBancaireOrigine', label: 'Établissement bancaire d\'origine', section: 'Origine Fonds' },

    // === PATRIMOINE DÉTAILLÉ ===
    // Au moins un actif financier OU un patrimoine global renseigné
    {
      path: 'patrimoine.actifsFinanciers',
      label: 'Actifs financiers détaillés',
      section: 'Patrimoine',
      weight: 2,
      validator: (value, data) => {
        // Soit on a des actifs détaillés, soit on a renseigné le patrimoine global
        const hasActifs = Array.isArray(value) && value.length > 0 && value.some(a => a.designation && a.valeur > 0);
        const hasPatrimoineGlobal = data.situationFinanciere?.patrimoineGlobal && data.situationFinanciere.patrimoineGlobal !== '<100000';
        return hasActifs || hasPatrimoineGlobal;
      }
    },
    {
      path: 'patrimoine.actifsImmobiliers',
      label: 'Actifs immobiliers détaillés',
      section: 'Patrimoine',
      validator: (value, data) => {
        // Soit on a des actifs détaillés, soit le % immobilier est 0
        const hasActifs = Array.isArray(value) && value.length > 0;
        const hasNoImmo = !data.situationFinanciere?.patrimoineImmobilierPourcent || data.situationFinanciere.patrimoineImmobilierPourcent === 0;
        return hasActifs || hasNoImmo;
      }
    },

    // === KYC - CONNAISSANCE CLIENT ===
    {
      path: 'kyc.formationFinanciere',
      label: 'Formation financière déclarée',
      section: 'KYC',
      validator: (value) => value === true || value === false,
    },
    // Au moins une source d'information
    {
      path: 'kyc.sourcesPresse',
      label: 'Sources d\'information financière',
      section: 'KYC',
      validator: (_, data) => {
        const kyc = data.kyc;
        return kyc?.sourcesPresse || kyc?.sourcesInternet || kyc?.sourcesConseiller ||
               kyc?.sourcesBanque || kyc?.sourcesEntourage || kyc?.sourcesReseauxSociaux;
      }
    },
    // Connaissance d'au moins un instrument
    {
      path: 'kyc.connaissanceInstruments',
      label: 'Connaissance des instruments financiers',
      section: 'KYC',
      weight: 2,
      validator: (value) => {
        if (!value || typeof value !== 'object') return false;
        const instruments = Object.values(value);
        return instruments.some((inst: any) => inst?.niveau && inst.niveau !== 'aucune');
      }
    },
  ],
};

/**
 * PROFIL_RISQUE - Profil de Risque
 * Champs requis: objectifs, horizon, tolérance au risque, KYC produits, ESG
 */
const PROFIL_RISQUE_REQUIREMENTS: DocumentFieldRequirements = {
  documentType: 'PROFIL_RISQUE',
  label: 'Profil de Risque',
  shortLabel: 'Profil',
  description: 'Objectifs, tolérance au risque, connaissance des produits, préférences ESG',
  color: '#FF9800', // Orange
  requiredFields: [
    // Identité de base (pour le document)
    { path: 'titulaire1.nom', label: 'Nom', section: 'Identité' },
    { path: 'titulaire1.prenom', label: 'Prénom', section: 'Identité' },
    { path: 'titulaire1.dateNaissance', label: 'Date de naissance', section: 'Identité' },

    // === PROFIL DE RISQUE - CRITÈRES OBLIGATOIRES ===
    { path: 'profilRisque.horizonPlacement', label: 'Horizon de placement', section: 'Profil Risque', weight: 3 },
    { path: 'profilRisque.objectifPrincipal', label: 'Objectif principal', section: 'Profil Risque', weight: 3 },
    { path: 'profilRisque.tolerancePerte', label: 'Tolérance aux pertes (%)', section: 'Profil Risque', weight: 3 },
    { path: 'profilRisque.reactionBaisse', label: 'Réaction en cas de baisse', section: 'Profil Risque', weight: 2 },
    { path: 'profilRisque.partRisquee', label: 'Part risquée acceptable (%)', section: 'Profil Risque', weight: 2 },
    { path: 'profilRisque.importanceGarantieCapital', label: 'Importance garantie capital', section: 'Profil Risque' },

    // Au moins un objectif spécifique sélectionné
    {
      path: 'profilRisque.objectifRetraite',
      label: 'Objectifs spécifiques',
      section: 'Profil Risque',
      weight: 2,
      validator: (_, data) => {
        const pr = data.profilRisque;
        return pr?.objectifRetraite || pr?.objectifTransmission || pr?.objectifProjetVie ||
               pr?.objectifRevenuComplementaire || pr?.objectifOptimisationFiscale || pr?.objectifEpargneSecurite;
      }
    },

    // === KYC - Compréhension des risques ===
    {
      path: 'kyc.comprendRisquePerte',
      label: 'Compréhension risque de perte',
      section: 'KYC',
      validator: (value) => value === true || value === false,
    },
    {
      path: 'kyc.comprendRisqueLiquidite',
      label: 'Compréhension risque de liquidité',
      section: 'KYC',
      validator: (value) => value === true || value === false,
    },

    // === ESG ===
    {
      path: 'durabilite.interesseESG',
      label: 'Intérêt pour l\'ESG',
      section: 'ESG',
      validator: (value) => value === true || value === false,
    },
  ],
  optionalFields: [
    { path: 'durabilite.niveauPreference', label: 'Niveau préférence ESG', section: 'ESG' },
    { path: 'durabilite.importanceEnvironnement', label: 'Importance environnement', section: 'ESG' },
    { path: 'durabilite.importanceSocial', label: 'Importance social', section: 'ESG' },
    { path: 'durabilite.importanceGouvernance', label: 'Importance gouvernance', section: 'ESG' },
    { path: 'durabilite.alignementTaxonomieMin', label: 'Alignement taxonomie minimum', section: 'ESG' },
  ],
};

/**
 * LETTRE_MISSION - Lettre de Mission CIF
 * Champs requis: contexte mission, type prestation, instruments, honoraires
 */
const LETTRE_MISSION_REQUIREMENTS: DocumentFieldRequirements = {
  documentType: 'LETTRE_MISSION',
  label: 'Lettre de Mission CIF',
  shortLabel: 'Mission',
  description: 'Contrat de prestation, type de mission, périmètre, honoraires',
  color: '#9C27B0', // Violet
  requiredFields: [
    // Identité client
    { path: 'titulaire1.nom', label: 'Nom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.prenom', label: 'Prénom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.adresse', label: 'Adresse', section: 'Identité' },
    { path: 'titulaire1.email', label: 'Email', section: 'Identité' },

    // Situation financière (contexte)
    { path: 'situationFinanciere.patrimoineGlobal', label: 'Patrimoine global', section: 'Finances' },
    { path: 'situationFinanciere.revenusAnnuelsFoyer', label: 'Revenus annuels', section: 'Finances' },

    // Profil de risque (pour adapter la mission)
    { path: 'profilRisque.horizonPlacement', label: 'Horizon de placement', section: 'Profil Risque' },
    { path: 'profilRisque.objectifPrincipal', label: 'Objectif principal', section: 'Profil Risque' },
    { path: 'profilRisque.tolerancePerte', label: 'Tolérance aux pertes', section: 'Profil Risque' },

    // === CONTEXTE MISSION ===
    { path: 'contexteMission.typePrestation', label: 'Type de prestation', section: 'Mission', weight: 3 },
    { path: 'contexteMission.modeConseil', label: 'Mode de conseil (indépendant/non)', section: 'Mission', weight: 2 },
    {
      path: 'contexteMission.instrumentsSouhaites',
      label: 'Instruments financiers envisagés',
      section: 'Mission',
      weight: 2,
      validator: (value) => Array.isArray(value) && value.length > 0,
    },
    { path: 'contexteMission.remunerationMode', label: 'Mode de rémunération', section: 'Mission', weight: 2 },
    { path: 'contexteMission.frequenceSuivi', label: 'Fréquence de suivi', section: 'Mission' },

    // Référence au DER (mentionné dans la lettre : "DER remis en date du...")
    { path: 'contexteMission.dateRemiseDER', label: 'Date de remise du DER', section: 'Mission' },

    // Signatures de la Lettre de Mission
    { path: 'contexteMission.dateSignature', label: 'Date de signature de la mission', section: 'Mission' },
    { path: 'contexteMission.lieuSignature', label: 'Lieu de signature', section: 'Mission' },

    // ESG (pour mention dans la lettre)
    {
      path: 'durabilite.interesseESG',
      label: 'Intérêt ESG mentionné',
      section: 'ESG',
      validator: (value) => value === true || value === false,
    },
  ],
};

/**
 * DECLARATION_ADEQUATION - Déclaration d'Adéquation
 * Champs requis: synthèse profil, justification, produits recommandés
 */
const DECLARATION_ADEQUATION_REQUIREMENTS: DocumentFieldRequirements = {
  documentType: 'DECLARATION_ADEQUATION',
  label: 'Déclaration d\'Adéquation',
  shortLabel: 'Adéquation',
  description: 'Justification du conseil et préconisations personnalisées',
  color: '#E91E63', // Rose
  requiredFields: [
    // Identité
    { path: 'titulaire1.nom', label: 'Nom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.prenom', label: 'Prénom', section: 'Identité', weight: 2 },
    { path: 'titulaire1.dateNaissance', label: 'Date de naissance', section: 'Identité' },

    // === SYNTHÈSE PROFIL (pour justification) ===
    // KYC
    {
      path: 'kyc.connaissanceInstruments',
      label: 'Expérience investissement',
      section: 'KYC',
      weight: 2,
      validator: (value) => {
        if (!value || typeof value !== 'object') return false;
        return Object.keys(value).length > 0;
      }
    },
    {
      path: 'kyc.comprendRisquePerte',
      label: 'Compréhension des risques',
      section: 'KYC',
      validator: (value) => value === true || value === false,
    },

    // Profil risque
    { path: 'profilRisque.horizonPlacement', label: 'Horizon de placement', section: 'Profil Risque', weight: 2 },
    { path: 'profilRisque.objectifPrincipal', label: 'Objectif principal', section: 'Profil Risque', weight: 2 },
    { path: 'profilRisque.tolerancePerte', label: 'Tolérance aux pertes', section: 'Profil Risque', weight: 2 },
    { path: 'profilRisque.profilValide', label: 'Profil de risque calculé', section: 'Profil Risque', weight: 3 },

    // Situation financière
    { path: 'situationFinanciere.patrimoineGlobal', label: 'Patrimoine global', section: 'Finances', weight: 2 },
    { path: 'situationFinanciere.capaciteEpargneMensuelle', label: 'Capacité d\'épargne', section: 'Finances' },

    // ESG
    {
      path: 'durabilite.interesseESG',
      label: 'Préférences ESG',
      section: 'ESG',
      validator: (value) => value === true || value === false,
    },

    // Contexte mission
    { path: 'contexteMission.typePrestation', label: 'Type de prestation', section: 'Mission' },
    {
      path: 'contexteMission.instrumentsSouhaites',
      label: 'Instruments conseillés',
      section: 'Mission',
      validator: (value) => Array.isArray(value) && value.length > 0,
    },

    // Signatures
    { path: 'contexteMission.dateSignature', label: 'Date', section: 'Mission' },
  ],
};

/**
 * Liste de tous les documents avec leurs requirements
 */
export const DOCUMENT_REQUIREMENTS: DocumentFieldRequirements[] = [
  DER_REQUIREMENTS,
  QCC_REQUIREMENTS,
  PROFIL_RISQUE_REQUIREMENTS,
  LETTRE_MISSION_REQUIREMENTS,
  DECLARATION_ADEQUATION_REQUIREMENTS,
];

// ==========================================
// FONCTIONS DE CALCUL
// ==========================================

/**
 * Récupère une valeur imbriquée dans un objet via un chemin
 * Ex: getNestedValue(data, 'titulaire1.nom') => data.titulaire1.nom
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Vérifie si une valeur est considérée comme "remplie"
 */
function isFieldFilled(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'boolean') return true; // Un booléen est toujours une réponse
  if (value instanceof Date) return !isNaN(value.getTime());
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

/**
 * Calcule la complétion d'un document
 */
export function calculateDocumentCompletion(
  data: ClientFormData,
  requirements: DocumentFieldRequirements
): DocumentCompletionResult {
  let totalWeight = 0;
  let filledWeight = 0;
  const missingFields: FieldRequirement[] = [];

  for (const field of requirements.requiredFields) {
    const weight = field.weight || 1;
    totalWeight += weight;

    let isFilled = false;

    if (field.validator) {
      // Utiliser le validateur personnalisé
      isFilled = field.validator(getNestedValue(data, field.path), data);
    } else {
      // Vérification standard
      const value = getNestedValue(data, field.path);
      isFilled = isFieldFilled(value);
    }

    if (isFilled) {
      filledWeight += weight;
    } else {
      missingFields.push(field);
    }
  }

  const completionPercentage = totalWeight > 0
    ? Math.round((filledWeight / totalWeight) * 100)
    : 0;

  return {
    documentType: requirements.documentType,
    label: requirements.label,
    shortLabel: requirements.shortLabel,
    description: requirements.description,
    color: requirements.color,
    completionPercentage,
    filledFields: requirements.requiredFields.length - missingFields.length,
    totalFields: requirements.requiredFields.length,
    missingFields,
    isReady: completionPercentage >= 80,
  };
}

/**
 * Calcule la complétion de tous les documents
 */
export function calculateAllDocumentsCompletion(
  data: ClientFormData
): DocumentCompletionResult[] {
  return DOCUMENT_REQUIREMENTS.map(req => calculateDocumentCompletion(data, req));
}

/**
 * Retourne les documents prêts à être générés
 */
export function getReadyDocuments(data: ClientFormData): DocumentCompletionResult[] {
  return calculateAllDocumentsCompletion(data).filter(doc => doc.isReady);
}

/**
 * Retourne les champs manquants groupés par section
 */
export function getMissingFieldsBySection(
  results: DocumentCompletionResult[]
): Record<string, FieldRequirement[]> {
  const bySection: Record<string, FieldRequirement[]> = {};

  for (const result of results) {
    for (const field of result.missingFields) {
      if (!bySection[field.section]) {
        bySection[field.section] = [];
      }
      // Éviter les doublons
      if (!bySection[field.section].some(f => f.path === field.path)) {
        bySection[field.section].push(field);
      }
    }
  }

  return bySection;
}

/**
 * Calcule le score global de complétion du parcours
 */
export function calculateOverallCompletion(data: ClientFormData): number {
  const results = calculateAllDocumentsCompletion(data);
  const totalPercentage = results.reduce((sum, r) => sum + r.completionPercentage, 0);
  return Math.round(totalPercentage / results.length);
}

/**
 * Retourne un résumé de l'état de complétion
 */
export function getCompletionSummary(data: ClientFormData): {
  overall: number;
  documentsReady: number;
  documentsTotal: number;
  readyList: DocumentType[];
  missingList: DocumentType[];
} {
  const results = calculateAllDocumentsCompletion(data);
  const ready = results.filter(r => r.isReady);

  return {
    overall: calculateOverallCompletion(data),
    documentsReady: ready.length,
    documentsTotal: results.length,
    readyList: ready.map(r => r.documentType),
    missingList: results.filter(r => !r.isReady).map(r => r.documentType),
  };
}
