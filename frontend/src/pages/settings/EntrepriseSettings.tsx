/**
 * EntrepriseSettings - Configuration du cabinet
 * Permet de configurer toutes les informations reglementaires du cabinet
 */

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Support as SupportIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { EntrepriseFormData, defaultEntrepriseFormData } from '../../types/entreprise';
import { getEntreprise, updateEntreprise } from '../../services/entrepriseApi';

const EntrepriseSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [expanded, setExpanded] = useState<string | false>('identification');

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EntrepriseFormData>({
    defaultValues: defaultEntrepriseFormData,
  });

  useEffect(() => {
    loadEntreprise();
  }, []);

  const loadEntreprise = async () => {
    try {
      setLoading(true);
      const data = await getEntreprise();
      if (data) {
        reset({
          nom: data.nom || '',
          forme_juridique: data.forme_juridique || '',
          capital: data.capital || '',
          adresse: data.adresse || '',
          code_postal: data.code_postal || '',
          ville: data.ville || '',
          pays: data.pays || 'France',
          numero_rcs: data.numero_rcs || '',
          ville_rcs: data.ville_rcs || '',
          numero_orias: data.numero_orias || '',
          siret: data.siret || '',
          siren: data.siren || '',
          code_ape: data.code_ape || '',
          numero_tva: data.numero_tva || '',
          association_cif: data.association_cif || '',
          numero_cif: data.numero_cif || '',
          assureur_rcp: data.assureur_rcp || '',
          numero_contrat_rcp: data.numero_contrat_rcp || '',
          representant_civilite: data.representant_civilite || 'M.',
          representant_nom: data.representant_nom || '',
          representant_prenom: data.representant_prenom || '',
          representant_qualite: data.representant_qualite || '',
          telephone: data.telephone || '',
          email: data.email || '',
          site_web: data.site_web || '',
          mediateur_nom: data.mediateur_nom || '',
          mediateur_adresse: data.mediateur_adresse || '',
          mediateur_email: data.mediateur_email || '',
          mediateur_site_web: data.mediateur_site_web || '',
        });
      }
    } catch (error) {
      console.error('Erreur chargement entreprise:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EntrepriseFormData) => {
    try {
      setSaving(true);
      await updateEntreprise(data);
      setSnackbar({
        open: true,
        message: 'Configuration enregistree avec succes',
        severity: 'success',
      });
      reset(data); // Reset isDirty
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'enregistrement',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAccordion = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Configuration du Cabinet"
        subtitle="Informations reglementaires et coordonnees de l'entreprise"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Ces informations seront utilisees automatiquement dans tous les documents generes.
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* IDENTIFICATION */}
        <Accordion expanded={expanded === 'identification'} onChange={handleAccordion('identification')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BusinessIcon color="primary" />
              <Typography variant="h6">Identification</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="nom"
                  control={control}
                  rules={{ required: 'Le nom est obligatoire' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom du cabinet"
                      fullWidth
                      required
                      error={!!errors.nom}
                      helperText={errors.nom?.message}
                      placeholder="LE FARE DE L'EPARGNE"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="forme_juridique"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Forme juridique"
                      fullWidth
                      placeholder="SARL, SAS, EURL..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="capital"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Capital social"
                      fullWidth
                      placeholder="1 000 000 XPF"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* ADRESSE */}
        <Accordion expanded={expanded === 'adresse'} onChange={handleAccordion('adresse')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationIcon color="primary" />
              <Typography variant="h6">Adresse</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="adresse"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Adresse"
                      fullWidth
                      placeholder="10 Rue du Commerce"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="code_postal"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Code postal"
                      fullWidth
                      placeholder="98713"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Controller
                  name="ville"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ville"
                      fullWidth
                      placeholder="Papeete"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="pays"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Pays"
                      fullWidth
                      placeholder="France"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* IMMATRICULATIONS */}
        <Accordion expanded={expanded === 'immatriculations'} onChange={handleAccordion('immatriculations')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BadgeIcon color="primary" />
              <Typography variant="h6">Immatriculations</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="numero_rcs"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Numero RCS"
                      fullWidth
                      placeholder="123 456 789"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="ville_rcs"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ville RCS"
                      fullWidth
                      placeholder="Papeete"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="numero_orias"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Numero ORIAS"
                      fullWidth
                      placeholder="12345678"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="siret"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SIRET"
                      fullWidth
                      placeholder="12345678901234"
                      inputProps={{ maxLength: 14 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="siren"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SIREN"
                      fullWidth
                      placeholder="123456789"
                      inputProps={{ maxLength: 9 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="code_ape"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Code APE/NAF"
                      fullWidth
                      placeholder="6622Z"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="numero_tva"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="TVA Intracommunautaire"
                      fullWidth
                      placeholder="FR12345678901"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* CIF */}
        <Accordion expanded={expanded === 'cif'} onChange={handleAccordion('cif')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <GavelIcon color="primary" />
              <Typography variant="h6">CIF - Conseiller en Investissements Financiers</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="association_cif"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Association professionnelle CIF"
                      fullWidth
                      placeholder="La Compagnie CIF"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="numero_cif"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Numero CIF"
                      fullWidth
                      placeholder="F-123456"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* ASSURANCE RCP */}
        <Accordion expanded={expanded === 'assurance'} onChange={handleAccordion('assurance')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6">Assurance RCP</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="assureur_rcp"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Assureur RCP"
                      fullWidth
                      placeholder="AXA, Allianz..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="numero_contrat_rcp"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Numero de contrat"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* REPRESENTANT LEGAL */}
        <Accordion expanded={expanded === 'representant'} onChange={handleAccordion('representant')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6">Representant Legal</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={2}>
                <Controller
                  name="representant_civilite"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Civilite"
                      fullWidth
                      SelectProps={{ native: true }}
                    >
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="representant_prenom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Prenom"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="representant_nom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="representant_qualite"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Qualite / Fonction"
                      fullWidth
                      placeholder="Gerant, PDG..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* CONTACT */}
        <Accordion expanded={expanded === 'contact'} onChange={handleAccordion('contact')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PhoneIcon color="primary" />
              <Typography variant="h6">Contact</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="telephone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telephone"
                      fullWidth
                      placeholder="+689 40 XX XX XX"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      type="email"
                      placeholder="contact@cabinet.pf"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="site_web"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Site web"
                      fullWidth
                      placeholder="https://www.cabinet.pf"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* MEDIATEUR */}
        <Accordion expanded={expanded === 'mediateur'} onChange={handleAccordion('mediateur')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SupportIcon color="primary" />
              <Typography variant="h6">Mediateur</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              Informations du mediateur de la consommation (obligatoire)
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="mediateur_nom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom du mediateur"
                      fullWidth
                      placeholder="Mediateur de l'AMF"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="mediateur_email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      type="email"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="mediateur_adresse"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Adresse du mediateur"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="mediateur_site_web"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Site web"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* BOUTON SAUVEGARDER */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => loadEntreprise()}
            disabled={!isDirty || saving}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EntrepriseSettings;
