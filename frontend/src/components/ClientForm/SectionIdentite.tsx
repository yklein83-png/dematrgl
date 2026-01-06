/**
 * Section Identité - Titulaire 1 et Titulaire 2
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
  Switch,
  Alert,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ExpandMore as ExpandMoreIcon, Person as PersonIcon } from '@mui/icons-material';
import { Control, Controller, useWatch } from 'react-hook-form';
import { ClientFormData, Civilite } from '../../types/client';

interface SectionIdentiteProps {
  control: Control<ClientFormData>;
  errors: any;
  titulaire: 'titulaire1' | 'titulaire2';
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const civiliteOptions: { value: Civilite; label: string }[] = [
  { value: 'M', label: 'Monsieur' },
  { value: 'Mme', label: 'Madame' },
];

export default function SectionIdentite({
  control,
  errors,
  titulaire,
  expanded,
  onExpandChange,
}: SectionIdentiteProps) {
  const prefix = titulaire;
  const isTitulaire2 = titulaire === 'titulaire2';
  const titreSection = isTitulaire2 ? 'Titulaire 2 (Co-titulaire)' : 'Titulaire 1 (Principal)';

  // Watch pour les champs conditionnels
  const regimeProtection = useWatch({ control, name: `${prefix}.regimeProtection` as any });
  const chefEntreprise = useWatch({ control, name: `${prefix}.chefEntreprise` as any });
  const residenceFiscale = useWatch({ control, name: `${prefix}.residenceFiscale` as any });
  const civilite = useWatch({ control, name: `${prefix}.civilite` as any });

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
          <PersonIcon color={isTitulaire2 ? 'secondary' : 'primary'} />
          <Typography variant="h6">{titreSection}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* IDENTITÉ */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Identité
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Civilité */}
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name={`${prefix}.civilite` as any}
              control={control}
              rules={{ required: 'Civilité requise' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!getError(`${prefix}.civilite`)}>
                  <InputLabel>Civilité *</InputLabel>
                  <Select {...field} label="Civilité *">
                    {civiliteOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {getError(`${prefix}.civilite`) && (
                    <FormHelperText>{getError(`${prefix}.civilite`)?.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Nom */}
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name={`${prefix}.nom` as any}
              control={control}
              rules={{ required: 'Nom requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nom *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.nom`)}
                  helperText={getError(`${prefix}.nom`)?.message}
                />
              )}
            />
          </Grid>

          {/* Nom de jeune fille */}
          {civilite === 'Mme' && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`${prefix}.nomJeuneFille` as any}
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Nom de jeune fille" size="small" fullWidth />
                )}
              />
            </Grid>
          )}

          {/* Prénom */}
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name={`${prefix}.prenom` as any}
              control={control}
              rules={{ required: 'Prénom requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Prénom *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.prenom`)}
                  helperText={getError(`${prefix}.prenom`)?.message}
                />
              )}
            />
          </Grid>

          {/* Date de naissance */}
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name={`${prefix}.dateNaissance` as any}
              control={control}
              rules={{ required: 'Date de naissance requise' }}
              render={({ field }) => (
                <DatePicker
                  label="Date de naissance *"
                  value={field.value}
                  onChange={field.onChange}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!getError(`${prefix}.dateNaissance`),
                      helperText: getError(`${prefix}.dateNaissance`)?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Lieu de naissance */}
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name={`${prefix}.lieuNaissance` as any}
              control={control}
              rules={{ required: 'Lieu de naissance requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Lieu de naissance *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.lieuNaissance`)}
                  helperText={getError(`${prefix}.lieuNaissance`)?.message}
                />
              )}
            />
          </Grid>

          {/* Nationalité */}
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name={`${prefix}.nationalite` as any}
              control={control}
              rules={{ required: 'Nationalité requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nationalité *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.nationalite`)}
                  helperText={getError(`${prefix}.nationalite`)?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        {/* FATCA */}
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={500}>
            FATCA - Foreign Account Tax Compliance Act
          </Typography>
          <Typography variant="caption">
            Critères d'américanité : passeport US, carte verte, lieu de naissance US, adresse légale ou postale US, numéros de téléphone américains
          </Typography>
        </Alert>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Controller
              name={`${prefix}.usPerson` as any}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Êtes-vous une personne américaine (US-Person) ?"
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* COORDONNÉES */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Coordonnées
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Adresse */}
          <Grid item xs={12}>
            <Controller
              name={`${prefix}.adresse` as any}
              control={control}
              rules={{ required: 'Adresse requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Adresse *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.adresse`)}
                  helperText={getError(`${prefix}.adresse`)?.message}
                />
              )}
            />
          </Grid>

          {/* Code postal */}
          <Grid item xs={12} sm={4}>
            <Controller
              name={`${prefix}.codePostal` as any}
              control={control}
              rules={{ required: 'Code postal requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Code postal *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.codePostal`)}
                  helperText={getError(`${prefix}.codePostal`)?.message}
                />
              )}
            />
          </Grid>

          {/* Ville */}
          <Grid item xs={12} sm={8}>
            <Controller
              name={`${prefix}.ville` as any}
              control={control}
              rules={{ required: 'Ville requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ville *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.ville`)}
                  helperText={getError(`${prefix}.ville`)?.message}
                />
              )}
            />
          </Grid>

          {/* Téléphone */}
          <Grid item xs={12} sm={6}>
            <Controller
              name={`${prefix}.telephone` as any}
              control={control}
              rules={{ required: 'Téléphone requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Téléphone *"
                  size="small"
                  fullWidth
                  placeholder="+689 87 XX XX XX"
                  error={!!getError(`${prefix}.telephone`)}
                  helperText={getError(`${prefix}.telephone`)?.message || 'Format Polynésie: +689 XX XX XX XX'}
                />
              )}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <Controller
              name={`${prefix}.email` as any}
              control={control}
              rules={{
                required: 'Email requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email *"
                  type="email"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.email`)}
                  helperText={getError(`${prefix}.email`)?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* RÉSIDENCE FISCALE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Résidence fiscale
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name={`${prefix}.residenceFiscale` as any}
              control={control}
              rules={{ required: 'Résidence fiscale requise' }}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Résidence fiscale *</InputLabel>
                  <Select {...field} label="Résidence fiscale *">
                    <MenuItem value="France">France</MenuItem>
                    <MenuItem value="Polynésie Française">Polynésie Française</MenuItem>
                    <MenuItem value="Autre">Autre</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {residenceFiscale === 'Autre' && (
            <Grid item xs={12} sm={6}>
              <Controller
                name={`${prefix}.residenceFiscaleAutre` as any}
                control={control}
                rules={{ required: 'Précisez la résidence fiscale' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Précisez *"
                    size="small"
                    fullWidth
                    error={!!getError(`${prefix}.residenceFiscaleAutre`)}
                    helperText={getError(`${prefix}.residenceFiscaleAutre`)?.message}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* PROTECTION JURIDIQUE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Protection juridique
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Controller
              name={`${prefix}.regimeProtection` as any}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Faites-vous l'objet d'un régime de protection juridique ?"
                />
              )}
            />
          </Grid>

          {regimeProtection && (
            <>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`${prefix}.regimeProtectionForme` as any}
                  control={control}
                  rules={{ required: 'Forme de protection requise' }}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Forme de protection *</InputLabel>
                      <Select {...field} label="Forme de protection *">
                        <MenuItem value="tutelle">Tutelle</MenuItem>
                        <MenuItem value="curatelle">Curatelle</MenuItem>
                        <MenuItem value="sauvegarde_justice">Sauvegarde de justice</MenuItem>
                        <MenuItem value="habilitation_familiale">Habilitation familiale</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`${prefix}.representantLegal` as any}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Représentant légal"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* PROFESSION */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Situation professionnelle
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name={`${prefix}.profession` as any}
              control={control}
              rules={{ required: 'Profession requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Profession *"
                  size="small"
                  fullWidth
                  error={!!getError(`${prefix}.profession`)}
                  helperText={getError(`${prefix}.profession`)?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={`${prefix}.employeur` as any}
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Employeur" size="small" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={`${prefix}.retraiteDepuis` as any}
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Retraité(e) depuis"
                  value={field.value}
                  onChange={field.onChange}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={`${prefix}.ancienneProfession` as any}
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Ancienne profession" size="small" fullWidth />
              )}
            />
          </Grid>
        </Grid>

        {/* Chef d'entreprise */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name={`${prefix}.chefEntreprise` as any}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Chef d'entreprise / Dirigeant"
                />
              )}
            />
          </Grid>

          {chefEntreprise && (
            <>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`${prefix}.entrepriseDenomination` as any}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Dénomination de l'entreprise"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`${prefix}.entrepriseFormeJuridique` as any}
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Forme juridique</InputLabel>
                      <Select {...field} label="Forme juridique">
                        <MenuItem value="SARL">SARL</MenuItem>
                        <MenuItem value="SAS">SAS</MenuItem>
                        <MenuItem value="SA">SA</MenuItem>
                        <MenuItem value="EURL">EURL</MenuItem>
                        <MenuItem value="SCI">SCI</MenuItem>
                        <MenuItem value="EI">Entreprise Individuelle</MenuItem>
                        <MenuItem value="Autre">Autre</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`${prefix}.entrepriseSiegeSocial` as any}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Siège social" size="small" fullWidth />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
