/**
 * Section RTO - Convention Réception Transmission Ordres
 * Champs spécifiques pour la convention RTO :
 * - Type de client (physique/morale)
 * - Profession libérale/entrepreneur avec SIRET
 * - Personne morale (raison sociale, RCS, etc.)
 * - Comptes titres
 * - Modes de communication
 */

import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Paper,
  Alert,
  IconButton,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Description as RTOIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch, useFieldArray } from 'react-hook-form';
import {
  ClientFormData,
  TypeClientRTO,
  ModeCommunicationRTO,
  defaultPersonneMoraleRTO,
} from '../../types/client';

interface SectionRTOProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const typesClient: { value: TypeClientRTO; label: string; description: string }[] = [
  {
    value: 'personne_physique',
    label: 'Personne physique',
    description: 'Client particulier (individu)',
  },
  {
    value: 'personne_morale',
    label: 'Personne morale',
    description: 'Société, association, ou autre entité juridique',
  },
];

const modesCommunication: { value: ModeCommunicationRTO; label: string }[] = [
  { value: 'courrier', label: 'Courrier postal' },
  { value: 'fax', label: 'Télécopie (Fax)' },
  { value: 'email', label: 'Courrier électronique (E-mail)' },
  { value: 'autre', label: 'Autre' },
];

export default function SectionRTO({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionRTOProps) {
  const typeClient = useWatch({ control, name: 'rto.typeClient' });
  const estProfLib = useWatch({ control, name: 'rto.estProfessionLiberal' });
  const modesSelected = useWatch({ control, name: 'rto.modesCommunication' }) || [];

  const { fields: comptes, append: addCompte, remove: removeCompte } = useFieldArray({
    control,
    name: 'rto.comptes',
  });

  return (
    <Accordion expanded={expanded} onChange={(_, exp) => onExpandChange(exp)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RTOIcon color="primary" />
          <Typography variant="h6">Convention RTO</Typography>
          <Chip label="Optionnel" size="small" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Ces informations sont spécifiques à la <strong>Convention de Réception et Transmission d'Ordres</strong>.
            Remplissez cette section uniquement si le client souhaite passer des ordres via le cabinet.
          </Typography>
        </Alert>

        {/* TYPE DE CLIENT */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Type de client
          </Typography>
          <Controller
            name="rto.typeClient"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field} value={field.value || 'personne_physique'}>
                <Grid container spacing={2}>
                  {typesClient.map((type) => (
                    <Grid item xs={12} md={6} key={type.value}>
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

        {/* PERSONNE PHYSIQUE - PROFESSION LIBÉRALE */}
        {typeClient === 'personne_physique' && (
          <Box sx={{ mb: 4 }}>
            <Controller
              name="rto.estProfessionLiberal"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={
                    <Typography>
                      <strong>Profession libérale / Entrepreneur individuel</strong>
                      <Typography variant="body2" color="text.secondary">
                        Cochez si le client exerce une activité professionnelle indépendante
                      </Typography>
                    </Typography>
                  }
                />
              )}
            />

            {estProfLib && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="rto.activiteProfessionnelle"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Activité professionnelle"
                          fullWidth
                          placeholder="Ex: Avocat au barreau de Paris, Consultant, Expert-comptable..."
                          helperText="Précisez l'activité et les inscriptions éventuelles"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="rto.siretProfessionnel"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="N° SIRET"
                          fullWidth
                          placeholder="XXX XXX XXX XXXXX"
                          inputProps={{ maxLength: 14 }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        )}

        {/* PERSONNE MORALE */}
        {typeClient === 'personne_morale' && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Informations de la personne morale
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="rto.personneMorale.raisonSociale"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Raison sociale"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="rto.personneMorale.formeJuridique"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Forme juridique"
                        fullWidth
                        placeholder="SAS, SARL, SA, SCI, Association..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="rto.personneMorale.objetSocial"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Objet social"
                        fullWidth
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="rto.personneMorale.numeroRCS"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="N° RCS"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="rto.personneMorale.villeRCS"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ville du RCS"
                        fullWidth
                        placeholder="Paris, Lyon, Papeete..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  {/* Placeholder pour alignement */}
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="rto.personneMorale.siegeSocial"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Adresse du siège social"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="rto.personneMorale.codePostalSiege"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Code postal"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Controller
                    name="rto.personneMorale.villeSiege"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ville"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Représentant légal
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Controller
                    name="rto.personneMorale.representantCivilite"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Civilité"
                        fullWidth
                        SelectProps={{ native: true }}
                      >
                        <option value="M">M.</option>
                        <option value="Mme">Mme</option>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    name="rto.personneMorale.representantNom"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nom du représentant"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    name="rto.personneMorale.representantPrenom"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Prénom du représentant"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="rto.personneMorale.representantQualite"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Qualité / Fonction"
                        fullWidth
                        placeholder="PDG, Gérant, Directeur Général, Associé..."
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* COMPTES TITRES */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Comptes titres concernés
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Listez les comptes sur lesquels le client souhaite passer des ordres via le cabinet
          </Typography>

          {comptes.map((compte, index) => (
            <Paper key={compte.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`rto.comptes.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Type de compte"
                        fullWidth
                        placeholder="PEA, Compte-titres..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`rto.comptes.${index}.numero`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="N° de compte"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    name={`rto.comptes.${index}.etablissement`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Établissement teneur de compte"
                        fullWidth
                        placeholder="Banque, courtier..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton
                    color="error"
                    onClick={() => removeCompte(index)}
                    title="Supprimer ce compte"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addCompte({ type: '', numero: '', etablissement: '' })}
          >
            Ajouter un compte
          </Button>
        </Box>

        {/* MODES DE COMMUNICATION */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            Modes de transmission des ordres
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comment le client souhaite-t-il transmettre ses ordres au cabinet ?
          </Typography>

          <Controller
            name="rto.modesCommunication"
            control={control}
            render={({ field }) => {
              const selected = field.value || [];
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {modesCommunication.map((mode) => {
                    const isSelected = selected.includes(mode.value);
                    return (
                      <Chip
                        key={mode.value}
                        label={mode.label}
                        variant={isSelected ? 'filled' : 'outlined'}
                        color={isSelected ? 'primary' : 'default'}
                        onClick={() => {
                          if (isSelected) {
                            field.onChange(selected.filter((v: string) => v !== mode.value));
                          } else {
                            field.onChange([...selected, mode.value]);
                          }
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Box>
              );
            }}
          />

          {modesSelected.includes('autre') && (
            <Box sx={{ mt: 2 }}>
              <Controller
                name="rto.modesCommunicationAutre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Précisez le mode de communication"
                    fullWidth
                    placeholder="Ex: Application mobile, plateforme en ligne..."
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
