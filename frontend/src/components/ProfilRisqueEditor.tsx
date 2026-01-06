/**
 * ProfilRisqueEditor - Interface moderne de saisie du profil de risque
 * Conforme au questionnaire réglementaire AMF/ACPR
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Slider,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  useTheme,
  alpha,
  Fade,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Balance as BalanceIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Description as GenerateIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  EnergySavingsLeaf as EcoIcon,
  AccountBalance as BankIcon,
  ShowChart as ChartIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Types de profils de risque
const PROFILS_RISQUE = [
  {
    id: 'Sécuritaire',
    label: 'Sécuritaire',
    icon: SecurityIcon,
    color: '#4caf50',
    description: 'Sécurisation maximale des investissements',
    allocation: { securise: 80, modere: 15, dynamique: 5 },
    volatilite: '0% à 5%',
    perte_max: '5%',
  },
  {
    id: 'Prudent',
    label: 'Prudent',
    icon: ShieldIcon,
    color: '#2196f3',
    description: 'Sécurisation avec une part de diversification modérée',
    allocation: { securise: 60, modere: 30, dynamique: 10 },
    volatilite: '5% à 10%',
    perte_max: '15%',
  },
  {
    id: 'Équilibré',
    label: 'Équilibré',
    icon: BalanceIcon,
    color: '#ff9800',
    description: 'Croissance sur le long terme avec risque modéré',
    allocation: { securise: 40, modere: 35, dynamique: 25 },
    volatilite: '10% à 20%',
    perte_max: '30%',
  },
  {
    id: 'Dynamique',
    label: 'Dynamique',
    icon: TrendingUpIcon,
    color: '#f44336',
    description: 'Maximiser la performance avec risque élevé',
    allocation: { securise: 20, modere: 30, dynamique: 50 },
    volatilite: '> 20%',
    perte_max: '50% ou plus',
  },
];

// Catégories de produits financiers pour le KYC
const PRODUITS_FINANCIERS = [
  {
    id: 'monetaires',
    label: 'Produits monétaires et fonds euros',
    description: 'Livret A, PEL, Fonds euros, Comptes à terme',
    icon: BankIcon,
    questions: [
      { q: 'À moyen/long terme, ces produits offrent un rendement inférieur aux actifs risqués ?', correct: 'Vrai' },
      { q: 'Le risque de perte en capital est plus limité que les actifs risqués ?', correct: 'Vrai' },
    ],
  },
  {
    id: 'obligations',
    label: 'Obligations et fonds obligataires',
    description: 'Titres de créance, OPC obligataires',
    icon: ChartIcon,
    questions: [
      { q: 'Plus l\'émetteur est sain, plus le coupon est élevé ?', correct: 'Faux' },
      { q: 'Il y a un risque de perte en capital en cas de défaut de l\'émetteur ?', correct: 'Vrai' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions et fonds actions',
    description: 'Actions cotées, OPC actions, ETF actions',
    icon: TrendingUpIcon,
    questions: [
      { q: 'La valeur d\'une action peut chuter jusqu\'à 0€ ?', correct: 'Vrai' },
      { q: 'Il y a un risque de perte en capital ?', correct: 'Vrai' },
    ],
  },
  {
    id: 'scpi',
    label: 'SCPI / OPCI',
    description: 'Pierre-papier, immobilier collectif',
    icon: HomeIcon,
    questions: [
      { q: 'L\'investissement permet de mutualiser les risques immobiliers ?', correct: 'Vrai' },
      { q: 'Les investisseurs doivent trouver eux-mêmes un acquéreur pour vendre ?', correct: 'Faux' },
    ],
  },
  {
    id: 'pe',
    label: 'Private Equity',
    description: 'FCPI, FCPR, FIP - Capital investissement',
    icon: BusinessIcon,
    questions: [
      { q: 'C\'est un investissement risqué nécessitant plus de 8 ans de détention ?', correct: 'Vrai' },
      { q: 'Il y a un risque de perte en capital par défaut de l\'émetteur ?', correct: 'Vrai' },
    ],
  },
];

// Objectifs d'investissement
const OBJECTIFS = [
  { id: 'preservation', label: 'Préservation du capital', description: 'Protéger votre épargne' },
  { id: 'valorisation', label: 'Valorisation du capital', description: 'Faire fructifier votre patrimoine' },
  { id: 'diversification', label: 'Diversification', description: 'Répartir les risques' },
  { id: 'revenus', label: 'Revenus complémentaires', description: 'Générer des revenus réguliers' },
  { id: 'transmission', label: 'Transmission', description: 'Préparer votre succession' },
  { id: 'fiscal', label: 'Optimisation fiscale', description: 'Réduire votre imposition' },
];

// Critères ESG
const CRITERES_ESG = [
  { id: 'gaz_effet_serre', label: 'Gaz à effet de serre', category: 'Environnement' },
  { id: 'biodiversite', label: 'Biodiversité', category: 'Environnement' },
  { id: 'emissions_eau', label: 'Émissions polluantes eau', category: 'Environnement' },
  { id: 'dechets', label: 'Déchets dangereux', category: 'Environnement' },
  { id: 'energie', label: 'Efficacité énergétique', category: 'Environnement' },
  { id: 'normes_internationales', label: 'Normes OCDE/ONU', category: 'Social' },
  { id: 'egalite_remuneration', label: 'Égalité H/F', category: 'Social' },
  { id: 'diversite_genres', label: 'Diversité conseil admin.', category: 'Gouvernance' },
  { id: 'armes_controversees', label: 'Armes controversées', category: 'Exclusions' },
];

interface ProfilRisqueEditorProps {
  open: boolean;
  onClose: () => void;
  clientData?: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  onGenerateAndDownload: (data: Record<string, any>) => Promise<void>;
}

export default function ProfilRisqueEditor({
  open,
  onClose,
  clientData = {},
  onSave,
  onGenerateAndDownload,
}: ProfilRisqueEditorProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | false>(false);

  // Sections du questionnaire
  const steps = [
    { label: 'Objectifs', description: 'Vos objectifs d\'investissement' },
    { label: 'Tolérance', description: 'Votre tolérance au risque' },
    { label: 'Expérience', description: 'Connaissance des produits financiers' },
    { label: 'Durabilité', description: 'Préférences ESG' },
    { label: 'Synthèse', description: 'Votre profil de risque' },
  ];

  // Initialisation
  useEffect(() => {
    if (open && clientData) {
      setFormData({ ...clientData });
      setActiveStep(0);
    }
  }, [open, clientData]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  // Normalise les données avant envoi au backend
  const normalizeFormData = (data: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};

    // Liste des champs booléens connus
    const booleanFields = [
      't1_us_person', 't2_us_person', 'ppe', 'ppe_lien', 'impot_revenu', 'impot_fortune_immobiliere',
      'credit_immobilier', 'beneficiaire_effectif', 'tiers_beneficiaire', 'accepte_volatilite',
      'experience_perte', 'liquidite_importante', 'durabilite_integration', 'durabilite_impact',
      'durabilite_taxonomie', 'durabilite_souhait', 'durabilite_investissement_impact',
      'durabilite_investissement_solidaire', 'durabilite_confirmation',
      // KYC detention fields
      'kyc_monetaires_detention', 'kyc_obligations_detention', 'kyc_actions_detention',
      'kyc_scpi_detention', 'kyc_pe_detention', 'kyc_etf_detention', 'kyc_derives_detention',
      'kyc_structures_detention', 'kyc_portefeuille_mandat', 'kyc_portefeuille_gestion_personnelle',
      'kyc_portefeuille_gestion_conseiller', 'kyc_portefeuille_experience_pro',
      'kyc_culture_presse_financiere', 'kyc_culture_suivi_bourse', 'kyc_culture_releves_bancaires',
      // ESG fields
      'esg_gaz_effet_serre', 'esg_biodiversite', 'esg_emissions_eau', 'esg_dechets', 'esg_energie',
      'esg_normes_internationales', 'esg_egalite_remuneration', 'esg_diversite_genres', 'esg_armes_controversees',
      // Objectifs
      'objectif_preservation', 'objectif_valorisation', 'objectif_diversification',
      'objectif_revenus', 'objectif_transmission', 'objectif_fiscal',
    ];

    // Liste des champs string
    const stringFields = [
      'profil_risque_calcule', 'tolerance_risque', 'horizon_placement', 'pertes_maximales_acceptables',
      'reaction_perte', 'objectifs_investissement', 'besoin_liquidite', 'experience_investissement',
      'kyc_monetaires_q1', 'kyc_monetaires_q2', 'kyc_obligations_q1', 'kyc_obligations_q2',
      'kyc_actions_q1', 'kyc_actions_q2', 'kyc_scpi_q1', 'kyc_scpi_q2', 'kyc_pe_q1', 'kyc_pe_q2',
      'kyc_monetaires_operations', 'kyc_monetaires_duree', 'kyc_monetaires_volume',
      'kyc_obligations_operations', 'kyc_obligations_duree', 'kyc_obligations_volume',
      'kyc_actions_operations', 'kyc_actions_duree', 'kyc_actions_volume',
      'kyc_scpi_operations', 'kyc_scpi_duree', 'kyc_scpi_volume',
      'kyc_pe_operations', 'kyc_pe_duree', 'kyc_pe_volume',
      'objectif_preservation_priorite', 'objectif_valorisation_priorite', 'objectif_diversification_priorite',
      'objectif_revenus_priorite', 'objectif_transmission_priorite', 'objectif_fiscal_priorite',
    ];

    // Liste des champs entiers
    const integerFields = [
      'durabilite_part_minimum', 'durabilite_taxonomie_pourcent',
      'durabilite_importance_environnement', 'durabilite_importance_social', 'durabilite_importance_gouvernance',
      'profil_risque_score', 'annees_experience',
    ];

    for (const [key, value] of Object.entries(data)) {
      // Ignorer les valeurs null, undefined ou chaînes vides
      if (value === null || value === undefined || value === '') {
        continue;
      }

      // Convertir les booléens
      if (booleanFields.includes(key)) {
        if (typeof value === 'boolean') {
          result[key] = value;
        } else if (typeof value === 'string') {
          result[key] = value.toLowerCase() === 'true' || value.toLowerCase() === 'oui' || value === '1';
        } else {
          result[key] = Boolean(value);
        }
      }
      // Convertir les strings
      else if (stringFields.includes(key)) {
        result[key] = String(value);
      }
      // Convertir les entiers
      else if (integerFields.includes(key)) {
        const num = parseInt(String(value), 10);
        if (!isNaN(num)) {
          result[key] = num;
        }
      }
      // Conserver les autres valeurs telles quelles
      else {
        result[key] = value;
      }
    }

    return result;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalizedData = normalizeFormData(formData);
      await onSave(normalizedData);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const normalizedData = normalizeFormData(formData);
      await onGenerateAndDownload(normalizedData);
    } finally {
      setGenerating(false);
    }
  };

  // Calcul du score de risque basé sur les réponses
  const calculateRiskScore = (): string => {
    let score = 0;

    // Score basé sur la perte maximale acceptable
    const perteMax = formData.pertes_maximales_acceptables;
    if (perteMax === 'Aucune') score += 0;
    else if (perteMax === 'Maximum 10%') score += 1;
    else if (perteMax === 'Maximum 25%') score += 2;
    else if (perteMax === 'Maximum 50%') score += 3;
    else if (perteMax === 'Jusqu\'à 100%') score += 4;

    // Score basé sur l'horizon de placement
    const horizon = formData.horizon_placement;
    if (horizon === '< 1 an') score += 0;
    else if (horizon === '1 - 3 ans') score += 1;
    else if (horizon === '3 - 5 ans') score += 2;
    else if (horizon === '> 5 ans') score += 3;

    // Score basé sur la réaction en cas de baisse
    const reaction = formData.reaction_perte;
    if (reaction === 'Vendre tout') score += 0;
    else if (reaction === 'Vendre partie') score += 1;
    else if (reaction === 'Ne rien changer') score += 2;
    else if (reaction === 'Investir plus') score += 3;

    // Déterminer le profil
    if (score <= 2) return 'Sécuritaire';
    if (score <= 5) return 'Prudent';
    if (score <= 8) return 'Équilibré';
    return 'Dynamique';
  };

  // Calcul de la progression globale
  const calculateProgress = (): number => {
    const requiredFields = [
      'horizon_placement',
      'pertes_maximales_acceptables',
      'reaction_perte',
      'profil_risque_calcule',
    ];
    const filled = requiredFields.filter((f) => formData[f]).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  // Rendu de la section Objectifs
  const renderObjectifsSection = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Quels sont vos objectifs d'investissement ?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sélectionnez vos objectifs et ordonnez-les par priorité (1 = le plus important)
      </Typography>

      <Grid container spacing={2}>
        {OBJECTIFS.map((obj) => {
          const isSelected = formData[`objectif_${obj.id}`];
          const priority = formData[`objectif_${obj.id}_priorite`] || '';

          return (
            <Grid item xs={12} sm={6} key={obj.id}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <CardActionArea
                  onClick={() => handleFieldChange(`objectif_${obj.id}`, !isSelected)}
                  sx={{ p: 2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox checked={isSelected || false} color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{obj.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {obj.description}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <FormControl size="small" sx={{ width: 70 }}>
                        <select
                          value={priority}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFieldChange(`objectif_${obj.id}_priorite`, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                          }}
                        >
                          <option value="">N°</option>
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </FormControl>
                    )}
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Horizon de placement
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={formData.horizon_placement || ''}
            onChange={(e) => handleFieldChange('horizon_placement', e.target.value)}
          >
            <Grid container spacing={1}>
              {['< 1 an', '1 - 3 ans', '3 - 5 ans', '> 5 ans'].map((option) => (
                <Grid item xs={6} sm={3} key={option}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderColor: formData.horizon_placement === option ? 'primary.main' : 'divider',
                      bgcolor: formData.horizon_placement === option ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                    onClick={() => handleFieldChange('horizon_placement', option)}
                  >
                    <FormControlLabel
                      value={option}
                      control={<Radio size="small" />}
                      label={option}
                      sx={{ m: 0 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Part du patrimoine à investir
        </Typography>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={formData.pourcentage_patrimoine_investi || ''}
            onChange={(e) => handleFieldChange('pourcentage_patrimoine_investi', e.target.value)}
          >
            <Grid container spacing={1}>
              {['< 10%', '10% - 25%', '25% - 50%', '50% - 75%', '> 75%'].map((option) => (
                <Grid item xs={6} sm={2.4} key={option}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderColor: formData.pourcentage_patrimoine_investi === option ? 'primary.main' : 'divider',
                      bgcolor: formData.pourcentage_patrimoine_investi === option ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    }}
                    onClick={() => handleFieldChange('pourcentage_patrimoine_investi', option)}
                  >
                    <Typography variant="body2">{option}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );

  // Rendu de la section Tolérance au risque
  const renderToleranceSection = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Quel placement vous convient le mieux ?
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { value: 'A', label: 'Placement A', desc: 'Risque faible, protection du capital, diversification partielle', color: '#4caf50' },
          { value: 'B', label: 'Placement B', desc: 'Risque moyen, diversification significative, recherche de valorisation', color: '#ff9800' },
          { value: 'C', label: 'Placement C', desc: 'Risque élevé, maximiser la performance, perte partielle/totale possible', color: '#f44336' },
        ].map((opt) => (
          <Grid item xs={12} md={4} key={opt.value}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderColor: formData.placement_preference === opt.value ? opt.color : 'divider',
                borderWidth: formData.placement_preference === opt.value ? 2 : 1,
                cursor: 'pointer',
                '&:hover': { borderColor: opt.color },
              }}
              onClick={() => handleFieldChange('placement_preference', opt.value)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: opt.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {opt.value}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2">{opt.label}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {opt.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        En cas de baisse de 20% de votre investissement, vous :
      </Typography>
      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
        <RadioGroup
          value={formData.reaction_perte || ''}
          onChange={(e) => handleFieldChange('reaction_perte', e.target.value)}
        >
          {[
            { value: 'Vendre tout', label: 'Vendez tout pour réinvestir sur du moins risqué' },
            { value: 'Vendre partie', label: 'Vendez une partie pour réinvestir sur du moins risqué' },
            { value: 'Ne rien changer', label: 'Ne changez rien' },
            { value: 'Investir plus', label: 'Investissez davantage pour profiter des opportunités' },
          ].map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio />}
              label={opt.label}
              sx={{
                p: 1,
                m: 0.5,
                borderRadius: 1,
                bgcolor: formData.reaction_perte === opt.value ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Perte maximale acceptable sur votre investissement
      </Typography>
      <Grid container spacing={1}>
        {[
          { value: 'Aucune', color: '#4caf50' },
          { value: 'Maximum 10%', color: '#8bc34a' },
          { value: 'Maximum 25%', color: '#ff9800' },
          { value: 'Maximum 50%', color: '#ff5722' },
          { value: 'Jusqu\'à 100%', color: '#f44336' },
        ].map((opt) => (
          <Grid item xs={6} sm={2.4} key={opt.value}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: formData.pertes_maximales_acceptables === opt.value ? opt.color : 'divider',
                borderWidth: formData.pertes_maximales_acceptables === opt.value ? 2 : 1,
                '&:hover': { borderColor: opt.color },
              }}
              onClick={() => handleFieldChange('pertes_maximales_acceptables', opt.value)}
            >
              <Typography variant="body2" fontWeight={formData.pertes_maximales_acceptables === opt.value ? 600 : 400}>
                {opt.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Rendu de la section Expérience/KYC
  const renderExperienceSection = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Votre expérience des produits financiers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pour chaque catégorie, indiquez votre niveau d'expérience
      </Typography>

      {PRODUITS_FINANCIERS.map((produit) => {
        const ProductIcon = produit.icon;
        const detentionKey = `kyc_${produit.id}_detention`;
        const hasDetention = formData[detentionKey];

        return (
          <Accordion
            key={produit.id}
            expanded={expandedProduct === produit.id}
            onChange={(_, isExpanded) => setExpandedProduct(isExpanded ? produit.id : false)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <ProductIcon color={hasDetention ? 'primary' : 'disabled'} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{produit.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {produit.description}
                  </Typography>
                </Box>
                {hasDetention && (
                  <Chip label="Expérience" size="small" color="primary" variant="outlined" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={hasDetention || false}
                        onChange={(e) => handleFieldChange(detentionKey, e.target.checked)}
                      />
                    }
                    label="J'ai déjà détenu ce type de produit"
                  />
                </Grid>

                <Collapse in={hasDetention} sx={{ width: '100%' }}>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Nombre d'opérations/an
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                        <select
                          value={formData[`kyc_${produit.id}_operations`] || ''}
                          onChange={(e) => handleFieldChange(`kyc_${produit.id}_operations`, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="">Sélectionner</option>
                          <option value="< 1">Moins d'1 par an</option>
                          <option value="1 - 5">De 1 à 5 par an</option>
                          <option value="> 6">Plus de 6 par an</option>
                        </select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Durée de détention
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                        <select
                          value={formData[`kyc_${produit.id}_duree`] || ''}
                          onChange={(e) => handleFieldChange(`kyc_${produit.id}_duree`, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="">Sélectionner</option>
                          <option value="< 4 ans">Moins de 4 ans</option>
                          <option value="> 4 ans">Plus de 4 ans</option>
                        </select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Volume des opérations
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                        <select
                          value={formData[`kyc_${produit.id}_volume`] || ''}
                          onChange={(e) => handleFieldChange(`kyc_${produit.id}_volume`, e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="">Sélectionner</option>
                          <option value="< 5000">Moins de 5 000€</option>
                          <option value="5000 - 10000">5 000€ à 10 000€</option>
                          <option value="> 10000">Plus de 10 000€</option>
                          <option value="> 50000">Plus de 50 000€</option>
                        </select>
                      </FormControl>
                    </Grid>

                    {/* Questions de connaissance */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Questions de connaissance
                      </Typography>
                      {produit.questions.map((q, idx) => (
                        <Box key={idx} sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {q.q}
                          </Typography>
                          <FormControl component="fieldset">
                            <RadioGroup
                              row
                              value={formData[`kyc_${produit.id}_q${idx + 1}`] || ''}
                              onChange={(e) => handleFieldChange(`kyc_${produit.id}_q${idx + 1}`, e.target.value)}
                            >
                              {['Vrai', 'Faux', 'NSP'].map((opt) => (
                                <FormControlLabel
                                  key={opt}
                                  value={opt}
                                  control={<Radio size="small" />}
                                  label={opt === 'NSP' ? 'Je ne sais pas' : opt}
                                />
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Culture financière générale
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.lecture_presse_financiere || false}
                  onChange={(e) => handleFieldChange('lecture_presse_financiere', e.target.checked)}
                />
              }
              label="Je lis régulièrement la presse ou l'actualité financière"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.suivi_bourse || false}
                  onChange={(e) => handleFieldChange('suivi_bourse', e.target.checked)}
                />
              }
              label="Je regarde régulièrement les cours de la Bourse"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.experience_professionnelle_finance || false}
                  onChange={(e) => handleFieldChange('experience_professionnelle_finance', e.target.checked)}
                />
              }
              label="J'ai occupé un poste dans le secteur financier (> 1 an)"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  // Rendu de la section ESG
  const renderESGSection = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <EcoIcon color="success" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6">Préférences en matière de durabilité</Typography>
          <Typography variant="body2" color="text.secondary">
            Règlement SFDR - Investissement responsable
          </Typography>
        </Box>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.durabilite_integration || false}
                onChange={(e) => handleFieldChange('durabilite_integration', e.target.checked)}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="subtitle2">
                  Je souhaite intégrer des critères de durabilité ESG dans mes investissements
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Environnement, Social, Gouvernance
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      <Collapse in={formData.durabilite_integration}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Part d'investissements alignés Taxonomie UE
            </Typography>
            <FormControl fullWidth size="small">
              <select
                value={formData.durabilite_taxonomie_part || ''}
                onChange={(e) => handleFieldChange('durabilite_taxonomie_part', e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Sélectionner</option>
                <option value="Aucun">Aucune exigence</option>
                <option value=">= 5%">Au moins 5%</option>
                <option value=">= 25%">Au moins 25%</option>
                <option value=">= 50%">Au moins 50%</option>
              </select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Part en investissements durables
            </Typography>
            <FormControl fullWidth size="small">
              <select
                value={formData.durabilite_investissement_part || ''}
                onChange={(e) => handleFieldChange('durabilite_investissement_part', e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Sélectionner</option>
                <option value="Aucun">Aucune exigence</option>
                <option value=">= 5%">Au moins 5%</option>
                <option value=">= 25%">Au moins 25%</option>
                <option value=">= 50%">Au moins 50%</option>
              </select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Critères à minimiser dans vos investissements
            </Typography>
            <Grid container spacing={1}>
              {CRITERES_ESG.map((critere) => (
                <Grid item xs={12} sm={6} md={4} key={critere.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData[`esg_${critere.id}`] || false}
                        onChange={(e) => handleFieldChange(`esg_${critere.id}`, e.target.checked)}
                        size="small"
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{critere.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {critere.category}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );

  // Rendu de la section Synthèse
  const renderSyntheseSection = () => {
    const calculatedProfile = calculateRiskScore();
    const selectedProfile = PROFILS_RISQUE.find((p) => p.id === calculatedProfile);
    const ProfileIcon = selectedProfile?.icon || SecurityIcon;

    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Basé sur vos réponses, votre profil de risque suggéré est calculé automatiquement.
            Vous pouvez le valider ou le modifier si nécessaire.
          </Typography>
        </Alert>

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Profil suggéré
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {PROFILS_RISQUE.map((profil) => {
            const Icon = profil.icon;
            const isCalculated = profil.id === calculatedProfile;
            const isSelected = formData.profil_risque_calcule === profil.id;

            return (
              <Grid item xs={12} sm={6} md={3} key={profil.id}>
                <Card
                  variant={isSelected ? 'elevation' : 'outlined'}
                  elevation={isSelected ? 8 : 0}
                  sx={{
                    height: '100%',
                    borderColor: isSelected ? profil.color : isCalculated ? alpha(profil.color, 0.5) : 'divider',
                    borderWidth: isSelected || isCalculated ? 2 : 1,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: profil.color,
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => handleFieldChange('profil_risque_calcule', profil.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: alpha(profil.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: profil.color }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: profil.color }}>
                      {profil.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40 }}>
                      {profil.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" display="block">
                      Volatilité: {profil.volatilite}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Perte max: {profil.perte_max}
                    </Typography>
                    {isCalculated && (
                      <Chip
                        label="Suggéré"
                        size="small"
                        color="primary"
                        sx={{ mt: 2 }}
                      />
                    )}
                    {isSelected && (
                      <CheckIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: profil.color,
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {formData.profil_risque_calcule && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Part maximale d'actifs à risque élevé
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={formData.profil_part_actifs_risques || 0}
                onChange={(_, value) => handleFieldChange('profil_part_actifs_risques', value)}
                valueLabelDisplay="on"
                valueLabelFormat={(v) => `${v}%`}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                ]}
                sx={{
                  color: selectedProfile?.color,
                  '& .MuiSlider-thumb': {
                    bgcolor: selectedProfile?.color,
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Rendu du contenu selon l'étape
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderObjectifsSection();
      case 1:
        return renderToleranceSection();
      case 2:
        return renderExperienceSection();
      case 3:
        return renderESGSection();
      case 4:
        return renderSyntheseSection();
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ChartIcon color="primary" />
            <Box>
              <Typography variant="h6">Profil de Risque</Typography>
              <Typography variant="caption" color="text.secondary">
                Questionnaire conforme AMF/ACPR
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ minWidth: 100 }}>
              <Typography variant="caption" color="text.secondary">
                Progression
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Stepper latéral */}
          <Box sx={{ minWidth: 200, display: { xs: 'none', md: 'block' } }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    onClick={() => setActiveStep(index)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="subtitle2">{step.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Contenu principal */}
          <Box sx={{ flex: 1, minHeight: 400 }}>
            <Fade in key={activeStep}>
              <Box>{renderStepContent(activeStep)}</Box>
            </Fade>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<PrevIcon />}
        >
          Précédent
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Fermer
        </Button>
        <Button
          onClick={handleSave}
          variant="outlined"
          startIcon={<SaveIcon />}
          disabled={saving}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<NextIcon />}
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            variant="contained"
            color="success"
            startIcon={<GenerateIcon />}
            disabled={generating || !formData.profil_risque_calcule}
          >
            {generating ? 'Génération...' : 'Générer le document'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
