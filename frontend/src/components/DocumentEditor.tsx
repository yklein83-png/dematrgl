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

// ============================================
// DÉFINITION DES CHAMPS PAR TYPE DE DOCUMENT
// ============================================

export interface DocumentField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'boolean' | 'textarea' | 'email' | 'tel';
  section: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
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
    { key: 't1_telephone', label: 'Téléphone', type: 'tel', section: 'Titulaire 1 - Contact', required: true },
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

    // ==================== TITULAIRE 1 - FISCAL ====================
    { key: 't1_residence_fiscale', label: 'Pays de résidence fiscale', type: 'text', section: 'Titulaire 1 - Fiscal', required: true },
    { key: 't1_nif', label: 'N° d\'identification fiscale (NIF)', type: 'text', section: 'Titulaire 1 - Fiscal' },
    { key: 't1_us_person', label: 'US Person', type: 'boolean', section: 'Titulaire 1 - Fiscal' },

    // ==================== TITULAIRE 2 (OPTIONNEL) ====================
    { key: 't2_civilite', label: 'Civilité T2', type: 'select', section: 'Titulaire 2 (optionnel)', options: [
      { value: 'Monsieur', label: 'Monsieur' },
      { value: 'Madame', label: 'Madame' },
    ]},
    { key: 't2_nom', label: 'Nom T2', type: 'text', section: 'Titulaire 2 (optionnel)' },
    { key: 't2_prenom', label: 'Prénom T2', type: 'text', section: 'Titulaire 2 (optionnel)' },
    { key: 't2_date_naissance', label: 'Date de naissance T2', type: 'date', section: 'Titulaire 2 (optionnel)' },
    { key: 't2_lieu_naissance', label: 'Lieu de naissance T2', type: 'text', section: 'Titulaire 2 (optionnel)' },
    { key: 't2_nationalite', label: 'Nationalité T2', type: 'text', section: 'Titulaire 2 (optionnel)' },
    { key: 't2_profession', label: 'Profession T2', type: 'text', section: 'Titulaire 2 (optionnel)' },

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
    { key: 'regime_matrimonial', label: 'Régime matrimonial', type: 'select', section: 'Situation familiale', options: [
      { value: '', label: '-- Non concerné --' },
      { value: 'Communauté légale', label: 'Communauté réduite aux acquêts' },
      { value: 'Communauté universelle', label: 'Communauté universelle' },
      { value: 'Séparation de biens', label: 'Séparation de biens' },
      { value: 'Participation aux acquêts', label: 'Participation aux acquêts' },
    ]},
    { key: 'nombre_enfants', label: 'Nombre d\'enfants', type: 'number', section: 'Situation familiale' },
    { key: 'enfants_a_charge', label: 'Enfants à charge', type: 'number', section: 'Situation familiale' },
    { key: 'personnes_a_charge', label: 'Autres personnes à charge', type: 'number', section: 'Situation familiale' },

    // ==================== SITUATION FINANCIÈRE ====================
    // Options alignées sur le QCC officiel
    { key: 'revenus_annuels_foyer', label: 'Revenus annuels nets du foyer', type: 'select', section: 'Situation financière', required: true, options: [
      { value: '< 50 000 €', label: 'Moins de 50 000 €' },
      { value: '50 000 € - 100 000 €', label: '50 000 € à 100 000 €' },
      { value: '100 001 € - 150 000 €', label: '100 001 € à 150 000 €' },
      { value: '150 000 € - 500 000 €', label: '150 000 € à 500 000 €' },
      { value: '> 500 000 €', label: 'Plus de 500 000 €' },
    ]},
    { key: 'charges_annuelles_pourcent', label: 'Charges (% des revenus)', type: 'number', section: 'Situation financière' },
    { key: 'charges_annuelles_montant', label: 'Charges annuelles (€)', type: 'number', section: 'Situation financière' },
    { key: 'capacite_epargne_mensuelle', label: 'Capacité d\'épargne mensuelle (€)', type: 'number', section: 'Situation financière' },
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
    { key: 'origine_economique_epargne', label: 'Origine: Épargne', type: 'boolean', section: 'Origine des fonds', required: true },
    { key: 'origine_economique_heritage', label: 'Origine: Héritage/Donation', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_vente_immo', label: 'Origine: Vente immobilière', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_cession', label: 'Origine: Cession d\'entreprise', type: 'boolean', section: 'Origine des fonds' },
    { key: 'origine_economique_autre', label: 'Origine: Autre', type: 'text', section: 'Origine des fonds' },
    { key: 'montant_investi_prevu', label: 'Montant prévu à investir', type: 'number', section: 'Origine des fonds' },
    { key: 'origine_fonds', label: 'Détails origine des fonds', type: 'textarea', section: 'Origine des fonds', placeholder: 'Précisions sur l\'origine...' },

    // ==================== LCB-FT / CONFORMITÉ ====================
    { key: 'ppe', label: 'Personne Politiquement Exposée (PPE)', type: 'boolean', section: 'Conformité LCB-FT' },
    { key: 'ppe_lien', label: 'Lien avec une PPE', type: 'boolean', section: 'Conformité LCB-FT' },
    { key: 'ppe_fonction', label: 'Si PPE, fonction exercée', type: 'text', section: 'Conformité LCB-FT' },
    { key: 'beneficiaire_effectif', label: 'Bénéficiaire effectif = titulaire', type: 'boolean', section: 'Conformité LCB-FT' },
    { key: 'tiers_beneficiaire', label: 'Investit pour le compte d\'un tiers', type: 'boolean', section: 'Conformité LCB-FT' },
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
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Client', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Client', required: true },
    { key: 't1_adresse', label: 'Adresse', type: 'text', section: 'Client', required: true },
    { key: 'type_mission', label: 'Type de mission', type: 'select', section: 'Mission', required: true, options: [
      { value: 'Conseil ponctuel', label: 'Conseil ponctuel' },
      { value: 'Suivi régulier', label: 'Suivi régulier annuel' },
      { value: 'Gestion conseillée', label: 'Gestion conseillée' },
    ]},
    { key: 'perimetre_mission', label: 'Périmètre de la mission', type: 'textarea', section: 'Mission', placeholder: 'Décrire le périmètre...' },
    { key: 'honoraires', label: 'Honoraires', type: 'text', section: 'Honoraires', placeholder: 'Ex: 500€ HT ou 1% des actifs' },
  ],

  // DECLARATION_ADEQUATION - Justification du conseil
  DECLARATION_ADEQUATION: [
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Client', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Client', required: true },
    { key: 'profil_risque_calcule', label: 'Profil de risque validé', type: 'select', section: 'Profil', required: true, options: [
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
    { key: 't1_nom', label: 'Nom', type: 'text', section: 'Client', required: true },
    { key: 't1_prenom', label: 'Prénom', type: 'text', section: 'Client', required: true },
    { key: 'etablissement_teneur', label: 'Établissement teneur de compte', type: 'text', section: 'Compte', required: true },
    { key: 'numero_compte', label: 'Numéro de compte', type: 'text', section: 'Compte' },
    { key: 'mode_transmission', label: 'Mode de transmission des ordres', type: 'select', section: 'Ordres', options: [
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

  // Fonction pour transformer les données du formulaire de création vers le format DocumentEditor
  const transformFormDataToFlat = (formData: any): Record<string, any> => {
    const result: Record<string, any> = {};

    // Transformation des civilités
    const mapCivilite = (val: string) => {
      const map: Record<string, string> = { 'M': 'Monsieur', 'Mme': 'Madame', 'Monsieur': 'Monsieur', 'Madame': 'Madame' };
      return map[val] || val;
    };

    // Transformation des situations familiales
    const mapSituationFamiliale = (val: string) => {
      const map: Record<string, string> = {
        'marie': 'Marié(e)', 'pacse': 'Pacsé(e)', 'celibataire': 'Célibataire',
        'veuf': 'Veuf(ve)', 'divorce': 'Divorcé(e)', 'union_libre': 'Concubinage',
        'Marié(e)': 'Marié(e)', 'Pacsé(e)': 'Pacsé(e)', 'Célibataire': 'Célibataire',
        'Veuf(ve)': 'Veuf(ve)', 'Divorcé(e)': 'Divorcé(e)', 'Concubinage': 'Concubinage',
      };
      return map[val] || val;
    };

    // Titulaire 1
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
      result.t1_email = t1.email;
      result.t1_us_person = t1.usPerson;
      result.t1_residence_fiscale = t1.residenceFiscale;
      result.t1_nif = t1.numeroFiscal;
      result.t1_situation_pro = t1.situationProfessionnelle;
      result.t1_profession = t1.profession;
      result.t1_secteur_activite = t1.secteurActivite;
      result.t1_employeur = t1.employeur;
    }

    // Titulaire 2
    if (formData.hasTitulaire2 && formData.titulaire2) {
      const t2 = formData.titulaire2;
      result.t2_civilite = mapCivilite(t2.civilite);
      result.t2_nom = t2.nom;
      result.t2_prenom = t2.prenom;
      result.t2_date_naissance = t2.dateNaissance;
      result.t2_lieu_naissance = t2.lieuNaissance;
      result.t2_nationalite = t2.nationalite;
      result.t2_profession = t2.profession;
    }

    // Situation familiale
    if (formData.situationFamiliale) {
      const sf = formData.situationFamiliale;
      result.situation_familiale = mapSituationFamiliale(sf.situation);
      result.regime_matrimonial = sf.regimeMatrimonial;
      result.nombre_enfants = sf.nombreEnfants;
      result.enfants_a_charge = sf.nombreEnfantsACharge;
    }

    // Situation financière
    if (formData.situationFinanciere) {
      const fin = formData.situationFinanciere;
      result.revenus_annuels_foyer = fin.revenusAnnuelsFoyer;
      result.patrimoine_global = fin.patrimoineGlobal;
      result.charges_annuelles_pourcent = fin.chargesAnnuellesPourcent;
      result.charges_annuelles_montant = fin.chargesAnnuellesMontant;
      result.capacite_epargne_mensuelle = fin.capaciteEpargneMensuelle;
      result.impot_revenu = fin.impotRevenu;
      result.impot_fortune_immobiliere = fin.impotFortuneImmobiliere;
    }

    // Origine des fonds
    if (formData.origineFonds) {
      const of = formData.origineFonds;
      result.origine_economique_epargne = of.origineEpargne;
      result.origine_economique_heritage = of.origineHeritage;
      result.origine_economique_vente_immo = of.origineCessionImmo;
      result.origine_economique_cession = of.origineCessionPro;
      result.montant_investi_prevu = of.montantPrevu;
    }

    // Profil de risque
    if (formData.profilRisque) {
      const pr = formData.profilRisque;
      result.horizon_placement = pr.horizonPlacement;
      result.objectif_preservation = pr.objectifEpargneSecurite;
      result.objectif_valorisation = pr.objectifProjetVie;
      result.objectif_revenus = pr.objectifRevenuComplementaire;
      result.objectif_transmission = pr.objectifTransmission;
      result.objectif_fiscal = pr.objectifOptimisationFiscale;
      result.profil_risque_calcule = pr.profilValide;
      result.pertes_maximales_acceptables = pr.tolerancePerte ? `Maximum ${pr.tolerancePerte}%` : undefined;
      result.reaction_perte = pr.reactionBaisse;
    }

    // KYC
    if (formData.kyc) {
      const kyc = formData.kyc;
      result.experience_professionnelle_finance = kyc.experienceProfessionnelleFinance;
      result.lecture_presse_financiere = kyc.sourcesPresse;
      result.gestion_mandat = kyc.gestionParProfessionnel;
      result.gestion_conseiller = kyc.conseillerActuel;
    }

    // Durabilité
    if (formData.durabilite) {
      const dur = formData.durabilite;
      result.durabilite_integration = dur.interesseESG;
      result.durabilite_impact = dur.investissementImpact;
    }

    return result;
  };

  // Initialiser avec les données existantes du client
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
          <TextField
            fullWidth
            type="date"
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
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
          <TextField
            fullWidth
            type="tel"
            label={`${field.label} ${field.required ? '*' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            size="small"
            error={hasError}
            helperText={hasError ? errors[field.key] : ''}
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
