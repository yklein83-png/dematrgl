/**
 * Section Origine des Fonds - LCB-FT
 * Conformité Lutte Contre le Blanchiment et Financement du Terrorisme
 */

import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  InputAdornment,
  FormGroup,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch } from 'react-hook-form';
import { ClientFormData } from '../../types/client';

interface SectionOrigineFondsProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

export default function SectionOrigineFonds({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionOrigineFondsProps) {
  // Watch pour affichage conditionnel
  const origineAutres = useWatch({ control, name: 'origineFonds.origineAutres' });

  // Vérifier si au moins une origine est sélectionnée
  const origineRevenus = useWatch({ control, name: 'origineFonds.origineRevenus' });
  const origineEpargne = useWatch({ control, name: 'origineFonds.origineEpargne' });
  const origineHeritage = useWatch({ control, name: 'origineFonds.origineHeritage' });
  const origineCessionPro = useWatch({ control, name: 'origineFonds.origineCessionPro' });
  const origineCessionImmo = useWatch({ control, name: 'origineFonds.origineCessionImmo' });
  const origineCessionMobiliere = useWatch({ control, name: 'origineFonds.origineCessionMobiliere' });
  const origineGainsJeu = useWatch({ control, name: 'origineFonds.origineGainsJeu' });
  const origineAssuranceVie = useWatch({ control, name: 'origineFonds.origineAssuranceVie' });

  const hasOrigineSelected =
    origineRevenus ||
    origineEpargne ||
    origineHeritage ||
    origineCessionPro ||
    origineCessionImmo ||
    origineCessionMobiliere ||
    origineGainsJeu ||
    origineAssuranceVie ||
    (origineAutres && origineAutres.length > 0);

  const getError = (field: string) => {
    const parts = field.split('.');
    let error: any = errors;
    for (const part of parts) {
      error = error?.[part];
    }
    return error;
  };

  return (
    <Accordion expanded={expanded} onChange={(_, exp) => onExpandChange(exp)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Origine des Fonds (LCB-FT)</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={500}>
            Obligation réglementaire LCB-FT
          </Typography>
          <Typography variant="body2">
            Conformément à la réglementation sur la lutte contre le blanchiment de capitaux et le financement
            du terrorisme, nous devons identifier l'origine des fonds que vous souhaitez investir.
          </Typography>
        </Alert>

        {/* NATURE DES AVOIRS */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Nature des avoirs à investir
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="origineFonds.nature"
              control={control}
              rules={{ required: 'Nature des avoirs requise' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!getError('origineFonds.nature')}>
                  <InputLabel>Nature des avoirs *</InputLabel>
                  <Select {...field} label="Nature des avoirs *">
                    <MenuItem value="liquidites">Liquidités</MenuItem>
                    <MenuItem value="instruments_financiers">Instruments financiers</MenuItem>
                    <MenuItem value="les_deux">Les deux</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="origineFonds.montantPrevu"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Montant prévu des avoirs à investir"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    inputProps: { min: 0 },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ORIGINE ÉCONOMIQUE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Origine économique de ces avoirs *
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cochez toutes les origines applicables
        </Typography>

        {!hasOrigineSelected && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Vous devez sélectionner au moins une origine économique
          </Alert>
        )}

        <Grid container spacing={1} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineRevenus"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Revenus professionnels"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineEpargne"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Épargne constituée"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineHeritage"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Héritage / Donation / Succession"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineCessionPro"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Cession(s) d'actifs professionnels"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineCessionImmo"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Cession(s) immobilière(s)"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineCessionMobiliere"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Cession(s) mobilière(s)"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineGainsJeu"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Gains de jeu"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="origineFonds.origineAssuranceVie"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Rachat assurance-vie"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="origineFonds.origineAutres"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Autres origines (précisez)"
                  size="small"
                  fullWidth
                  placeholder="Ex: Indemnité de licenciement, vente de parts sociales..."
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* PROVENANCE DES FONDS */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Provenance des fonds
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Établissement bancaire d'où proviendront les fonds
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Controller
              name="origineFonds.etablissementBancaireOrigine"
              control={control}
              rules={{ required: 'Établissement bancaire requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nom de l'établissement bancaire d'origine *"
                  size="small"
                  fullWidth
                  placeholder="Ex: Banque de Polynésie, Socredo, Banque de Tahiti..."
                  error={!!getError('origineFonds.etablissementBancaireOrigine')}
                  helperText={getError('origineFonds.etablissementBancaireOrigine')?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
