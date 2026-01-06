/**
 * Types TypeScript pour l'application
 * Correspond aux modèles backend
 */

// ==========================================
// COMMON TYPES (pour éliminer les `any`)
// ==========================================

/** Structure d'un enfant dans la famille */
export interface Enfant {
  prenom: string;
  date_naissance?: string;
  a_charge: boolean;
  handicap?: boolean;
  observations?: string;
}

/** Structure d'un bien du patrimoine financier */
export interface PatrimoineFinancierItem {
  type: 'compte_courant' | 'livret' | 'assurance_vie' | 'pea' | 'compte_titres' | 'per' | 'autre';
  etablissement: string;
  description?: string;
  montant: number;
  titulaire?: 't1' | 't2' | 'commun';
}

/** Structure d'un bien immobilier */
export interface PatrimoineImmobilierItem {
  type: 'residence_principale' | 'residence_secondaire' | 'locatif' | 'terrain' | 'autre';
  description: string;
  valeur_estimee: number;
  credit_restant?: number;
  revenus_locatifs?: number;
  titulaire?: 't1' | 't2' | 'commun';
}

/** Structure d'un bien professionnel */
export interface PatrimoineProfessionnelItem {
  denomination: string;
  forme_juridique?: string;
  participation_pourcent: number;
  valeur_estimee: number;
  fonction?: string;
}

/** Critères de durabilité ESG */
export interface DurabiliteCriteres {
  environnement: boolean;
  social: boolean;
  gouvernance: boolean;
  exclusions?: string[];
  preferences_secteurs?: string[];
}

/** Justificatifs LCB-FT */
export interface LcbFtJustificatifs {
  piece_identite: boolean;
  justificatif_domicile: boolean;
  justificatif_revenus: boolean;
  origine_fonds: boolean;
  autres?: string[];
  date_verification?: string;
}

/** Détails d'un produit financier */
export interface ProduitDetails {
  numero_contrat?: string;
  supports?: string[];
  frais_gestion?: number;
  frais_entree?: number;
  beneficiaires?: string;
  clause_beneficiaire?: string;
  options?: string[];
}

/** Métadonnées d'un document */
export interface DocumentMetadata {
  version?: number;
  template_utilisé?: string;
  parametres_generation?: Record<string, unknown>;
  commentaires?: string;
}

/** Règle de validation de formulaire */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'custom';
  value?: string | number | RegExp;
  message: string;
}

/** Erreur API avec détails */
export interface ApiErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// ==========================================
// USER TYPES
// ==========================================

export enum UserRole {
  ADMIN = 'admin',
  CONSEILLER = 'conseiller'
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  role: UserRole;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserCreate {
  email: string;
  nom: string;
  prenom: string;
  mot_de_passe: string;
  role: UserRole;
  actif: boolean;
}

export interface UserUpdate {
  email?: string;
  nom?: string;
  prenom?: string;
  role?: UserRole;
  actif?: boolean;
}

export interface PasswordUpdate {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

// ==========================================
// CLIENT TYPES (120+ champs)
// ==========================================

export enum ClientStatut {
  PROSPECT = 'prospect',
  CLIENT_ACTIF = 'client_actif',
  CLIENT_INACTIF = 'client_inactif'
}

export enum Civilite {
  MONSIEUR = 'Monsieur',
  MADAME = 'Madame'
}

export enum SituationFamiliale {
  CELIBATAIRE = 'Célibataire',
  MARIE = 'Marié(e)',
  PACSE = 'Pacsé(e)',
  VEUF = 'Veuf(ve)',
  DIVORCE = 'Divorcé(e)',
  UNION_LIBRE = 'Union libre'
}

export interface Client {
  // Identifiants
  id: string;
  numero_client: string;
  statut: ClientStatut;
  
  // Titulaire 1
  t1_civilite: Civilite;
  t1_nom: string;
  t1_nom_jeune_fille?: string;
  t1_prenom: string;
  t1_date_naissance: string;
  t1_lieu_naissance: string;
  t1_nationalite: string;
  t1_adresse: string;
  t1_email: string;
  t1_telephone: string;
  t1_us_person: boolean;
  t1_regime_protection_juridique: boolean;
  t1_regime_protection_forme?: string;
  t1_representant_legal?: string;
  t1_residence_fiscale: string;
  t1_residence_fiscale_autre?: string;
  t1_profession: string;
  t1_retraite_depuis?: string;
  t1_chomage_depuis?: string;
  t1_ancienne_profession?: string;
  t1_chef_entreprise: boolean;
  t1_entreprise_denomination?: string;
  t1_entreprise_forme_juridique?: string;
  t1_entreprise_siege_social?: string;
  
  // Titulaire 2
  t2_civilite?: Civilite;
  t2_nom?: string;
  t2_nom_jeune_fille?: string;
  t2_prenom?: string;
  t2_date_naissance?: string;
  t2_lieu_naissance?: string;
  t2_nationalite?: string;
  t2_adresse?: string;
  t2_email?: string;
  t2_telephone?: string;
  t2_us_person: boolean;
  t2_regime_protection_juridique: boolean;
  t2_regime_protection_forme?: string;
  t2_representant_legal?: string;
  t2_residence_fiscale?: string;
  t2_residence_fiscale_autre?: string;
  t2_profession?: string;
  t2_retraite_depuis?: string;
  t2_chomage_depuis?: string;
  t2_ancienne_profession?: string;
  t2_chef_entreprise: boolean;
  t2_entreprise_denomination?: string;
  t2_entreprise_forme_juridique?: string;
  t2_entreprise_siege_social?: string;
  
  // Situation familiale
  situation_familiale: SituationFamiliale;
  date_mariage?: string;
  contrat_mariage: boolean;
  regime_matrimonial?: string;
  date_pacs?: string;
  convention_pacs: boolean;
  regime_pacs?: string;
  date_divorce?: string;
  donation_entre_epoux: boolean;
  donation_entre_epoux_date?: string;
  donation_entre_epoux_montant?: number;
  donation_enfants: boolean;
  donation_enfants_date?: string;
  donation_enfants_montant?: number;
  nombre_enfants: number;
  nombre_enfants_charge: number;
  enfants?: Enfant[];
  
  // Situation financière
  revenus_annuels_foyer: string;
  patrimoine_global: string;
  charges_annuelles_pourcent?: number;
  charges_annuelles_montant?: number;
  capacite_epargne_mensuelle?: number;
  impot_revenu: boolean;
  impot_fortune_immobiliere: boolean;
  patrimoine_financier_pourcent?: number;
  patrimoine_immobilier_pourcent?: number;
  patrimoine_professionnel_pourcent?: number;
  patrimoine_autres_pourcent?: number;
  
  // Origine des fonds
  origine_fonds_nature: string;
  origine_fonds_montant_prevu?: number;
  origine_economique_revenus: boolean;
  origine_economique_epargne: boolean;
  origine_economique_heritage: boolean;
  origine_economique_cession_pro: boolean;
  origine_economique_cession_immo: boolean;
  origine_economique_cession_mobiliere: boolean;
  origine_economique_gains_jeu: boolean;
  origine_economique_assurance_vie: boolean;
  origine_economique_autres?: string;
  origine_fonds_provenance_etablissement?: string;
  
  // Patrimoine détaillé (JSONB)
  patrimoine_financier?: PatrimoineFinancierItem[];
  patrimoine_immobilier?: PatrimoineImmobilierItem[];
  patrimoine_professionnel?: PatrimoineProfessionnelItem[];
  
  // KYC - Connaissance produits (échantillon)
  kyc_monetaires_detention: boolean;
  kyc_monetaires_operations?: string;
  kyc_monetaires_duree?: string;
  kyc_monetaires_volume?: string;
  kyc_monetaires_q1?: string;
  kyc_monetaires_q2?: string;
  
  kyc_obligations_detention: boolean;
  kyc_obligations_operations?: string;
  kyc_obligations_duree?: string;
  kyc_obligations_volume?: string;
  
  kyc_actions_detention: boolean;
  kyc_actions_operations?: string;
  
  kyc_scpi_detention: boolean;
  kyc_scpi_operations?: string;
  
  kyc_private_equity_detention: boolean;
  kyc_etf_detention: boolean;
  kyc_derives_detention: boolean;
  kyc_structures_detention: boolean;
  
  // KYC - Gestion portefeuille
  kyc_portefeuille_mandat: boolean;
  kyc_portefeuille_gestion_personnelle: boolean;
  kyc_portefeuille_gestion_conseiller: boolean;
  kyc_portefeuille_experience_pro: boolean;
  
  // KYC - Culture financière
  kyc_culture_presse_financiere: boolean;
  kyc_culture_suivi_bourse: boolean;
  kyc_culture_releves_bancaires: boolean;
  
  // Profil de risque
  objectifs_investissement: string;
  horizon_placement: string;
  tolerance_risque: string;
  pertes_maximales_acceptables: string;
  experience_perte: boolean;
  experience_perte_niveau?: string;
  reaction_perte?: string;
  reaction_gain?: string;
  liquidite_importante: boolean;
  pourcentage_patrimoine_investi?: string;
  
  // Durabilité
  durabilite_souhait: boolean;
  durabilite_taxonomie_pourcent?: string;
  durabilite_investissements_pourcent?: string;
  durabilite_impact_selection: boolean;
  durabilite_criteres?: DurabiliteCriteres;
  
  // LCB-FT
  lcb_ft_niveau_risque?: string;
  lcb_ft_ppe: boolean;
  lcb_ft_ppe_fonction?: string;
  lcb_ft_ppe_famille: boolean;
  lcb_ft_gel_avoirs_verifie: boolean;
  lcb_ft_gel_avoirs_date_verification?: string;
  lcb_ft_justificatifs?: LcbFtJustificatifs;
  
  // Métadonnées
  conseiller_id: string;
  profil_risque_calcule?: string;
  profil_risque_score?: number;
  profil_risque_date_calcul?: string;
  created_at: string;
  updated_at: string;
  validated_at?: string;
  validated_by?: string;
  
  // Propriétés calculées
  nom_complet_t1: string;
  nom_complet_t2?: string;
  has_titulaire_2: boolean;
  is_validated: boolean;
  is_us_person: boolean;
  is_ppe: boolean;
  
  // Relations
  conseiller?: User;
  produits?: Produit[];
  documents?: Document[];
}

export type ClientCreate = Omit<Client, 
  'id' | 'numero_client' | 'conseiller_id' | 'profil_risque_calcule' | 
  'profil_risque_score' | 'profil_risque_date_calcul' | 'created_at' | 
  'updated_at' | 'validated_at' | 'validated_by' | 'nom_complet_t1' | 
  'nom_complet_t2' | 'has_titulaire_2' | 'is_validated' | 'is_us_person' | 
  'is_ppe' | 'conseiller' | 'produits' | 'documents'
>;

export type ClientUpdate = Partial<ClientCreate>;

export interface ClientListResponse {
  total: number;
  page: number;
  per_page: number;
  clients: Client[];
}

// ==========================================
// DOCUMENT TYPES
// ==========================================

export enum TypeDocument {
  DER = 'DER',
  KYC = 'KYC',
  LETTRE_MISSION_CIF = 'LETTRE_MISSION_CIF',
  LETTRE_MISSION_IAS = 'LETTRE_MISSION_IAS',
  DECLARATION_ADEQUATION_CIF = 'DECLARATION_ADEQUATION_CIF',
  RAPPORT_CONSEIL_IAS = 'RAPPORT_CONSEIL_IAS',
  CONVENTION_RTO = 'CONVENTION_RTO',
  PROCEDURE_RELATION_CLIENT = 'PROCEDURE_RELATION_CLIENT',
  EXPORT_CSV = 'EXPORT_CSV',
  AUTRE = 'AUTRE'
}

export interface Document {
  id: string;
  client_id: string;
  type_document: TypeDocument;
  nom_fichier: string;
  chemin_fichier: string;
  taille_octets?: number;
  hash_fichier?: string;
  genere_par?: string;
  date_generation: string;
  date_signature?: string;
  signe: boolean;
  metadata?: DocumentMetadata;
  created_at: string;
  is_signed: boolean;
  file_exists: boolean;
  extension: string;
  is_docx: boolean;
  is_csv: boolean;
}

export interface DocumentGenerateRequest {
  client_id: string;
  type_document: TypeDocument;
  include_titulaire_2?: boolean;
  include_patrimoine_detail?: boolean;
  include_produits?: boolean;
  metadata?: DocumentMetadata;
}

export interface DocumentGenerateResponse {
  success: boolean;
  message: string;
  document_id?: string;
  download_url?: string;
  filename?: string;
}

// ==========================================
// PRODUIT TYPES
// ==========================================

export enum TypeProduit {
  ASSURANCE_VIE = 'ASSURANCE_VIE',
  PER = 'PER',
  PEA = 'PEA',
  COMPTE_TITRES = 'COMPTE_TITRES',
  LIVRET = 'LIVRET',
  SCPI = 'SCPI',
  IMMOBILIER = 'IMMOBILIER',
  AUTRE = 'AUTRE'
}

export enum StatutProduit {
  ACTIF = 'ACTIF',
  EN_COURS = 'EN_COURS',
  CLOTURE = 'CLOTURE'
}

export interface Produit {
  id: string;
  client_id: string;
  type_produit: TypeProduit;
  nom_produit: string;
  fournisseur: string;
  montant_investi?: number;
  date_souscription?: string;
  statut: StatutProduit;
  details?: ProduitDetails;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_assurance: boolean;
  is_immobilier: boolean;
}

export interface ProduitCreate {
  client_id: string;
  type_produit: TypeProduit;
  nom_produit: string;
  fournisseur: string;
  montant_investi?: number;
  date_souscription?: string;
  statut: StatutProduit;
  details?: ProduitDetails;
}

export type ProduitUpdate = Partial<Omit<ProduitCreate, 'client_id'>>;

// ==========================================
// FORM TYPES
// ==========================================

export interface FormSection {
  title: string;
  fields: FormField[];
  columns?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helperText?: string;
  validation?: ValidationRule | ValidationRule[];
  dependsOn?: string;
  showIf?: (values: Record<string, unknown>) => boolean;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiError {
  detail: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ==========================================
// FILTER TYPES
// ==========================================

export interface ClientFilters {
  search?: string;
  statut?: ClientStatut;
  conseiller_id?: string;
  only_validated?: boolean;
  profil_risque?: string;
  lcb_ft_niveau?: string;
  date_from?: string;
  date_to?: string;
}

export interface DocumentFilters {
  client_id?: string;
  type_document?: TypeDocument;
  signe_only?: boolean;
  genere_par?: string;
  date_from?: string;
  date_to?: string;
}