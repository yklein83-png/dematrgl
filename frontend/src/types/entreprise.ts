/**
 * Types pour l'entité Entreprise (cabinet)
 * Configuration centralisée des informations du cabinet
 */

export interface Entreprise {
  id: string;
  // Identification
  nom: string;
  forme_juridique?: string;
  capital?: string;
  // Adresse
  adresse?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  // Immatriculations
  numero_rcs?: string;
  ville_rcs?: string;
  numero_orias?: string;
  siret?: string;
  siren?: string;
  code_ape?: string;
  numero_tva?: string;
  // CIF
  association_cif?: string;
  numero_cif?: string;
  // Assurance RCP
  assureur_rcp?: string;
  numero_contrat_rcp?: string;
  // Representant legal
  representant_civilite?: string;
  representant_nom?: string;
  representant_prenom?: string;
  representant_qualite?: string;
  // Contact
  telephone?: string;
  email?: string;
  site_web?: string;
  // Mediateur
  mediateur_nom?: string;
  mediateur_adresse?: string;
  mediateur_email?: string;
  mediateur_site_web?: string;
  // Metadonnees
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntrepriseFormData {
  // Identification
  nom: string;
  forme_juridique?: string;
  capital?: string;
  // Adresse
  adresse?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  // Immatriculations
  numero_rcs?: string;
  ville_rcs?: string;
  numero_orias?: string;
  siret?: string;
  siren?: string;
  code_ape?: string;
  numero_tva?: string;
  // CIF
  association_cif?: string;
  numero_cif?: string;
  // Assurance RCP
  assureur_rcp?: string;
  numero_contrat_rcp?: string;
  // Representant legal
  representant_civilite?: string;
  representant_nom?: string;
  representant_prenom?: string;
  representant_qualite?: string;
  // Contact
  telephone?: string;
  email?: string;
  site_web?: string;
  // Mediateur
  mediateur_nom?: string;
  mediateur_adresse?: string;
  mediateur_email?: string;
  mediateur_site_web?: string;
}

export const defaultEntrepriseFormData: EntrepriseFormData = {
  nom: '',
  forme_juridique: '',
  capital: '',
  adresse: '',
  code_postal: '',
  ville: '',
  pays: 'France',
  numero_rcs: '',
  ville_rcs: '',
  numero_orias: '',
  siret: '',
  siren: '',
  code_ape: '',
  numero_tva: '',
  association_cif: '',
  numero_cif: '',
  assureur_rcp: '',
  numero_contrat_rcp: '',
  representant_civilite: 'M.',
  representant_nom: '',
  representant_prenom: '',
  representant_qualite: '',
  telephone: '',
  email: '',
  site_web: '',
  mediateur_nom: '',
  mediateur_adresse: '',
  mediateur_email: '',
  mediateur_site_web: '',
};
