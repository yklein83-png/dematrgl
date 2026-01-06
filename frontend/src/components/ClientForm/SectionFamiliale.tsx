/**
 * Section Situation Familiale
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
  IconButton,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  ExpandMore as ExpandMoreIcon,
  FamilyRestroom as FamilyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { ClientFormData, SituationFamiliale } from '../../types/client';

interface SectionFamilialeProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const situationOptions: { value: SituationFamiliale; label: string }[] = [
  { value: 'marie', label: 'Marié(e)' },
  { value: 'pacse', label: 'Pacsé(e)' },
  { value: 'celibataire', label: 'Célibataire' },
  { value: 'veuf', label: 'Veuf(ve)' },
  { value: 'divorce', label: 'Divorcé(e)' },
  { value: 'union_libre', label: 'Union libre' },
];

const regimesMatrimoniaux = [
  { value: 'communaute_reduite', label: 'Communauté réduite aux acquêts' },
  { value: 'communaute_universelle', label: 'Communauté universelle' },
  { value: 'separation_biens', label: 'Séparation de biens' },
  { value: 'participation_acquets', label: 'Participation aux acquêts' },
];

export default function SectionFamiliale({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionFamilialeProps) {
  // Watch pour les champs conditionnels
  const situation = useWatch({ control, name: 'situationFamiliale.situation' });
  const contratMariage = useWatch({ control, name: 'situationFamiliale.contratMariage' });
  const donationEntreEpoux = useWatch({ control, name: 'situationFamiliale.donationEntreEpoux' });
  const donationEnfants = useWatch({ control, name: 'situationFamiliale.donationEnfants' });
  const nombreEnfants = useWatch({ control, name: 'situationFamiliale.nombreEnfants' });

  // Field array pour les enfants
  const { fields: enfants, append, remove } = useFieldArray({
    control,
    name: 'situationFamiliale.enfants',
  });

  const isMarie = situation === 'marie';
  const isPacse = situation === 'pacse';
  const isDivorce = situation === 'divorce';

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
          <FamilyIcon color="primary" />
          <Typography variant="h6">Situation Familiale</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* SITUATION MATRIMONIALE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Situation matrimoniale
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="situationFamiliale.situation"
              control={control}
              rules={{ required: 'Situation familiale requise' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!getError('situationFamiliale.situation')}>
                  <InputLabel>Situation *</InputLabel>
                  <Select {...field} label="Situation *">
                    {situationOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Si marié */}
          {isMarie && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.dateMariage"
                  control={control}
                  rules={{ required: 'Date de mariage requise' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Date de mariage *"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!getError('situationFamiliale.dateMariage'),
                          helperText: getError('situationFamiliale.dateMariage')?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.contratMariage"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value || false} />}
                      label="Contrat de mariage"
                    />
                  )}
                />
              </Grid>

              {contratMariage && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="situationFamiliale.regimeMatrimonial"
                    control={control}
                    rules={{ required: 'Régime matrimonial requis' }}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Régime matrimonial *</InputLabel>
                        <Select {...field} label="Régime matrimonial *">
                          {regimesMatrimoniaux.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
            </>
          )}

          {/* Si pacsé */}
          {isPacse && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.datePacs"
                  control={control}
                  rules={{ required: 'Date de PACS requise' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Date du PACS *"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!getError('situationFamiliale.datePacs'),
                          helperText: getError('situationFamiliale.datePacs')?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.conventionPacs"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value || false} />}
                      label="Convention de PACS spécifique"
                    />
                  )}
                />
              </Grid>
            </>
          )}

          {/* Si divorcé */}
          {isDivorce && (
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="situationFamiliale.dateDivorce"
                control={control}
                rules={{ required: 'Date de divorce requise' }}
                render={({ field }) => (
                  <DatePicker
                    label="Date du divorce *"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!getError('situationFamiliale.dateDivorce'),
                        helperText: getError('situationFamiliale.dateDivorce')?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* DONATIONS */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Donations réalisées
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Donation entre époux */}
          <Grid item xs={12}>
            <Controller
              name="situationFamiliale.donationEntreEpoux"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Donation entre époux"
                />
              )}
            />
          </Grid>

          {donationEntreEpoux && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.donationEntreEpouxDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Date de la donation"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.donationEntreEpouxMontant"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Montant (€)"
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          {/* Donation aux enfants */}
          <Grid item xs={12}>
            <Controller
              name="situationFamiliale.donationEnfants"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Donation au profit de vos enfants ou petits-enfants"
                />
              )}
            />
          </Grid>

          {donationEnfants && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.donationEnfantsDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Date de la donation"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="situationFamiliale.donationEnfantsMontant"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Montant (€)"
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ENFANTS */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Enfants
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="situationFamiliale.nombreEnfants"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre d'enfants"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 20 } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="situationFamiliale.nombreEnfantsACharge"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Dont à charge"
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: nombreEnfants || 20 } }}
                />
              )}
            />
          </Grid>
        </Grid>

        {/* Liste des enfants */}
        {nombreEnfants > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Détail des enfants
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => append({ prenom: '', dateNaissance: null, aCharge: false })}
              >
                Ajouter un enfant
              </Button>
            </Box>

            {enfants.map((enfant, index) => (
              <Card key={enfant.id} variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`situationFamiliale.enfants.${index}.prenom`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Prénom"
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`situationFamiliale.enfants.${index}.dateNaissance`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Date de naissance"
                            value={field.value}
                            onChange={field.onChange}
                            slotProps={{
                              textField: { size: 'small', fullWidth: true },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Controller
                        name={`situationFamiliale.enfants.${index}.aCharge`}
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value || false} size="small" />}
                            label="À charge"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* INFORMATIONS COMPLÉMENTAIRES */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Informations complémentaires
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="situationFamiliale.informationsComplementaires"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Informations complémentaires"
                  placeholder="Évolution professionnelle, projets d'enfant, déménagement, achats prévus..."
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                  helperText="Susceptibles d'influencer votre situation patrimoniale actuelle ou future"
                />
              )}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
