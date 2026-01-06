/**
 * Section Situation Financière
 * Conformité AMF/ACPR
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
  Slider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalance as FinanceIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch } from 'react-hook-form';
import { ClientFormData, TrancheRevenus, TranchePatrimoine } from '../../types/client';

interface SectionFinanciereProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const tranchesRevenus: { value: TrancheRevenus; label: string }[] = [
  { value: '<50000', label: 'Moins de 50 000 €' },
  { value: '50000-100000', label: 'De 50 000 € à 100 000 €' },
  { value: '100001-150000', label: 'De 100 001 € à 150 000 €' },
  { value: '150001-500000', label: 'De 150 001 € à 500 000 €' },
  { value: '>500000', label: 'Plus de 500 000 €' },
];

const tranchesPatrimoine: { value: TranchePatrimoine; label: string }[] = [
  { value: '<100000', label: 'Moins de 100 000 €' },
  { value: '100001-300000', label: 'De 100 001 € à 300 000 €' },
  { value: '300001-500000', label: 'De 300 001 € à 500 000 €' },
  { value: '500001-1000000', label: 'De 500 001 € à 1 000 000 €' },
  { value: '1000001-5000000', label: 'De 1 000 001 € à 5 000 000 €' },
  { value: '>5000000', label: 'Plus de 5 000 000 €' },
];

export default function SectionFinanciere({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionFinanciereProps) {
  // Watch pour calculer le total des pourcentages
  const financierPct = useWatch({ control, name: 'situationFinanciere.patrimoineFinancierPourcent' }) || 0;
  const immobilierPct = useWatch({ control, name: 'situationFinanciere.patrimoineImmobilierPourcent' }) || 0;
  const proPct = useWatch({ control, name: 'situationFinanciere.patrimoineProfessionnelPourcent' }) || 0;
  const autresPct = useWatch({ control, name: 'situationFinanciere.patrimoineAutresPourcent' }) || 0;

  const totalPct = Number(financierPct) + Number(immobilierPct) + Number(proPct) + Number(autresPct);
  const isValidTotal = totalPct === 0 || totalPct === 100;

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
          <FinanceIcon color="primary" />
          <Typography variant="h6">Situation Financière et Patrimoniale</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* FLUX FINANCIERS */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Flux financiers
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Revenus annuels */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="situationFinanciere.revenusAnnuelsFoyer"
              control={control}
              rules={{ required: 'Revenus annuels requis' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!getError('situationFinanciere.revenusAnnuelsFoyer')}>
                  <InputLabel>Revenus moyens annuels globaux du foyer fiscal *</InputLabel>
                  <Select {...field} label="Revenus moyens annuels globaux du foyer fiscal *">
                    {tranchesRevenus.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Patrimoine global */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="situationFinanciere.patrimoineGlobal"
              control={control}
              rules={{ required: 'Patrimoine global requis' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!getError('situationFinanciere.patrimoineGlobal')}>
                  <InputLabel>Estimation globale de votre patrimoine (dettes exclues) *</InputLabel>
                  <Select {...field} label="Estimation globale de votre patrimoine (dettes exclues) *">
                    {tranchesPatrimoine.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ENGAGEMENTS FINANCIERS */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Engagements financiers (dettes, charges, impôts...)
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="situationFinanciere.chargesAnnuellesPourcent"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="En % des revenus annuels"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="situationFinanciere.chargesAnnuellesMontant"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Montant annuel"
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

          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="situationFinanciere.capaciteEpargneMensuelle"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Capacité d'épargne mensuelle"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">€/mois</InputAdornment>,
                    inputProps: { min: 0 },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* RÉPARTITION DU PATRIMOINE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Répartition de votre patrimoine
        </Typography>

        {!isValidTotal && totalPct > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            La somme des pourcentages doit égaler 100%. Actuellement : {totalPct}%
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="situationFinanciere.patrimoineFinancierPourcent"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Actifs financiers"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 },
                  }}
                  helperText="Liquidités, comptes titres, assurance-vie..."
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="situationFinanciere.patrimoineImmobilierPourcent"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Actifs immobiliers"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 },
                  }}
                  helperText="Résidence principale, locatif, SCPI..."
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="situationFinanciere.patrimoineProfessionnelPourcent"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Actifs professionnels"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 },
                  }}
                  helperText="Parts sociales, fonds de commerce..."
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="situationFinanciere.patrimoineAutresPourcent"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Autres actifs"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 },
                  }}
                  helperText="Véhicules, objets d'art..."
                />
              )}
            />
          </Grid>
        </Grid>

        {/* Barre de visualisation */}
        {totalPct > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Visualisation de la répartition ({totalPct}%)
            </Typography>
            <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden' }}>
              {financierPct > 0 && (
                <Box
                  sx={{
                    width: `${(financierPct / totalPct) * 100}%`,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="white">
                    {financierPct}%
                  </Typography>
                </Box>
              )}
              {immobilierPct > 0 && (
                <Box
                  sx={{
                    width: `${(immobilierPct / totalPct) * 100}%`,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="white">
                    {immobilierPct}%
                  </Typography>
                </Box>
              )}
              {proPct > 0 && (
                <Box
                  sx={{
                    width: `${(proPct / totalPct) * 100}%`,
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="white">
                    {proPct}%
                  </Typography>
                </Box>
              )}
              {autresPct > 0 && (
                <Box
                  sx={{
                    width: `${(autresPct / totalPct) * 100}%`,
                    bgcolor: 'grey.500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="white">
                    {autresPct}%
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                <Typography variant="caption">Financier</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 0.5 }} />
                <Typography variant="caption">Immobilier</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: 0.5 }} />
                <Typography variant="caption">Professionnel</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'grey.500', borderRadius: 0.5 }} />
                <Typography variant="caption">Autres</Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* IMPOSITION */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Imposition
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="situationFinanciere.impotRevenu"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Assujetti à l'Impôt sur le Revenu (IR)"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="situationFinanciere.impotFortuneImmobiliere"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Assujetti à l'Impôt sur la Fortune Immobilière (IFI)"
                />
              )}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
