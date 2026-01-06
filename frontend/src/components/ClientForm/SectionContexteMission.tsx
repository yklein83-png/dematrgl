/**
 * Section Contexte de Mission
 * Collecte les informations pour la Lettre de Mission et le DER
 * Type de prestation, mode de conseil, instruments, rémunération
 */

import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  InputAdornment,
  Chip,
  Paper,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as MissionIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch } from 'react-hook-form';
import {
  ClientFormData,
  TypePrestation,
  ModeConseil,
  ModeRemuneration,
  FrequenceSuivi,
  InstrumentFinancier
} from '../../types/client';

interface SectionContexteMissionProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const typesPrestations: { value: TypePrestation; label: string; description: string }[] = [
  {
    value: 'diagnostic',
    label: 'Diagnostic patrimonial',
    description: 'Analyse complète de votre situation sans recommandation de produits'
  },
  {
    value: 'assistance_suivi',
    label: 'Assistance & Suivi',
    description: 'Accompagnement et suivi régulier de vos investissements existants'
  },
  {
    value: 'conseil_investissement',
    label: 'Conseil en investissement',
    description: 'Recommandations personnalisées de produits financiers'
  },
];

const modesConseil: { value: ModeConseil; label: string; description: string }[] = [
  {
    value: 'independant',
    label: 'Conseil indépendant',
    description: 'Analyse large du marché, rémunération uniquement par honoraires'
  },
  {
    value: 'non_independant',
    label: 'Conseil non-indépendant',
    description: 'Sélection parmi nos partenaires, possibilité de rétrocessions'
  },
];

const modesRemuneration: { value: ModeRemuneration; label: string; description: string }[] = [
  { value: 'honoraires', label: 'Honoraires uniquement', description: 'Facturation directe au client' },
  { value: 'retrocessions', label: 'Rétrocessions uniquement', description: 'Commission sur les produits souscrits' },
  { value: 'mixte', label: 'Mixte', description: 'Combinaison honoraires + rétrocessions' },
];

const frequencesSuivi: { value: FrequenceSuivi; label: string }[] = [
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'trimestriel', label: 'Trimestriel' },
  { value: 'semestriel', label: 'Semestriel' },
  { value: 'annuel', label: 'Annuel' },
  { value: 'ponctuel', label: 'Ponctuel (sur demande)' },
];

const instrumentsDisponibles: { value: InstrumentFinancier; label: string; category: string }[] = [
  // Assurance
  { value: 'assurance_vie', label: 'Assurance-vie', category: 'Assurance' },
  { value: 'per', label: 'Plan Épargne Retraite (PER)', category: 'Assurance' },
  // Immobilier
  { value: 'scpi_opci', label: 'SCPI / OPCI', category: 'Immobilier' },
  // Valeurs mobilières
  { value: 'fonds_opcvm', label: 'OPCVM / Fonds', category: 'Valeurs mobilières' },
  { value: 'actions_titres_vifs', label: 'Actions / Titres vifs', category: 'Valeurs mobilières' },
  { value: 'obligations', label: 'Obligations', category: 'Valeurs mobilières' },
  // Enveloppes
  { value: 'compte_titres', label: 'Compte-titres', category: 'Enveloppes' },
  { value: 'pea', label: 'PEA', category: 'Enveloppes' },
  // Alternatif
  { value: 'private_equity', label: 'Private Equity / FCPR', category: 'Alternatif' },
  { value: 'crowdfunding', label: 'Crowdfunding', category: 'Alternatif' },
  { value: 'produits_structures', label: 'Produits structurés', category: 'Alternatif' },
];

export default function SectionContexteMission({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionContexteMissionProps) {
  const modeConseil = useWatch({ control, name: 'contexteMission.modeConseil' });
  const typePrestation = useWatch({ control, name: 'contexteMission.typePrestation' });
  const modeRemuneration = useWatch({ control, name: 'contexteMission.remunerationMode' });

  return (
    <Accordion expanded={expanded} onChange={(_, exp) => onExpandChange(exp)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MissionIcon color="primary" />
          <Typography variant="h6">Contexte de Mission</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Ces informations sont nécessaires pour établir la <strong>Lettre de Mission</strong> et le <strong>DER</strong>.
            Elles définissent le périmètre de notre collaboration.
          </Typography>
        </Alert>

        {/* TYPE DE PRESTATION */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Type de prestation souhaitée
          </Typography>
          <Controller
            name="contexteMission.typePrestation"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} value={field.value || ''}>
                <Grid container spacing={2}>
                  {typesPrestations.map((type) => (
                    <Grid item xs={12} md={4} key={type.value}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderColor: field.value === type.value ? 'primary.main' : 'divider',
                          bgcolor: field.value === type.value ? 'action.selected' : 'background.paper',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                        onClick={() => field.onChange(type.value)}
                      >
                        <FormControlLabel
                          value={type.value}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography fontWeight={600}>{type.label}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {type.description}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            )}
          />
        </Box>

        {/* MODE DE CONSEIL (si conseil en investissement) */}
        {typePrestation === 'conseil_investissement' && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Mode de conseil
            </Typography>
            <Controller
              name="contexteMission.modeConseil"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} value={field.value || ''}>
                  <Grid container spacing={2}>
                    {modesConseil.map((mode) => (
                      <Grid item xs={12} md={6} key={mode.value}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            borderColor: field.value === mode.value ? 'primary.main' : 'divider',
                            bgcolor: field.value === mode.value ? 'action.selected' : 'background.paper',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                          onClick={() => field.onChange(mode.value)}
                        >
                          <FormControlLabel
                            value={mode.value}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography fontWeight={600}>{mode.label}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {mode.description}
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              )}
            />
          </Box>
        )}

        {/* INSTRUMENTS FINANCIERS */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Instruments financiers envisagés
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sélectionnez les types de produits qui vous intéressent (plusieurs choix possibles)
          </Typography>
          <Controller
            name="contexteMission.instrumentsSouhaites"
            control={control}
            render={({ field }) => {
              const selectedInstruments = field.value || [];

              // Grouper par catégorie
              const categories = [...new Set(instrumentsDisponibles.map(i => i.category))];

              return (
                <Box>
                  {categories.map(category => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        {category}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {instrumentsDisponibles
                          .filter(i => i.category === category)
                          .map(instrument => {
                            const isSelected = selectedInstruments.includes(instrument.value);
                            return (
                              <Chip
                                key={instrument.value}
                                label={instrument.label}
                                variant={isSelected ? 'filled' : 'outlined'}
                                color={isSelected ? 'primary' : 'default'}
                                onClick={() => {
                                  if (isSelected) {
                                    field.onChange(selectedInstruments.filter((v: string) => v !== instrument.value));
                                  } else {
                                    field.onChange([...selectedInstruments, instrument.value]);
                                  }
                                }}
                                sx={{ cursor: 'pointer' }}
                              />
                            );
                          })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              );
            }}
          />
        </Box>

        {/* RÉMUNÉRATION */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Mode de rémunération
          </Typography>
          {modeConseil === 'independant' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              En mode conseil indépendant, seuls les honoraires sont autorisés.
            </Alert>
          )}
          <Controller
            name="contexteMission.remunerationMode"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select
                  {...field}
                  value={field.value || ''}
                  displayEmpty
                  disabled={modeConseil === 'independant'}
                >
                  <MenuItem value="" disabled>Sélectionnez le mode de rémunération</MenuItem>
                  {modesRemuneration
                    .filter(m => modeConseil !== 'independant' || m.value === 'honoraires')
                    .map((mode) => (
                      <MenuItem key={mode.value} value={mode.value}>
                        {mode.label} - {mode.description}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          />

          {/* Montant honoraires si applicable */}
          {(modeRemuneration === 'honoraires' || modeRemuneration === 'mixte') && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="contexteMission.honorairesMontant"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Montant honoraires estimé"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">XPF</InputAdornment>,
                        inputProps: { min: 0 },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Controller
                  name="contexteMission.honorairesDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description des honoraires"
                      fullWidth
                      placeholder="Ex: 1% de l'encours annuel, forfait initial de..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
        </Box>

        {/* FRÉQUENCE DE SUIVI */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Fréquence de suivi souhaitée
          </Typography>
          <Controller
            name="contexteMission.frequenceSuivi"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} value={field.value || ''} displayEmpty>
                  <MenuItem value="" disabled>Sélectionnez la fréquence</MenuItem>
                  {frequencesSuivi.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Box>

        {/* DATE DE REMISE DU DER */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Document d'Entrée en Relation (DER)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Date à laquelle le DER a été remis au client (avant la signature de la lettre de mission)
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller
                name="contexteMission.dateRemiseDER"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date de remise du DER"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{
                      textField: { fullWidth: true },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* SIGNATURE DE LA LETTRE DE MISSION */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Signature de la Lettre de Mission
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller
                name="contexteMission.dateSignature"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date de signature"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{
                      textField: { fullWidth: true },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="contexteMission.lieuSignature"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lieu de signature"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="contexteMission.nombreExemplaires"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre d'exemplaires"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { min: 1, max: 5 } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
