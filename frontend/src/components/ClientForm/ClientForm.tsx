/**
 * Formulaire Client Complet - Proposition A: Parcours Intelligent
 * Conformité AMF/ACPR - MIF2 - SFDR
 * Le parcours client enrichi alimente automatiquement tous les documents
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Typography,
  Paper,
  Alert,
  Divider,
  FormControlLabel,
  Switch,
  LinearProgress,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  CheckCircle as CheckIcon,
  Description as DocIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

import {
  ClientFormData,
  defaultClientFormData,
} from '../../types/client';

// Import des sections
import SectionIdentite from './SectionIdentite';
import SectionFamiliale from './SectionFamiliale';
import SectionFinanciere from './SectionFinanciere';
import SectionOrigineFonds from './SectionOrigineFonds';
import SectionPatrimoine from './SectionPatrimoine';
import SectionKYC from './SectionKYC';
import SectionProfilRisque from './SectionProfilRisque';
import SectionDurabilite from './SectionDurabilite';
import SectionContexteMission from './SectionContexteMission';
import SectionRTO from './SectionRTO';

// Indicateurs de complétion des documents
import DocumentCompletionPanel from '../DocumentCompletionPanel';
import {
  calculateAllDocumentsCompletion,
  calculateOverallCompletion,
} from '../../utils/documentCompletion';

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onSaveDraft?: (data: ClientFormData) => Promise<void>;
  clientId?: string;
  mode?: 'create' | 'edit';
}

// Étapes du formulaire - Proposition A: Parcours unifié avec Mission
const steps = [
  { id: 'identite', label: 'Identité', description: 'Informations personnelles' },
  { id: 'famille', label: 'Famille', description: 'Situation familiale' },
  { id: 'finance', label: 'Finances', description: 'Situation financière' },
  { id: 'fonds', label: 'Origine Fonds', description: 'LCB-FT' },
  { id: 'patrimoine', label: 'Patrimoine', description: 'Détail des actifs' },
  { id: 'kyc', label: 'KYC', description: 'Connaissance & Expérience' },
  { id: 'risque', label: 'Profil Risque', description: 'Tolérance au risque' },
  { id: 'esg', label: 'ESG', description: 'Durabilité' },
  { id: 'mission', label: 'Mission', description: 'Contexte & Signature' },
];

// Mapping section -> step index pour navigation depuis les champs manquants
const SECTION_TO_STEP: Record<string, number> = {
  'Identité': 0,
  'Famille': 1,
  'Finances': 2,
  'Origine Fonds': 3,
  'Patrimoine': 4,
  'KYC': 5,
  'Profil Risque': 6,
  'ESG': 7,
  'Mission': 8,
};

export default function ClientForm({
  initialData,
  onSubmit,
  onSaveDraft,
  clientId,
  mode = 'create',
}: ClientFormProps) {
  // Theme et media queries
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // État local
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    titulaire1: true,
    titulaire2: false,
    famille: true,
    finance: true,
    fonds: true,
    patrimoine: true,
    kyc: true,
    risque: true,
    esg: true,
    mission: true,
    rto: false, // Collapsed par défaut car optionnel
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDocPanel, setShowDocPanel] = useState(!isMobile); // Panneau docs visible par défaut sur desktop

  // Formulaire
  const methods = useForm<ClientFormData>({
    defaultValues: {
      ...defaultClientFormData,
      ...initialData,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods;

  // Watch pour les champs conditionnels ET le calcul de complétion
  const hasTitulaire2 = watch('hasTitulaire2');
  const formData = watch(); // Observer toutes les données pour le calcul de complétion

  // Calcul de la complétion des documents en temps réel
  const documentCompletionResults = useMemo(() => {
    return calculateAllDocumentsCompletion(formData);
  }, [formData]);

  const overallCompletion = useMemo(() => {
    return calculateOverallCompletion(formData);
  }, [formData]);

  // Gestion des sections accordéon
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Navigation vers une section depuis le panneau de complétion
  const handleNavigateToSection = useCallback((section: string) => {
    const stepIndex = SECTION_TO_STEP[section];
    if (stepIndex !== undefined) {
      setActiveStep(stepIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (isMobile) {
        setShowDocPanel(false); // Fermer le drawer sur mobile
      }
    }
  }, [isMobile]);

  // Navigation avec scroll-to-top
  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sauvegarde brouillon
  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      const data = methods.getValues();
      await onSaveDraft(data);
    }
  };

  // Soumission finale
  const handleFormSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcul de la progression
  const progress = ((activeStep + 1) / steps.length) * 100;

  // Rendu du contenu de l'étape active
  // Proposition A: Plus d'étape "Documents" - les documents sont alimentés automatiquement
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Identité
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Identification du/des titulaire(s)
            </Typography>

            {/* Toggle Titulaire 2 */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={hasTitulaire2}
                    onChange={(e) => setValue('hasTitulaire2', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Compte joint / Co-titulaire
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activez cette option s'il y a un second titulaire (conjoint, partenaire...)
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            {/* Titulaire 1 */}
            <SectionIdentite
              control={control}
              errors={errors}
              titulaire="titulaire1"
              expanded={expandedSections.titulaire1}
              onExpandChange={() => toggleSection('titulaire1')}
            />

            {/* Titulaire 2 (si activé) */}
            {hasTitulaire2 && (
              <Box sx={{ mt: 2 }}>
                <SectionIdentite
                  control={control}
                  errors={errors}
                  titulaire="titulaire2"
                  expanded={expandedSections.titulaire2}
                  onExpandChange={() => toggleSection('titulaire2')}
                />
              </Box>
            )}
          </Box>
        );

      case 1: // Famille
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Situation Familiale
            </Typography>
            <SectionFamiliale
              control={control}
              errors={errors}
              expanded={expandedSections.famille}
              onExpandChange={() => toggleSection('famille')}
            />
          </Box>
        );

      case 2: // Finances
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Situation Financière et Patrimoniale
            </Typography>
            <SectionFinanciere
              control={control}
              errors={errors}
              expanded={expandedSections.finance}
              onExpandChange={() => toggleSection('finance')}
            />
          </Box>
        );

      case 3: // Origine des fonds
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Origine des Fonds (LCB-FT)
            </Typography>
            <SectionOrigineFonds
              control={control}
              errors={errors}
              expanded={expandedSections.fonds}
              onExpandChange={() => toggleSection('fonds')}
            />
          </Box>
        );

      case 4: // Patrimoine
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Patrimoine Détaillé
            </Typography>
            <SectionPatrimoine
              control={control}
              errors={errors}
              expanded={expandedSections.patrimoine}
              onExpandChange={() => toggleSection('patrimoine')}
            />
          </Box>
        );

      case 5: // KYC
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Connaissance et Expérience Client (KYC)
            </Typography>
            <SectionKYC
              control={control}
              errors={errors}
              expanded={expandedSections.kyc}
              onExpandChange={() => toggleSection('kyc')}
            />
          </Box>
        );

      case 6: // Profil de risque
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Profil de Risque
            </Typography>
            <SectionProfilRisque
              control={control}
              errors={errors}
              expanded={expandedSections.risque}
              onExpandChange={() => toggleSection('risque')}
            />
          </Box>
        );

      case 7: // ESG
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Préférences de Durabilité (ESG)
            </Typography>
            <SectionDurabilite
              control={control}
              errors={errors}
              expanded={expandedSections.esg}
              onExpandChange={() => toggleSection('esg')}
            />
          </Box>
        );

      case 8: // Mission
        return (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Contexte de Mission
            </Typography>
            <SectionContexteMission
              control={control}
              errors={errors}
              expanded={expandedSections.mission}
              onExpandChange={() => toggleSection('mission')}
            />

            {/* Section RTO - Convention Réception Transmission Ordres */}
            <Box sx={{ mt: 3 }}>
              <SectionRTO
                control={control}
                errors={errors}
                expanded={expandedSections.rto}
                onExpandChange={() => toggleSection('rto')}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Largeur du panneau de documents
  const docPanelWidth = 350;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <FormProvider {...methods}>
        <Box sx={{ display: 'flex' }}>
          {/* Zone principale du formulaire */}
          <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            sx={{
              flex: 1,
              transition: 'margin 0.3s ease',
              mr: showDocPanel && !isMobile ? `${docPanelWidth}px` : 0,
            }}
          >
            {/* En-tête avec progression et indicateurs documents */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {mode === 'create' ? 'Nouveau Client' : 'Modification Client'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {/* Indicateurs de complétion compacts */}
                  <DocumentCompletionPanel
                    completionResults={documentCompletionResults}
                    overallCompletion={overallCompletion}
                    variant="compact"
                  />

                  {onSaveDraft && (
                    <Button
                      variant="outlined"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveDraft}
                      disabled={isSubmitting || !isDirty}
                      size="small"
                    >
                      Sauvegarder
                    </Button>
                  )}

                  {/* Bouton toggle panneau documents (desktop) */}
                  {!isMobile && (
                    <IconButton
                      onClick={() => setShowDocPanel(!showDocPanel)}
                      sx={{ ml: 1 }}
                      title={showDocPanel ? 'Masquer le panneau' : 'Afficher le panneau'}
                    >
                      {showDocPanel ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progression: {Math.round(progress)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Étape {activeStep + 1} sur {steps.length}
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              {/* Stepper horizontal */}
              <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
                {steps.map((step, index) => (
                  <Step key={step.id} completed={index < activeStep}>
                    <StepButton onClick={() => handleStepClick(index)}>
                      <StepLabel
                        optional={
                          <Typography variant="caption" color="text.secondary">
                            {step.description}
                          </Typography>
                        }
                      >
                        {step.label}
                      </StepLabel>
                    </StepButton>
                  </Step>
                ))}
              </Stepper>

              {/* Stepper mobile (simplifié) */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {steps[activeStep].label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {steps[activeStep].description}
                </Typography>
              </Box>
            </Paper>

            {/* Erreur de soumission */}
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}

            {/* Contenu de l'étape */}
            <Paper sx={{ p: 3, mb: 3, minHeight: 400 }}>
              {renderStepContent()}
            </Paper>

            {/* Navigation */}
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Précédent
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={isSubmitting ? null : <CheckIcon />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enregistrement...' : 'Enregistrer et générer les documents'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      endIcon={<NextIcon />}
                      onClick={handleNext}
                    >
                      Suivant
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Panneau latéral des documents (Desktop) */}
          {!isMobile && showDocPanel && (
            <Paper
              sx={{
                position: 'fixed',
                right: 0,
                top: 64, // Hauteur de l'AppBar
                width: docPanelWidth,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                borderLeft: 1,
                borderColor: 'divider',
                zIndex: 1000,
              }}
            >
              <DocumentCompletionPanel
                completionResults={documentCompletionResults}
                overallCompletion={overallCompletion}
                onNavigateToSection={handleNavigateToSection}
                variant="full"
              />
            </Paper>
          )}

          {/* Drawer mobile pour le panneau des documents */}
          <Drawer
            anchor="right"
            open={isMobile && showDocPanel}
            onClose={() => setShowDocPanel(false)}
          >
            <Box sx={{ width: 320, height: '100%', overflow: 'auto' }}>
              <DocumentCompletionPanel
                completionResults={documentCompletionResults}
                overallCompletion={overallCompletion}
                onNavigateToSection={handleNavigateToSection}
                variant="full"
              />
            </Box>
          </Drawer>

          {/* FAB mobile pour ouvrir le panneau */}
          {isMobile && (
            <IconButton
              onClick={() => setShowDocPanel(true)}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 56,
                height: 56,
                boxShadow: 4,
              }}
            >
              <DocIcon />
            </IconButton>
          )}
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
}
