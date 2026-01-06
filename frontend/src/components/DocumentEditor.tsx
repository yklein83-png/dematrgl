/**
 * DocumentEditor - Modal d'édition des champs d'un document
 * Affiche UNIQUEMENT les champs requis pour chaque type de document
 * Pré-remplit les champs déjà saisis pour le client
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Checkbox,
  Collapse,
} from '@mui/material';
import {
  Save as SaveIcon,
  Description as GenerateIcon,
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import { DocumentType, DOCUMENTS_DISPONIBLES } from '../types/client';
import { transformFormDataToFlat } from '../utils/formDataTransformer';
import { PhoneInput, FrenchDatePicker, CurrencyInput, PercentInput } from './inputs';

// ============================================
// DÉFINITION DES CHAMPS PAR TYPE DE DOCUMENT
// ============================================

export interface DocumentField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'boolean' | 'textarea' | 'email' | 'tel' | 'currency' | 'percent';
  section: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  suffix?: string;  // Pour currency: "/mois", "/an"
}

// Champs requis pour chaque document - du plus simple au plus complet
// Exporté pour calculer le % de remplissage dans Documents.tsx
export const DOCUMENT_REQUIRED_FIELDS: Record<DocumentType, DocumentField[]> = {
  // DER - Document d'Entrée en Relation : Minimum vital
  DER: [
    { key: 't1_civilite', label: 'Civilité', type: 'select', section: 'Identité', required: true, options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Identité', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Identité', required: true },
    { key: 't1_email', label: 'Email', type: 'email', section: 'Contact', required: true },
    { key: 't1_telephone', label: 'Téléphone', type: 'tel', section: 'Contact' },
    { key: 't1_adresse', label: 'Adresse', type: 'text', section: 'Contact' },
  ],

  // QCC - Questionnaire Connaissance Client : COMPLET avec tous les champs AMF/ACPR
  QCC: [
    // ==================== TITULAIRE 1 - IDENTITÉ ====================
    { key: 't1_civilite', label: 'Civilité', type: 'select', section: 'Titulaire 1 - Identité', required: true, options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Titulaire 1 - Identité', required: true },
    { key: 't1_nom_naissance', label: 'Nom de naissance', type: 'text', section: 'Titulaire 1 - Identité' },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Titulaire 1 - Identité', required: true },
    { key: 't1_date_naissance', label: 'Date de naissance', type: 'date', section: 'Titulaire 1 - Identité', required: true },
    { key: 't1_lieu_naissance', label: 'Lieu de naissance', type: 'text', section: 'Titulaire 1 - Identité', required: true },
    { key: 't1_pays_naissance', label: 'Pays de naissance', type: 'text', section: 'Titulaire 1 - Identité' },
    { key: 't1_nationalite', label: 'Nationalité', type: 'text', section: 'Titulaire 1 - Identité', required: true },
    { key: 't1_autre_nationalite', label: 'Autre nationalité', type: 'text', section: 'Titulaire 1 - Identité' },
    { key: 't1_piece_identite', label: 'Type de pièce d\'identité', type: 'select', section: 'Titulaire 1 - Identité', required: true, options: [
      { value: 'CNI', label: 'Carte nationale d\'identité' },
      { value: 'Passeport', label: 'Passeport' },
      { value: 'Titre de séjour', label: 'Titre de séjour' },
    ]},
    { key: 't1_numero_piece', label: 'Numéro de pièce', type: 'text', section: 'Titulaire 1 - Identité', required: true },
    { key: 't1_date_validite_piece', label: 'Date de validité', type: 'date', section: 'Titulaire 1 - Identité', required: true },

    // ==================== TITULAIRE 1 - CONTACT ====================
    { key: 't1_adresse', label: 'Adresse', type: 'text', section: 'Titulaire 1 - Contact', required: true },
    { key: 't1_code_postal', label: 'Code postal', type: 'text', section: 'Titulaire 1 - Contact', required: true },
    { key: 't1_ville', label: 'Ville', type: 'text', section: 'Titulaire 1 - Contact', required: true },
    { key: 't1_pays_residence', label: 'Pays de résidence', type: 'text', section: 'Titulaire 1 - Contact', required: true },
    { key: 't1_telephone', label: 'Téléphone mobile', type: 'tel', section: 'Titulaire 1 - Contact', required: true },
    { key: 't1_telephone_fixe', label: 'Téléphone fixe', type: 'tel', section: 'Titulaire 1 - Contact' },
    { key: 't1_email', label: 'Email', type: 'email', section: 'Titulaire 1 - Contact', required: true },

    // ==================== TITULAIRE 1 - SITUATION PRO ====================
    { key: 't1_situation_pro', label: 'Situation professionnelle', type: 'select', section: 'Titulaire 1 - Profession', required: true, options: [
      { value: 'Salarié', label: 'Salarié' },
      { value: 'Cadre', label: 'Cadre' },
      { value: 'Cadre supérieur', label: 'Cadre supérieur' },
      { value: 'Chef d\'entreprise', label: 'Chef d\'entreprise' },
      { value: 'Profession libérale', label: 'Profession libérale' },
      { value: 'Fonctionnaire', label: 'Fonctionnaire' },
      { value: 'Retraité', label: 'Retraité' },
      { value: 'Sans activité', label: 'Sans activité' },
    ]},
    { key: 't1_profession', label: 'Profession / Métier', type: 'text', section: 'Titulaire 1 - Profession', required: true },
    { key: 't1_secteur_activite', label: 'Secteur d\'activité', type: 'text', section: 'Titulaire 1 - Profession' },
    { key: 't1_employeur', label: 'Employeur / Entreprise', type: 'text', section: 'Titulaire 1 - Profession' },
    { key: 't1_date_debut_activite', label: 'Date début activité', type: 'date', section: 'Titulaire 1 - Profession' },
    { key: 't1_retraite_depuis', label: 'Retraité depuis', type: 'date', section: 'Titulaire 1 - Profession' },
    { key: 't1_chomage_depuis', label: 'Sans emploi depuis', type: 'date', section: 'Titulaire 1 - Profession' },
    { key: 't1_ancienne_profession', label: 'Ancienne profession', type: 'text', section: 'Titulaire 1 - Profession' },

    // ==================== TITULAIRE 1 - CHEF D'ENTREPRISE ====================
    { key: 't1_chef_entreprise', label: 'Chef d\'entreprise', type: 'boolean', section: 'Titulaire 1 - Entreprise' },
    { key: 't1_entreprise_denomination', label: 'Dénomination sociale', type: 'text', section: 'Titulaire 1 - Entreprise' },
    { key: 't1_entreprise_forme_juridique', label: 'Forme juridique', type: 'select', section: 'Titulaire 1 - Entreprise', options: [
      { value: 'SARL', label: 'SARL' },
      { value: 'SAS', label: 'SAS' },
      { value: 'SA', label: 'SA' },
      { value: 'EURL', label: 'EURL' },
      { value: 'EI', label: 'Entreprise Individuelle' },
      { value: 'SCI', label: 'SCI' },
      { value: 'Autre', label: 'Autre' },
    ]},
    { key: 't1_entreprise_siege_social', label: 'Siège social', type: 'text', section: 'Titulaire 1 - Entreprise' },
    { key: 't1_entreprise_siret', label: 'N° SIRET', type: 'text', section: 'Titulaire 1 - Entreprise' },
    { key: 't1_entreprise_capital', label: 'Capital social (€)', type: 'number', section: 'Titulaire 1 - Entreprise' },
    { key: 't1_entreprise_parts_detenues', label: 'Parts détenues (%)', type: 'number', section: 'Titulaire 1 - Entreprise' },

    // ==================== TITULAIRE 1 - FISCAL ====================
    { key: 't1_residence_fiscale', label: 'Pays de résidence fiscale', type: 'text', section: 'Titulaire 1 - Fiscal', required: true },
    { key: 't1_residence_fiscale_autre', label: 'Autre résidence fiscale', type: 'text', section: 'Titulaire 1 - Fiscal' },
    { key: 't1_nif', label: 'N° d\'identification fiscale (NIF)', type: 'text', section: 'Titulaire 1 - Fiscal' },
    { key: 't1_us_person', label: 'US Person (citoyen ou résident fiscal US)', type: 'boolean', section: 'Titulaire 1 - Fiscal' },
    { key: 't1_tin', label: 'TIN (Tax Identification Number US)', type: 'text', section: 'Titulaire 1 - Fiscal', placeholder: 'Si US Person' },

    // ==================== TITULAIRE 1 - PROTECTION JURIDIQUE ====================
    { key: 't1_regime_protection', label: 'Sous régime de protection', type: 'boolean', section: 'Titulaire 1 - Protection juridique' },
    { key: 't1_regime_protection_type', label: 'Type de protection', type: 'select', section: 'Titulaire 1 - Protection juridique', options: [
      { value: 'Tutelle', label: 'Tutelle' },
      { value: 'Curatelle simple', label: 'Curatelle simple' },
      { value: 'Curatelle renforcée', label: 'Curatelle renforcée' },
      { value: 'Sauvegarde de justice', label: 'Sauvegarde de justice' },
      { value: 'Habilitation familiale', label: 'Habilitation familiale' },
    ]},
    { key: 't1_representant_legal', label: 'Nom du représentant légal', type: 'text', section: 'Titulaire 1 - Protection juridique' },
    { key: 't1_representant_legal_adresse', label: 'Adresse du représentant', type: 'text', section: 'Titulaire 1 - Protection juridique' },

    // ==================== TITULAIRE 2 - IDENTITÉ ====================
    { key: 't2_civilite', label: 'Civilité', type: 'select', section: 'Titulaire 2 - Identité', options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 't2_nom', label: 'Nom', type: 'text', section: 'Titulaire 2 - Identité' },
    { key: 't2_nom_naissance', label: 'Nom de naissance', type: 'text', section: 'Titulaire 2 - Identité' },
    { key: 't2_prenom', label: 'Prénom', type: 'text', section: 'Titulaire 2 - Identité' },
    { key: 't2_date_naissance', label: 'Date de naissance', type: 'date', section: 'Titulaire 2 - Identité' },
    { key: 't2_lieu_naissance', label: 'Lieu de naissance', type: 'text', section: 'Titulaire 2 - Identité' },
    { key: 't2_pays_naissance', label: 'Pays de naissance', type: 'text', section: 'Titulaire 2 - Identité' },
    { key: 't2_nationalite', label: 'Nationalité', type: 'text', section: 'Titulaire 2 - Identité' },

    // ==================== TITULAIRE 2 - CONTACT ====================
    { key: 't2_adresse', label: 'Adresse', type: 'text', section: 'Titulaire 2 - Contact' },
    { key: 't2_code_postal', label: 'Code postal', type: 'text', section: 'Titulaire 2 - Contact' },
    { key: 't2_ville', label: 'Ville', type: 'text', section: 'Titulaire 2 - Contact' },
    { key: 't2_pays_residence', label: 'Pays de résidence', type: 'text', section: 'Titulaire 2 - Contact' },
    { key: 't2_telephone', label: 'Téléphone', type: 'tel', section: 'Titulaire 2 - Contact' },
    { key: 't2_email', label: 'Email', type: 'email', section: 'Titulaire 2 - Contact' },

    // ==================== TITULAIRE 2 - PROFESSION ====================
    { key: 't2_situation_pro', label: 'Situation professionnelle', type: 'select', section: 'Titulaire 2 - Profession', options: [
      { value: 'Salarié', label: 'Salarié' },
      { value: 'Cadre', label: 'Cadre' },
      { value: 'Chef d\'entreprise', label: 'Chef d\'entreprise' },
      { value: 'Profession libérale', label: 'Profession libérale' },
      { value: 'Fonctionnaire', label: 'Fonctionnaire' },
      { value: 'Retraité', label: 'Retraité' },
      { value: 'Sans activité', label: 'Sans activité' },
    ]},
    { key: 't2_profession', label: 'Profession / Métier', type: 'text', section: 'Titulaire 2 - Profession' },
    { key: 't2_secteur_activite', label: 'Secteur d\'activité', type: 'text', section: 'Titulaire 2 - Profession' },
    { key: 't2_employeur', label: 'Employeur', type: 'text', section: 'Titulaire 2 - Profession' },
    { key: 't2_chef_entreprise', label: 'Chef d\'entreprise', type: 'boolean', section: 'Titulaire 2 - Profession' },

    // ==================== TITULAIRE 2 - FISCAL ====================
    { key: 't2_residence_fiscale', label: 'Résidence fiscale', type: 'text', section: 'Titulaire 2 - Fiscal' },
    { key: 't2_nif', label: 'N° identification fiscale', type: 'text', section: 'Titulaire 2 - Fiscal' },
    { key: 't2_us_person', label: 'US Person', type: 'boolean', section: 'Titulaire 2 - Fiscal' },

    // ==================== SITUATION FAMILIALE ====================
    { key: 'situation_familiale', label: 'Situation familiale', type: 'select', section: 'Situation familiale', required: true, options: [
      { value: 'Célibataire', label: 'Célibataire' },
      { value: 'Marié(e)', label: 'Marié(e)' },
      { value: 'Pacsé(e)', label: 'Pacsé(e)' },
      { value: 'Concubinage', label: 'Concubinage' },
      { value: 'Divorcé(e)', label: 'Divorcé(e)' },
      { value: 'Séparé(e)', label: 'Séparé(e)' },
      { value: 'Veuf(ve)', label: 'Veuf(ve)' },
    ]},
    { key: 'date_mariage', label: 'Date de mariage', type: 'date', section: 'Situation familiale' },
    { key: 'contrat_mariage', label: 'Contrat de mariage', type: 'boolean', section: 'Situation familiale' },
    { key: 'regime_matrimonial', label: 'Régime matrimonial', type: 'select', section: 'Situation familiale', options: [
      { value: '', label: '-- Non concerné --' },
      { value: 'Communauté légale', label: 'Communauté réduite aux acquêts' },
      { value: 'Communauté universelle', label: 'Communauté universelle' },
      { value: 'Séparation de biens', label: 'Séparation de biens' },
      { value: 'Participation aux acquêts', label: 'Participation aux acquêts' },
    ]},
    { key: 'date_pacs', label: 'Date du PACS', type: 'date', section: 'Situation familiale' },
    { key: 'convention_pacs', label: 'Convention PACS', type: 'boolean', section: 'Situation familiale' },
    { key: 'regime_pacs', label: 'Régime PACS', type: 'select', section: 'Situation familiale', options: [
      { value: '', label: '-- Non concerné --' },
      { value: 'Séparation de biens', label: 'Séparation de biens' },
      { value: 'Indivision', label: 'Indivision' },
    ]},
    { key: 'date_divorce', label: 'Date du divorce', type: 'date', section: 'Situation familiale' },
    { key: 'nombre_enfants', label: 'Nombre d\'enfants', type: 'number', section: 'Situation familiale' },
    { key: 'enfants_a_charge', label: 'Enfants à charge fiscalement', type: 'number', section: 'Situation familiale' },
    { key: 'personnes_a_charge', label: 'Autres personnes à charge', type: 'number', section: 'Situation familiale' },
    { key: 'informations_complementaires', label: 'Informations complémentaires famille', type: 'textarea', section: 'Situation familiale' },

    // ==================== DONATIONS ====================
    { key: 'donation_entre_epoux', label: 'Donation entre époux', type: 'boolean', section: 'Donations' },
    { key: 'donation_entre_epoux_date', label: 'Date donation époux', type: 'date', section: 'Donations' },
    { key: 'donation_entre_epoux_montant', label: 'Montant donation époux', type: 'currency', section: 'Donations' },
    { key: 'donation_enfants', label: 'Donation aux enfants', type: 'boolean', section: 'Donations' },
    { key: 'donation_enfants_date', label: 'Date donation enfants', type: 'date', section: 'Donations' },
    { key: 'donation_enfants_montant', label: 'Montant donation enfants', type: 'currency', section: 'Donations' },

    // ==================== SITUATION FINANCIÈRE ====================
    // Options alignées sur le QCC officiel
    { key: 'revenus_annuels_foyer', label: 'Revenus annuels nets du foyer', type: 'select', section: 'Situation financière', required: true, options: [
      { value: '< 50 000 €', label: 'Moins de 50 000 €' },
      { value: '50 000 € - 100 000 €', label: '50 000 € à 100 000 €' },
      { value: '100 001 € - 150 000 €', label: '100 001 € à 150 000 €' },
      { value: '150 000 € - 500 000 €', label: '150 000 € à 500 000 €' },
      { value: '> 500 000 €', label: 'Plus de 500 000 €' },
    ]},
    { key: 'charges_annuelles_pourcent', label: 'Charges (% des revenus)', type: 'percent', section: 'Situation financière' },
    { key: 'charges_annuelles_montant', label: 'Charges annuelles', type: 'currency', section: 'Situation financière' },
    { key: 'capacite_epargne_mensuelle', label: 'Capacité d\'épargne mensuelle', type: 'currency', section: 'Situation financière', suffix: '/mois' },
    { key: 'impot_revenu', label: 'Assujetti IR', type: 'boolean', section: 'Situation financière' },
    { key: 'impot_fortune_immobiliere', label: 'Assujetti IFI', type: 'boolean', section: 'Situation financière' },

    // ==================== PATRIMOINE ====================
    // Options alignées sur le QCC officiel (tranches réglementaires)
    { key: 'patrimoine_global', label: 'Patrimoine global (hors dettes)', type: 'select', section: 'Patrimoine', required: true, options: [
      { value: '< 100 000 €', label: 'Moins de 100 000 €' },
      { value: '100 001 € - 300 000 €', label: '100 001 € à 300 000 €' },
      { value: '300 001 € - 500 000 €', label: '300 001 € à 500 000 €' },
      { value: '500 001 € - 1 000 000 €', label: '500 001 € à 1 000 000 €' },
      { value: '1 000 001 € - 5 000 000 €', label: '1 000 001 € à 5 000 000 €' },
      { value: '> 5 000 000 €', label: 'Plus de 5 000 000 €' },
    ]},
    { key: 'patrimoine_immobilier', label: 'Patrimoine immobilier', type: 'number', section: 'Patrimoine' },
    { key: 'patrimoine_financier', label: 'Patrimoine financier', type: 'number', section: 'Patrimoine' },
    { key: 'patrimoine_professionnel', label: 'Patrimoine professionnel', type: 'number', section: 'Patrimoine' },
    { key: 'dettes_total', label: 'Total des dettes', type: 'number', section: 'Patrimoine' },
    { key: 'credit_immobilier', label: 'Crédit immobilier en cours', type: 'boolean', section: 'Patrimoine' },

    // ==================== ORIGINE DES FONDS ====================
    { key: 'origine_nature', label: 'Nature des fonds', type: 'select', section: 'Origine des fonds', options: [
      { value: 'Épargne personnelle', label: 'Épargne personnelle' },
      { value: 'Héritage', label: 'Héritage' },
      { value: 'Cession', label: 'Cession (entreprise/immobilier)' },
      { value: 'Revenus professionnels', label: 'Revenus professionnels' },
      { value: 'Autre', label: 'Autre' },
    ]},
    { key: 'montant_investi_prevu', label: 'Montant prévu à investir', type: 'currency', section: 'Origine des fonds' },
    { key: 'origine_economique_revenus', label: 'Origine: Revenus professionnels', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_epargne', label: 'Origine: Épargne', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_heritage', label: 'Origine: Héritage/Donation', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_vente_immo', label: 'Origine: Vente immobilière', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_cession', label: 'Origine: Cession d\'entreprise', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_cession_mobiliere', label: 'Origine: Cession valeurs mobilières', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_gains_jeu', label: 'Origine: Gains jeux/paris', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_assurance_vie', label: 'Origine: Rachat assurance-vie', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_autre', label: 'Origine: Autre (préciser)', type: 'text', section: 'Origine des fonds' },
    { key: 'etablissement_bancaire_origine', label: 'Établissement bancaire d\'origine', type: 'text', section: 'Origine des fonds', placeholder: 'Banque où sont les fonds' },
    { key: 'origine_fonds', label: 'Détails origine des fonds', type: 'textarea', section: 'Origine des fonds', placeholder: 'Précisions sur l\'origine...' },

    // ==================== LCB-FT / CONFORMITÉ ====================
    { key: 'ppe', label: 'Personne Politiquement Exposée (PPE)', type: 'boolean', section: 'Conformité LCB-FT' },
    { key: 'ppe_lien', label: 'Lien avec une PPE', type: 'boolean', section: 'Conformité LCB-FT' },
    { key: 'ppe_fonction', label: 'Si PPE, fonction exercée', type: 'text', section: 'Conformité LCB-FT' },
    { key: 'beneficiaire_effectif', label: 'Bénéficiaire effectif = titulaire', type: 'boolean', section: 'Conformité LCB-FT' },
    { key: 'tiers_beneficiaire', label: 'Investit pour le compte d\'un tiers', type: 'boolean', section: 'Conformité LCB-FT' },

    // ==================== KYC - FORMATION ====================
    { key: 'niveau_etudes', label: 'Niveau d\'études', type: 'select', section: 'KYC - Formation', options: [
      { value: 'Bac', label: 'Baccalauréat' },
      { value: 'Bac+2', label: 'Bac +2' },
      { value: 'Bac+3', label: 'Bac +3 (Licence)' },
      { value: 'Bac+5', label: 'Bac +5 (Master)' },
      { value: 'Bac+8', label: 'Bac +8 (Doctorat)' },
      { value: 'Autre', label: 'Autre' },
    ]},
    { key: 'domaine_etudes', label: 'Domaine d\'études', type: 'text', section: 'KYC - Formation' },
    { key: 'formation_financiere', label: 'Formation en finance/économie', type: 'boolean', section: 'KYC - Formation' },
    { key: 'formation_financiere_detail', label: 'Détail formation financière', type: 'text', section: 'KYC - Formation' },

    // ==================== KYC - EXPÉRIENCE INVESTISSEMENT ====================
    { key: 'experience_professionnelle_finance', label: 'Expérience pro en finance (>1 an)', type: 'boolean', section: 'KYC - Expérience' },
    { key: 'experience_finance_duree', label: 'Durée expérience finance', type: 'text', section: 'KYC - Expérience' },
    { key: 'experience_finance_poste', label: 'Poste occupé en finance', type: 'text', section: 'KYC - Expérience' },
    { key: 'annees_premier_investissement', label: 'Années depuis 1er investissement', type: 'number', section: 'KYC - Expérience' },
    { key: 'montant_moyen_operation', label: 'Montant moyen par opération', type: 'currency', section: 'KYC - Expérience' },
    { key: 'gestion_mandat', label: 'Gestion sous mandat (actuelle/passée)', type: 'boolean', section: 'KYC - Expérience' },
    { key: 'gestion_conseiller', label: 'Suivi par un conseiller', type: 'boolean', section: 'KYC - Expérience' },

    // ==================== KYC - SOURCES D'INFORMATION ====================
    { key: 'lecture_presse_financiere', label: 'Lecture presse financière', type: 'boolean', section: 'KYC - Sources info' },
    { key: 'sources_internet', label: 'Sites internet spécialisés', type: 'boolean', section: 'KYC - Sources info' },
    { key: 'sources_conseiller', label: 'Conseiller financier', type: 'boolean', section: 'KYC - Sources info' },
    { key: 'sources_banque', label: 'Conseiller bancaire', type: 'boolean', section: 'KYC - Sources info' },
    { key: 'sources_entourage', label: 'Entourage (famille, amis)', type: 'boolean', section: 'KYC - Sources info' },
    { key: 'sources_reseaux_sociaux', label: 'Réseaux sociaux', type: 'boolean', section: 'KYC - Sources info' },

    // ==================== KYC - COMPRÉHENSION DES RISQUES ====================
    { key: 'comprend_risque_perte', label: 'Comprend le risque de perte en capital', type: 'boolean', section: 'KYC - Compréhension risques' },
    { key: 'comprend_risque_liquidite', label: 'Comprend le risque de liquidité', type: 'boolean', section: 'KYC - Compréhension risques' },
    { key: 'comprend_risque_change', label: 'Comprend le risque de change', type: 'boolean', section: 'KYC - Compréhension risques' },
    { key: 'comprend_effet_levier', label: 'Comprend l\'effet de levier', type: 'boolean', section: 'KYC - Compréhension risques' },
  ],

  // PROFIL_RISQUE - Évaluation complète du profil investisseur (conforme QCC réglementaire)
  PROFIL_RISQUE: [
    // ==================== IDENTIFICATION ====================
    { key: 't1_civilite', label: 'Civilité', type: 'select', section: 'Identification', required: true, options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Identification', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Identification', required: true },
    { key: 't1_date_naissance', label: 'Date de naissance', type: 'date', section: 'Identification' },

    // ==================== OBJECTIFS D'INVESTISSEMENT ====================
    { key: 'objectif_preservation', label: 'Objectif: Préservation du capital', type: 'boolean', section: 'Objectifs d\'investissement' },
    { key: 'objectif_preservation_priorite', label: 'Priorité préservation (1-7)', type: 'number', section: 'Objectifs d\'investissement' },
    { key: 'objectif_valorisation', label: 'Objectif: Valorisation du capital', type: 'boolean', section: 'Objectifs d\'investissement' },
    { key: 'objectif_valorisation_priorite', label: 'Priorité valorisation (1-7)', type: 'number', section: 'Objectifs d\'investissement' },
    { key: 'objectif_diversification', label: 'Objectif: Diversification des actifs', type: 'boolean', section: 'Objectifs d\'investissement' },
    { key: 'objectif_diversification_priorite', label: 'Priorité diversification (1-7)', type: 'number', section: 'Objectifs d\'investissement' },
    { key: 'objectif_revenus', label: 'Objectif: Recherche de revenus', type: 'boolean', section: 'Objectifs d\'investissement' },
    { key: 'objectif_revenus_priorite', label: 'Priorité revenus (1-7)', type: 'number', section: 'Objectifs d\'investissement' },
    { key: 'objectif_transmission', label: 'Objectif: Transmission', type: 'boolean', section: 'Objectifs d\'investissement' },
    { key: 'objectif_transmission_priorite', label: 'Priorité transmission (1-7)', type: 'number', section: 'Objectifs d\'investissement' },
    { key: 'objectif_fiscal', label: 'Objectif: Optimisation fiscale', type: 'boolean', section: 'Objectifs d\'investissement' },
    { key: 'objectif_fiscal_priorite', label: 'Priorité fiscal (1-7)', type: 'number', section: 'Objectifs d\'investissement' },
    { key: 'objectif_autre', label: 'Autre objectif', type: 'text', section: 'Objectifs d\'investissement' },
    { key: 'objectif_autre_priorite', label: 'Priorité autre (1-7)', type: 'number', section: 'Objectifs d\'investissement' },
    { key: 'horizon_placement', label: 'Horizon de placement', type: 'select', section: 'Objectifs d\'investissement', required: true, options: [
      { value: '< 1 an', label: 'Moins d\'1 an' },
      { value: '1 - 3 ans', label: 'Entre 1 et 3 ans' },
      { value: '3 - 5 ans', label: 'Entre 3 et 5 ans' },
      { value: '> 5 ans', label: 'Plus de 5 ans' },
    ]},
    { key: 'besoin_liquidite', label: 'Besoin de liquidité', type: 'select', section: 'Objectifs d\'investissement', required: true, options: [
      { value: 'Oui', label: 'Oui, je dois pouvoir disposer de l\'argent à tout moment' },
      { value: 'Non', label: 'Non, je dispose de liquidités accessibles rapidement' },
    ]},
    { key: 'pourcentage_patrimoine_investi', label: '% du patrimoine total à investir', type: 'select', section: 'Objectifs d\'investissement', required: true, options: [
      { value: '< 10%', label: 'Moins de 10%' },
      { value: '10% - 25%', label: 'Entre 10% et 25%' },
      { value: '25% - 50%', label: 'Entre 25% et 50%' },
      { value: '50% - 75%', label: 'Entre 50% et 75%' },
      { value: '> 75%', label: 'Plus de 75%' },
    ]},

    // ==================== TOLÉRANCE AU RISQUE ====================
    { key: 'placement_preference', label: 'Quel placement vous convient le mieux?', type: 'select', section: 'Tolérance au risque', required: true, options: [
      { value: 'A', label: 'Placement A: Risque faible, protection du capital, diversification partielle' },
      { value: 'B', label: 'Placement B: Risque moyen, diversification significative, recherche de valorisation' },
      { value: 'C', label: 'Placement C: Risque élevé, maximiser la performance, perte partielle/totale possible' },
    ]},
    { key: 'experience_baisse', label: 'Avez-vous déjà subi une baisse sur un investissement?', type: 'select', section: 'Tolérance au risque', required: true, options: [
      { value: 'Non', label: 'Non, jamais' },
      { value: '< 10%', label: 'Oui, inférieure à 10%' },
      { value: '10% - 20%', label: 'Oui, entre 10% et 20%' },
      { value: '> 20%', label: 'Oui, supérieure à 20%' },
    ]},
    { key: 'reaction_perte', label: 'Réaction en cas de baisse', type: 'select', section: 'Tolérance au risque', required: true, options: [
      { value: 'Investir plus', label: 'J\'investis/investirais de nouveau pour profiter des opportunités' },
      { value: 'Vendre tout', label: 'Je vends/vendrais tout pour réinvestir dans des supports moins risqués' },
      { value: 'Vendre partie', label: 'Je vends/vendrais une partie pour réinvestir sur des supports moins risqués' },
      { value: 'Ne rien changer', label: 'Je ne change/changerais rien' },
    ]},
    { key: 'reaction_hausse_20pct', label: 'Réaction si +20% de gains', type: 'select', section: 'Tolérance au risque', required: true, options: [
      { value: 'Conserver', label: 'Je conserve ma position' },
      { value: 'Réinvestir moins', label: 'Je réinvestis un montant inférieur ou égal au montant initial' },
      { value: 'Réinvestir plus', label: 'Je réinvestis un montant supérieur au montant initial' },
    ]},
    { key: 'pertes_maximales_acceptables', label: 'Perte maximale acceptable', type: 'select', section: 'Tolérance au risque', required: true, options: [
      { value: 'Aucune', label: 'Aucune perte acceptable' },
      { value: 'Maximum 10%', label: 'Maximum 10%' },
      { value: 'Maximum 25%', label: 'Maximum 25%' },
      { value: 'Maximum 50%', label: 'Maximum 50%' },
      { value: 'Jusqu\'à 100%', label: 'Jusqu\'à 100% (perte totale possible)' },
    ]},

    // ==================== PRODUITS MONÉTAIRES ET FONDS EUROS ====================
    { key: 'kyc_monetaires_detention', label: 'Détention produits monétaires/fonds euros', type: 'boolean', section: 'Produits monétaires et fonds euros' },
    { key: 'kyc_monetaires_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'Produits monétaires et fonds euros', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_monetaires_duree', label: 'Durée de détention', type: 'select', section: 'Produits monétaires et fonds euros', options: [
      { value: '< 4 ans', label: 'Moins de 4 ans' },
      { value: '> 4 ans', label: 'Plus de 4 ans' },
    ]},
    { key: 'kyc_monetaires_volume', label: 'Volume des opérations', type: 'select', section: 'Produits monétaires et fonds euros', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_monetaires_q1', label: 'Rendement inférieur aux actifs risqués à moyen/long terme?', type: 'select', section: 'Produits monétaires et fonds euros', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_monetaires_q2', label: 'Risque de perte en capital plus limité que actifs risqués?', type: 'select', section: 'Produits monétaires et fonds euros', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== OBLIGATIONS ET FONDS OBLIGATAIRES ====================
    { key: 'kyc_obligations_detention', label: 'Détention obligations', type: 'boolean', section: 'Obligations et fonds obligataires' },
    { key: 'kyc_obligations_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'Obligations et fonds obligataires', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_obligations_duree', label: 'Durée de détention', type: 'select', section: 'Obligations et fonds obligataires', options: [
      { value: '< 4 ans', label: 'Moins de 4 ans' },
      { value: '> 4 ans', label: 'Plus de 4 ans' },
    ]},
    { key: 'kyc_obligations_volume', label: 'Volume des opérations', type: 'select', section: 'Obligations et fonds obligataires', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_obligations_q1', label: 'Émetteur sain = coupon plus élevé?', type: 'select', section: 'Obligations et fonds obligataires', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_obligations_q2', label: 'Risque de perte en capital par défaut émetteur?', type: 'select', section: 'Obligations et fonds obligataires', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== ACTIONS ET FONDS ACTIONS ====================
    { key: 'kyc_actions_detention', label: 'Détention actions', type: 'boolean', section: 'Actions et fonds actions' },
    { key: 'kyc_actions_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'Actions et fonds actions', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_actions_duree', label: 'Durée de détention', type: 'select', section: 'Actions et fonds actions', options: [
      { value: '< 4 ans', label: 'Moins de 4 ans' },
      { value: '> 4 ans', label: 'Plus de 4 ans' },
    ]},
    { key: 'kyc_actions_volume', label: 'Volume des opérations', type: 'select', section: 'Actions et fonds actions', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_actions_q1', label: 'La valeur d\'une action peut chuter à 0€?', type: 'select', section: 'Actions et fonds actions', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_actions_q2', label: 'Risque de perte en capital par défaut émetteur?', type: 'select', section: 'Actions et fonds actions', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== SCPI ====================
    { key: 'kyc_scpi_detention', label: 'Détention SCPI', type: 'boolean', section: 'SCPI / OPCI' },
    { key: 'kyc_scpi_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'SCPI / OPCI', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_scpi_duree', label: 'Durée de détention', type: 'select', section: 'SCPI / OPCI', options: [
      { value: '< 10 ans', label: 'Moins de 10 ans' },
      { value: '> 10 ans', label: 'Plus de 10 ans' },
    ]},
    { key: 'kyc_scpi_volume', label: 'Volume des opérations', type: 'select', section: 'SCPI / OPCI', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_scpi_q1', label: 'L\'investissement permet de mutualiser les risques?', type: 'select', section: 'SCPI / OPCI', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_scpi_q2', label: 'Les investisseurs doivent trouver eux-mêmes un acquéreur?', type: 'select', section: 'SCPI / OPCI', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== PRIVATE EQUITY ====================
    { key: 'kyc_pe_detention', label: 'Détention Private Equity (FCPI, FCPR, FIP)', type: 'boolean', section: 'Private Equity' },
    { key: 'kyc_pe_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'Private Equity', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_pe_duree', label: 'Durée de détention', type: 'select', section: 'Private Equity', options: [
      { value: '< 8 ans', label: 'Moins de 8 ans' },
      { value: '> 8 ans', label: 'Plus de 8 ans' },
    ]},
    { key: 'kyc_pe_volume', label: 'Volume des opérations', type: 'select', section: 'Private Equity', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_pe_q1', label: 'Investissement risqué nécessitant plus de 8 ans de détention?', type: 'select', section: 'Private Equity', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_pe_q2', label: 'Risque de perte en capital par défaut émetteur?', type: 'select', section: 'Private Equity', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== ETF / TRACKERS ====================
    { key: 'kyc_etf_detention', label: 'Détention ETF/Trackers', type: 'boolean', section: 'ETF / Trackers' },
    { key: 'kyc_etf_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'ETF / Trackers', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_etf_duree', label: 'Durée de détention', type: 'select', section: 'ETF / Trackers', options: [
      { value: '< 4 ans', label: 'Moins de 4 ans' },
      { value: '> 4 ans', label: 'Plus de 4 ans' },
    ]},
    { key: 'kyc_etf_volume', label: 'Volume des opérations', type: 'select', section: 'ETF / Trackers', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_etf_q1', label: 'Réplique exactement l\'indice sur lequel il est adossé?', type: 'select', section: 'ETF / Trackers', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_etf_q2', label: 'Achat/vente à tout moment comme une action cotée?', type: 'select', section: 'ETF / Trackers', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== PRODUITS DÉRIVÉS ====================
    { key: 'kyc_derives_detention', label: 'Détention produits dérivés (Options, Futures, Warrants)', type: 'boolean', section: 'Produits dérivés' },
    { key: 'kyc_derives_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'Produits dérivés', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_derives_duree', label: 'Durée de détention', type: 'select', section: 'Produits dérivés', options: [
      { value: '< 4 ans', label: 'Moins de 4 ans' },
      { value: '> 4 ans', label: 'Plus de 4 ans' },
    ]},
    { key: 'kyc_derives_volume', label: 'Volume des opérations', type: 'select', section: 'Produits dérivés', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_derives_q1', label: 'Peut augmenter le risque de perte en capital?', type: 'select', section: 'Produits dérivés', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_derives_q2', label: 'Utilisable pour couvrir un risque spécifique?', type: 'select', section: 'Produits dérivés', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== PRODUITS STRUCTURÉS ====================
    { key: 'kyc_structures_detention', label: 'Détention produits structurés', type: 'boolean', section: 'Produits structurés' },
    { key: 'kyc_structures_operations', label: 'Nombre d\'opérations/an', type: 'select', section: 'Produits structurés', options: [
      { value: '< 1', label: 'Moins d\'1 par an' },
      { value: '1 - 5', label: 'De 1 à 5 par an' },
      { value: '> 6', label: 'Plus de 6 par an' },
    ]},
    { key: 'kyc_structures_duree', label: 'Durée de détention', type: 'select', section: 'Produits structurés', options: [
      { value: '< 4 ans', label: 'Moins de 4 ans' },
      { value: '> 4 ans', label: 'Plus de 4 ans' },
    ]},
    { key: 'kyc_structures_volume', label: 'Volume des opérations', type: 'select', section: 'Produits structurés', options: [
      { value: '< 5000', label: 'Moins de 5 000€' },
      { value: '5000 - 10000', label: 'Entre 5 000€ et 10 000€' },
      { value: '> 10000', label: 'Plus de 10 000€' },
      { value: '> 50000', label: 'Plus de 50 000€' },
    ]},
    { key: 'kyc_structures_q1', label: 'Valeur garantie en cas de rachat avant échéance?', type: 'select', section: 'Produits structurés', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},
    { key: 'kyc_structures_q2', label: 'Risque de perte en capital au cours de vie et à échéance?', type: 'select', section: 'Produits structurés', options: [
      { value: 'Vrai', label: 'Vrai' },
      { value: 'Faux', label: 'Faux' },
      { value: 'NSP', label: 'Je ne sais pas' },
    ]},

    // ==================== GESTION DU PORTEFEUILLE ====================
    { key: 'gestion_mandat', label: 'Avez-vous (ou avez-vous eu) un portefeuille géré sous mandat?', type: 'boolean', section: 'Gestion du portefeuille' },
    { key: 'gestion_autonome', label: 'Gérez-vous (ou avez-vous géré) vous-même votre portefeuille?', type: 'boolean', section: 'Gestion du portefeuille' },
    { key: 'gestion_conseiller', label: 'Gérez-vous avec l\'aide d\'un conseiller?', type: 'boolean', section: 'Gestion du portefeuille' },
    { key: 'experience_professionnelle_finance', label: 'Position professionnelle dans le secteur financier (>1 an)?', type: 'boolean', section: 'Gestion du portefeuille' },

    // ==================== CULTURE FINANCIÈRE ====================
    { key: 'lecture_presse_financiere', label: 'Lisez-vous la presse ou l\'actualité financière?', type: 'boolean', section: 'Culture financière' },
    { key: 'suivi_bourse', label: 'Regardez-vous régulièrement les cours de la Bourse?', type: 'boolean', section: 'Culture financière' },
    { key: 'suivi_releves', label: 'Regardez-vous au moins tous les mois vos relevés bancaires?', type: 'boolean', section: 'Culture financière' },

    // ==================== PRÉFÉRENCES ESG / DURABILITÉ ====================
    { key: 'durabilite_integration', label: 'Souhaite intégrer des critères de durabilité ESG', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'durabilite_taxonomie_part', label: 'Part d\'investissements alignés Taxonomie européenne', type: 'select', section: 'Investissements durables (ESG)', options: [
      { value: 'Aucun', label: 'Aucun' },
      { value: '>= 5%', label: '≥ 5%' },
      { value: '>= 25%', label: '≥ 25%' },
      { value: '>= 50%', label: '≥ 50%' },
    ]},
    { key: 'durabilite_investissement_part', label: 'Part en investissements durables', type: 'select', section: 'Investissements durables (ESG)', options: [
      { value: 'Aucun', label: 'Aucun' },
      { value: '>= 5%', label: '≥ 5%' },
      { value: '>= 25%', label: '≥ 25%' },
      { value: '>= 50%', label: '≥ 50%' },
    ]},
    { key: 'durabilite_impact', label: 'Sélectionner selon impact sur facteurs de durabilité', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_gaz_effet_serre', label: 'Minimiser: Gaz à effet de serre', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_biodiversite', label: 'Minimiser: Impact sur la biodiversité', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_emissions_eau', label: 'Minimiser: Émissions polluantes dans l\'eau', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_dechets', label: 'Minimiser: Génération de déchets dangereux', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_energie', label: 'Minimiser: Inefficacité énergétique (immobilier)', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_normes_internationales', label: 'Minimiser: Non-respect normes internationales (OCDE, ONU)', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_controle_normes', label: 'Minimiser: Absence de processus de contrôle des normes', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_egalite_remuneration', label: 'Minimiser: Inégalité de rémunération H/F', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_diversite_genres', label: 'Minimiser: Manque de diversité au conseil d\'administration', type: 'boolean', section: 'Investissements durables (ESG)' },
    { key: 'esg_armes_controversees', label: 'Exclure: Armes controversées', type: 'boolean', section: 'Investissements durables (ESG)' },

    // ==================== PROFIL CALCULÉ ====================
    { key: 'profil_risque_calcule', label: 'Profil de risque déterminé', type: 'select', section: 'Conclusion - Profil de risque', required: true, options: [
      { value: '', label: '-- Non défini --' },
      { value: 'Sécuritaire', label: 'Sécuritaire' },
      { value: 'Prudent', label: 'Prudent' },
      { value: 'Équilibré', label: 'Équilibré' },
      { value: 'Dynamique', label: 'Dynamique' },
    ]},
    { key: 'profil_part_actifs_risques', label: 'Part max d\'actifs à risque élevé (%)', type: 'number', section: 'Conclusion - Profil de risque' },
    { key: 'profil_commentaire', label: 'Commentaires / Observations', type: 'textarea', section: 'Conclusion - Profil de risque', placeholder: 'Observations, ajustements, justifications...' },
  ],

  // LETTRE_MISSION - Contrat de mission
  LETTRE_MISSION: [
    // ==================== CLIENT ====================
    { key: 't1_civilite', label: 'Civilité', type: 'select', section: 'Client', options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Client', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Client', required: true },
    { key: 't1_adresse', label: 'Adresse', type: 'text', section: 'Client', required: true },
    { key: 't1_code_postal', label: 'Code postal', type: 'text', section: 'Client' },
    { key: 't1_ville', label: 'Ville', type: 'text', section: 'Client' },
    { key: 't1_email', label: 'Email', type: 'email', section: 'Client' },
    { key: 't1_telephone', label: 'Téléphone', type: 'tel', section: 'Client' },

    // ==================== TYPE DE PRESTATION ====================
    { key: 'type_prestation', label: 'Type de prestation', type: 'select', section: 'Type de prestation', required: true, options: [
      { value: 'conseil_ponctuel', label: 'Conseil ponctuel' },
      { value: 'suivi_regulier', label: 'Suivi régulier' },
      { value: 'gestion_conseillee', label: 'Gestion conseillée' },
      { value: 'audit_patrimonial', label: 'Audit patrimonial' },
    ]},
    { key: 'mode_conseil', label: 'Mode de conseil', type: 'select', section: 'Type de prestation', options: [
      { value: 'independant', label: 'Conseil indépendant' },
      { value: 'non_independant', label: 'Conseil non-indépendant' },
    ]},
    { key: 'instruments_souhaites', label: 'Instruments financiers souhaités', type: 'textarea', section: 'Type de prestation', placeholder: 'Assurance-vie, PEA, Compte-titres, SCPI...' },

    // ==================== PÉRIMÈTRE MISSION ====================
    { key: 'perimetre_mission', label: 'Périmètre de la mission', type: 'textarea', section: 'Périmètre', placeholder: 'Décrire le périmètre...' },
    { key: 'frequence_suivi', label: 'Fréquence de suivi', type: 'select', section: 'Périmètre', options: [
      { value: 'ponctuel', label: 'Ponctuel (à la demande)' },
      { value: 'semestriel', label: 'Semestriel' },
      { value: 'annuel', label: 'Annuel' },
      { value: 'trimestriel', label: 'Trimestriel' },
    ]},

    // ==================== RÉMUNÉRATION ====================
    { key: 'remuneration_mode', label: 'Mode de rémunération', type: 'select', section: 'Rémunération', required: true, options: [
      { value: 'honoraires', label: 'Honoraires' },
      { value: 'commissions', label: 'Commissions' },
      { value: 'mixte', label: 'Mixte (honoraires + commissions)' },
    ]},
    { key: 'honoraires_montant', label: 'Montant honoraires (HT)', type: 'currency', section: 'Rémunération' },
    { key: 'honoraires_description', label: 'Description des honoraires', type: 'textarea', section: 'Rémunération', placeholder: 'Détail de la facturation...' },

    // ==================== SIGNATURES ====================
    { key: 'date_remise_der', label: 'Date remise DER', type: 'date', section: 'Signatures' },
    { key: 'date_signature', label: 'Date de signature', type: 'date', section: 'Signatures' },
    { key: 'lieu_signature', label: 'Lieu de signature', type: 'text', section: 'Signatures' },
    { key: 'nombre_exemplaires', label: 'Nombre d\'exemplaires', type: 'number', section: 'Signatures' },
  ],

  // DECLARATION_ADEQUATION - Justification du conseil
  DECLARATION_ADEQUATION: [
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Client', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Client', required: true },
    { key: 'profil_risque_calcule', label: 'Profil de risque validé', type: 'select', section: 'Profil', required: true, options: [
      { value: '', label: '-- Non défini --' },
      { value: 'Sécuritaire', label: 'Sécuritaire' },
      { value: 'Prudent', label: 'Prudent' },
      { value: 'Équilibré', label: 'Équilibré' },
      { value: 'Dynamique', label: 'Dynamique' },
      { value: 'Offensif', label: 'Offensif' },
    ]},
    { key: 'produit_recommande', label: 'Produit(s) recommandé(s)', type: 'textarea', section: 'Recommandation', required: true },
    { key: 'justification_adequation', label: 'Justification de l\'adéquation', type: 'textarea', section: 'Recommandation', required: true, placeholder: 'Expliquer pourquoi ce produit correspond au profil du client...' },
    { key: 'risques_identifies', label: 'Risques identifiés', type: 'textarea', section: 'Risques', placeholder: 'Risque de perte en capital, liquidité...' },
  ],

  // CONVENTION_RTO - Réception Transmission d'Ordres
  CONVENTION_RTO: [
    // ==================== TYPE DE CLIENT ====================
    { key: 'rto_type_client', label: 'Type de client', type: 'select', section: 'Type de client', required: true, options: [
      { value: 'particulier', label: 'Personne Physique (Particulier)' },
      { value: 'professionnel', label: 'Personne Physique (Professionnel)' },
      { value: 'personne_morale', label: 'Personne Morale' },
    ]},
    { key: 'rto_profession_liberal', label: 'Profession libérale', type: 'boolean', section: 'Type de client' },
    { key: 'rto_siret_professionnel', label: 'SIRET professionnel', type: 'text', section: 'Type de client' },
    { key: 'rto_activite_professionnelle', label: 'Activité professionnelle', type: 'text', section: 'Type de client' },

    // ==================== CLIENT PERSONNE PHYSIQUE ====================
    { key: 't1_civilite', label: 'Civilité', type: 'select', section: 'Client - Personne Physique', options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Client - Personne Physique', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Client - Personne Physique', required: true },
    { key: 't1_adresse', label: 'Adresse', type: 'text', section: 'Client - Personne Physique' },
    { key: 't1_email', label: 'Email', type: 'email', section: 'Client - Personne Physique' },
    { key: 't1_telephone', label: 'Téléphone', type: 'tel', section: 'Client - Personne Physique' },

    // ==================== PERSONNE MORALE ====================
    { key: 'rto_pm_raison_sociale', label: 'Raison sociale', type: 'text', section: 'Personne Morale' },
    { key: 'rto_pm_objet_social', label: 'Objet social', type: 'text', section: 'Personne Morale' },
    { key: 'rto_pm_forme_juridique', label: 'Forme juridique', type: 'select', section: 'Personne Morale', options: [
      { value: 'SARL', label: 'SARL' },
      { value: 'SAS', label: 'SAS' },
      { value: 'SA', label: 'SA' },
      { value: 'SCI', label: 'SCI' },
      { value: 'Association', label: 'Association' },
      { value: 'Autre', label: 'Autre' },
    ]},
    { key: 'rto_pm_numero_rcs', label: 'Numéro RCS', type: 'text', section: 'Personne Morale' },
    { key: 'rto_pm_ville_rcs', label: 'Ville RCS', type: 'text', section: 'Personne Morale' },
    { key: 'rto_pm_siege_social', label: 'Siège social', type: 'text', section: 'Personne Morale' },
    { key: 'rto_pm_code_postal_siege', label: 'Code postal siège', type: 'text', section: 'Personne Morale' },
    { key: 'rto_pm_ville_siege', label: 'Ville siège', type: 'text', section: 'Personne Morale' },

    // ==================== REPRÉSENTANT PERSONNE MORALE ====================
    { key: 'rto_pm_representant_civilite', label: 'Civilité représentant', type: 'select', section: 'Représentant PM', options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 'rto_pm_representant_nom', label: 'Nom représentant', type: 'text', section: 'Représentant PM' },
    { key: 'rto_pm_representant_prenom', label: 'Prénom représentant', type: 'text', section: 'Représentant PM' },
    { key: 'rto_pm_representant_qualite', label: 'Qualité (Gérant, Président...)', type: 'text', section: 'Représentant PM' },

    // ==================== COMPTE ====================
    { key: 'etablissement_teneur', label: 'Établissement teneur de compte', type: 'text', section: 'Compte', required: true },
    { key: 'numero_compte', label: 'Numéro de compte', type: 'text', section: 'Compte' },

    // ==================== MODES DE COMMUNICATION ====================
    { key: 'rto_modes_communication', label: 'Modes de communication', type: 'select', section: 'Communication', options: [
      { value: 'telephone', label: 'Téléphone' },
      { value: 'email', label: 'Email' },
      { value: 'courrier', label: 'Courrier' },
      { value: 'plateforme', label: 'Plateforme électronique' },
    ]},
    { key: 'rto_modes_communication_autre', label: 'Autre mode de communication', type: 'text', section: 'Communication' },
    { key: 'mode_transmission', label: 'Mode de transmission des ordres', type: 'select', section: 'Communication', options: [
      { value: 'Téléphone', label: 'Téléphone' },
      { value: 'Email', label: 'Email' },
      { value: 'Courrier', label: 'Courrier' },
      { value: 'Plateforme', label: 'Plateforme électronique' },
    ]},
  ],

  // RAPPORT_IAS - Rapport conseil assurance
  RAPPORT_IAS: [
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Client', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Client', required: true },
    { key: 't1_date_naissance', label: 'Date de naissance', type: 'date', section: 'Client', required: true },
    { key: 'produit_assurance', label: 'Produit d\'assurance', type: 'text', section: 'Produit', required: true },
    { key: 'compagnie_assurance', label: 'Compagnie d\'assurance', type: 'text', section: 'Produit', required: true },
    { key: 'analyse_besoins', label: 'Analyse des besoins', type: 'textarea', section: 'Analyse', required: true },
    { key: 'garanties_proposees', label: 'Garanties proposées', type: 'textarea', section: 'Garanties' },
    { key: 'prime_annuelle', label: 'Prime annuelle (€)', type: 'number', section: 'Tarification' },
  ],
};

interface DocumentEditorProps {
  open: boolean;
  onClose: () => void;
  documentType: DocumentType;
  clientData?: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  onGenerateAndDownload: (data: Record<string, any>) => Promise<void>;
  loading?: boolean;
}

export default function DocumentEditor({
  open,
  onClose,
  documentType,
  clientData = {},
  onSave,
  onGenerateAndDownload,
  loading = false,
}: DocumentEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCotitulaire, setShowCotitulaire] = useState(false);

  const fields = DOCUMENT_REQUIRED_FIELDS[documentType] || [];
  const docInfo = DOCUMENTS_DISPONIBLES.find((d) => d.type === documentType);

  // Sections uniques
  const sections = [...new Set(fields.map((f) => f.section))];

  // Initialiser avec les données existantes du client
  // Note: transformFormDataToFlat est importé depuis '../utils/formDataTransformer'
  // Fusionne les données directes ET les données stockées dans form_data (pour les champs supplémentaires)
  useEffect(() => {
    if (open && clientData) {
      // Récupérer form_data s'il existe (contient les champs supplémentaires du frontend)
      const formDataFromBackend = clientData.form_data || {};

      // Transformer les données du formulaire de création vers le format plat si nécessaire
      const transformedFormData = transformFormDataToFlat(formDataFromBackend);

      // Fusionner : clientData direct + données transformées (clientData a priorité car déjà au bon format)
      setFormData({ ...transformedFormData, ...clientData });
      setErrors({});

      // Initialiser showCotitulaire si le client a déjà un cotitulaire
      const hasT2 = clientData.t2_nom || clientData.t2_prenom ||
                    formDataFromBackend.hasTitulaire2 ||
                    (formDataFromBackend.titulaire2?.nom);
      setShowCotitulaire(Boolean(hasT2));
    }
  }, [open, clientData]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Effacer l'erreur si le champ est rempli
    if (value && errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = 'Ce champ est requis';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour normaliser une valeur pour l'affichage (extraire la valeur primitive si c'est un objet)
  const normalizeValueForDisplay = (val: any, fieldType?: string): string | boolean => {
    if (val === null || val === undefined) return fieldType === 'boolean' ? false : '';
    // Pour les booléens, retourner directement la valeur booléenne
    if (fieldType === 'boolean') {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true' || val === '1';
      return Boolean(val);
    }
    // Si c'est un objet avec une propriété 'value', extraire la valeur
    if (typeof val === 'object' && val !== null && 'value' in val) {
      return String(val.value || '');
    }
    // Si c'est un tableau, extraire les valeurs
    if (Array.isArray(val)) {
      return val.map(v => normalizeValueForDisplay(v)).filter(v => v !== '').join(', ');
    }
    return String(val);
  };

  // Fonction pour normaliser une valeur pour l'envoi au backend
  const normalizeValueForSave = (val: any, fieldKey?: string): any => {
    // Retourner null pour les valeurs vides (le backend ignore les null via exclude_unset)
    if (val === null || val === undefined || val === '') return null;
    // Si c'est un objet avec une propriété 'value', extraire la valeur
    if (typeof val === 'object' && val !== null && 'value' in val) {
      return val.value || null;
    }
    // Si c'est un tableau d'objets complexes, ignorer
    if (Array.isArray(val)) {
      // Ne pas envoyer les tableaux au backend (probablement des relations)
      return null;
    }
    // Convertir les strings numériques en nombres pour les champs qui attendent des nombres
    if (typeof val === 'string') {
      // Vérifier si c'est un nombre
      const numericFields = [
        'nombre_enfants', 'enfants_a_charge', 'personnes_a_charge', 'nombre_enfants_charge',
        'charges_annuelles_pourcent', 'charges_annuelles_montant', 'capacite_epargne_mensuelle',
        'patrimoine_financier_pourcent', 'patrimoine_immobilier_pourcent',
        'patrimoine_professionnel_pourcent', 'patrimoine_autres_pourcent',
        'dettes_total', 'montant_investi_prevu', 'prime_annuelle',
        'donation_entre_epoux_montant', 'donation_enfants_montant',
        'profil_risque_score', 'annees_experience',
        'objectif_preservation_priorite', 'objectif_valorisation_priorite',
        'objectif_diversification_priorite', 'objectif_revenus_priorite',
        'objectif_transmission_priorite', 'objectif_fiscal_priorite', 'objectif_autre_priorite',
        'profil_part_actifs_risques',
      ];
      if (fieldKey && numericFields.includes(fieldKey)) {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      }
    }
    return val;
  };

  // Fonction pour normaliser toutes les données du formulaire avant sauvegarde
  const normalizeFormData = (data: Record<string, any>): Record<string, any> => {
    const normalized: Record<string, any> = {};

    // Champs système et relations à exclure de l'envoi au backend
    const EXCLUDED_FIELDS = new Set([
      'form_data',      // Géré séparément par le backend
      'conseiller',     // Relation - objet
      'documents',      // Relation - tableau
      'produits',       // Relation - tableau
      'id',             // Ne pas modifier l'ID
      'created_at',     // Champ système
      'updated_at',     // Champ système
      'validated_at',   // Champ système
      'validated_by',   // Champ système
      'conseiller_id',  // Ne pas modifier
    ]);

    for (const [key, value] of Object.entries(data)) {
      // Ignorer les champs exclus
      if (EXCLUDED_FIELDS.has(key)) continue;

      // Ignorer les valeurs qui sont des tableaux d'objets complexes (relations)
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        // Vérifier si c'est un tableau d'objets avec des clés complexes (relation)
        if ('id' in value[0] || 'created_at' in value[0]) {
          continue; // C'est probablement une relation, ignorer
        }
      }

      // Ignorer les objets complexes qui ne sont pas des options (relations)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if ('id' in value || 'email' in value || 'created_at' in value) {
          continue; // C'est probablement une relation (conseiller, etc.), ignorer
        }
      }

      const normalizedValue = normalizeValueForSave(value, key);
      // Ne pas inclure les valeurs null dans les données envoyées
      if (normalizedValue !== null) {
        normalized[key] = normalizedValue;
      }
    }
    return normalized;
  };

  const handleSave = async () => {
    // Sauvegarde sans validation - permet de sauvegarder des données partielles
    setSaving(true);
    try {
      // Normaliser les données pour s'assurer qu'on envoie des primitives, pas des objets
      const normalizedData = normalizeFormData(formData);
      await onSave(normalizedData);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAndDownload = async () => {
    // La génération de document nécessite les champs requis
    if (!validateForm()) {
      // Afficher un message plus explicite
      return;
    }
    setGenerating(true);
    try {
      // Normaliser les données avant génération
      const normalizedData = normalizeFormData(formData);
      await onGenerateAndDownload(normalizedData);
    } finally {
      setGenerating(false);
    }
  };

  const renderField = (field: DocumentField) => {
    // Normaliser la valeur pour s'assurer qu'on a une primitive, pas un objet
    const rawValue = formData[field.key];
    const value = normalizeValueForDisplay(rawValue, field.type);
    const hasError = !!errors[field.key];

    switch (field.type) {
      case 'select':
        // La valeur est maintenant garantie d'être une chaîne primitive
        const stringValue = typeof value === 'string' ? value : String(value || '');
        // Vérifier si la valeur actuelle est dans les options disponibles
        const isValueInOptions = !stringValue || field.options?.some(opt => opt.value === stringValue);
        const selectOptions = field.options || [];
        // Si la valeur n'est pas dans les options, l'ajouter temporairement (données legacy)
        const allOptions = (!isValueInOptions && stringValue)
          ? [...selectOptions, { value: stringValue, label: `${stringValue} (ancienne valeur)` }]
          : selectOptions;

        return (
          <FormControl fullWidth size="small" error={hasError}>
            <InputLabel>{field.label} {field.required && '*'}</InputLabel>
            <Select
              value={stringValue}
              label={`${field.label} ${field.required ? '*' : ''}`}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
            >
              {allOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {hasError && <Typography variant="caption" color="error">{errors[field.key]}</Typography>}
          </FormControl>
        );

      case 'boolean':
        // La value est déjà un booléen grâce à normalizeValueForDisplay avec fieldType='boolean'
        const boolValue = typeof value === 'boolean' ? value : false;
        return (
          <FormControlLabel
            control={
              <Switch
                checked={boolValue}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : ''}
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <FrenchDatePicker
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value as string | Date | null}
            onChange={(date) => handleFieldChange(field.key, date ? date.toISOString().split('T')[0] : '')}
            required={field.required}
            error={hasError}
            helperText={hasError ? errors[field.key] : ''}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : ''}
            inputProps={{ min: 0 }}
          />
        );

      case 'email':
        return (
          <TextField
            fullWidth
            type="email"
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : ''}
          />
        );

      case 'tel':
        return (
          <PhoneInput
            fullWidth
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value as string}
            onChange={(phoneValue) => handleFieldChange(field.key, phoneValue)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : undefined}
            required={field.required}
          />
        );

      case 'currency':
        return (
          <CurrencyInput
            fullWidth
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value as number | string | null}
            onChange={(numValue) => handleFieldChange(field.key, numValue)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : undefined}
            suffix={field.suffix}
          />
        );

      case 'percent':
        return (
          <PercentInput
            fullWidth
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value as number | string | null}
            onChange={(numValue) => handleFieldChange(field.key, numValue)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : undefined}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : ''}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Compter les champs remplis vs requis
  const requiredFields = fields.filter((f) => f.required);
  const filledRequiredFields = requiredFields.filter((f) => formData[f.key]);
  const progress = requiredFields.length > 0
    ? Math.round((filledRequiredFields.length / requiredFields.length) * 100)
    : 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '60vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GenerateIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {docInfo?.label || documentType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filledRequiredFields.length}/{requiredFields.length} champs obligatoires remplis
            </Typography>
          </Box>
          <Box sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: 3,
            borderColor: progress === 100 ? 'success.main' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="body2" fontWeight="bold" color={progress === 100 ? 'success.main' : 'primary.main'}>
              {progress}%
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Veuillez remplir tous les champs obligatoires
          </Alert>
        )}

        {sections.map((section, idx) => {
          // Section cotitulaire avec checkbox pour l'ouvrir/fermer
          const isCotitulaireSection = section.toLowerCase().includes('titulaire 2') || section.toLowerCase().includes('cotitulaire');

          if (isCotitulaireSection) {
            return (
              <Box key={section} sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showCotitulaire}
                      onChange={(e) => setShowCotitulaire(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="subtitle2" color="primary" fontWeight={600}>
                      Ajouter un cotitulaire
                    </Typography>
                  }
                  sx={{ mb: 1 }}
                />
                <Collapse in={showCotitulaire}>
                  <Grid container spacing={2}>
                    {fields
                      .filter((f) => f.section === section)
                      .map((field) => (
                        <Grid
                          item
                          xs={12}
                          sm={field.type === 'textarea' ? 12 : 6}
                          key={field.key}
                        >
                          {renderField(field)}
                        </Grid>
                      ))}
                  </Grid>
                </Collapse>
                {idx < sections.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            );
          }

          return (
            <Box key={section} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
                {section}
              </Typography>
              <Grid container spacing={2}>
                {fields
                  .filter((f) => f.section === section)
                  .map((field) => (
                    <Grid
                      item
                      xs={12}
                      sm={field.type === 'textarea' ? 12 : 6}
                      key={field.key}
                    >
                      {renderField(field)}
                    </Grid>
                  ))}
              </Grid>
              {idx < sections.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          );
        })}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />} disabled={saving || generating}>
          Fermer
        </Button>
        <Button
          onClick={handleSave}
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={loading || saving || generating}
          variant="outlined"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerateAndDownload}
          startIcon={generating ? <CircularProgress size={16} /> : <GenerateIcon />}
          disabled={loading || saving || generating}
        >
          {generating ? 'Génération...' : 'Générer & Télécharger'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
