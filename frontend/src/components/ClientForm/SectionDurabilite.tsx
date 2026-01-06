/**
 * Section Durabilité - Préférences ESG
 * Conformité SFDR / MIF2 - Préférences en matière de durabilité
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
  RadioGroup,
  Radio,
  Slider,
  Paper,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  NaturePeople as EcoIcon,
  Info as InfoIcon,
  Forest as ParkIcon,
  Groups as GroupsIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch } from 'react-hook-form';
import { ClientFormData, NiveauPreferenceESG } from '../../types/client';

interface SectionDurabiliteProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const niveauxPreference: { value: NiveauPreferenceESG; label: string; description: string }[] = [
  { value: 'non_interesse', label: 'Non intéressé', description: 'Pas de préférence particulière pour les critères ESG' },
  { value: 'interesse', label: 'Intéressé', description: 'Souhaite que les critères ESG soient pris en compte' },
  { value: 'prioritaire', label: 'Prioritaire', description: 'Les critères ESG sont un élément important de décision' },
  { value: 'exclusif', label: 'Exclusif', description: 'Souhaite investir uniquement dans des produits ESG' },
];

const secteursExclusion = [
  { id: 'armement', label: 'Armement', icon: '⚔️' },
  { id: 'tabac', label: 'Tabac', icon: '🚬' },
  { id: 'alcool', label: 'Alcool', icon: '🍺' },
  { id: 'jeux_hasard', label: 'Jeux d\'argent', icon: '🎰' },
  { id: 'energies_fossiles', label: 'Énergies fossiles', icon: '⛽' },
  { id: 'nucleaire', label: 'Nucléaire', icon: '☢️' },
  { id: 'ogm', label: 'OGM', icon: '🧬' },
  { id: 'pornographie', label: 'Pornographie', icon: '🔞' },
  { id: 'tests_animaux', label: 'Tests sur animaux', icon: '🐁' },
  { id: 'deforestation', label: 'Déforestation', icon: '🌲' },
];

export default function SectionDurabilite({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionDurabiliteProps) {
  // Watch pour affichage conditionnel
  const interesseESG = useWatch({ control, name: 'durabilite.interesseESG' });
  const niveauPreference = useWatch({ control, name: 'durabilite.niveauPreference' });

  return (
    <Accordion expanded={expanded} onChange={(_, exp) => onExpandChange(exp)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EcoIcon color="primary" />
          <Typography variant="h6">Préférences en matière de Durabilité (ESG)</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Règlement SFDR</strong> : Depuis août 2022, nous devons recueillir vos préférences en matière
            d'investissement durable (critères Environnementaux, Sociaux et de Gouvernance - ESG).
          </Typography>
        </Alert>

        {/* INTRODUCTION ESG */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" paragraph>
            L'investissement durable vise à prendre en compte, en plus des critères financiers traditionnels,
            des critères extra-financiers :
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <ParkIcon color="success" />
                <Box>
                  <Typography variant="subtitle2" color="success.main">
                    Environnement (E)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Climat, biodiversité, pollution, ressources
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <GroupsIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="primary.main">
                    Social (S)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Droits humains, conditions de travail, diversité
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <GavelIcon color="warning" />
                <Box>
                  <Typography variant="subtitle2" color="warning.main">
                    Gouvernance (G)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Éthique, transparence, indépendance
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* INTÉRÊT POUR L'ESG */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Intérêt pour l'investissement durable
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Controller
              name="durabilite.interesseESG"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Souhaitez-vous que vos préférences en matière de durabilité soient prises en compte
                    dans les recommandations d'investissement ?
                  </Typography>
                  <RadioGroup
                    {...field}
                    value={field.value === true ? 'oui' : field.value === false ? 'non' : ''}
                    onChange={(e) => field.onChange(e.target.value === 'oui')}
                  >
                    <FormControlLabel
                      value="oui"
                      control={<Radio />}
                      label="Oui, je souhaite que les critères ESG soient pris en compte"
                    />
                    <FormControlLabel
                      value="non"
                      control={<Radio />}
                      label="Non, je n'ai pas de préférence particulière en matière de durabilité"
                    />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>

        {interesseESG && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* NIVEAU DE PRÉFÉRENCE */}
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Niveau de préférence ESG
            </Typography>
            <Controller
              name="durabilite.niveauPreference"
              control={control}
              render={({ field }) => (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {niveauxPreference.map((niveau) => (
                    <Grid item xs={12} sm={6} md={3} key={niveau.value}>
                      <Paper
                        variant="outlined"
                        onClick={() => field.onChange(niveau.value)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          height: '100%',
                          transition: 'all 0.2s',
                          borderColor: field.value === niveau.value ? 'success.main' : 'divider',
                          bgcolor: field.value === niveau.value ? 'success.50' : 'background.paper',
                          '&:hover': { borderColor: 'success.main' },
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {niveau.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {niveau.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            />

            <Divider sx={{ my: 3 }} />

            {/* PRIORITÉS ESG */}
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Priorités ESG
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Indiquez l'importance que vous accordez à chaque pilier (de 1 à 10)
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 2, borderColor: 'success.main' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ParkIcon color="success" />
                    <Typography variant="subtitle2" fontWeight={600} color="success.main">
                      Environnement
                    </Typography>
                  </Box>
                  <Controller
                    name="durabilite.importanceEnvironnement"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        {...field}
                        value={field.value || 5}
                        onChange={(_, value) => field.onChange(value)}
                        min={1}
                        max={10}
                        marks={[
                          { value: 1, label: '1' },
                          { value: 5, label: '5' },
                          { value: 10, label: '10' },
                        ]}
                        valueLabelDisplay="auto"
                        color="success"
                      />
                    )}
                  />
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <GroupsIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                      Social
                    </Typography>
                  </Box>
                  <Controller
                    name="durabilite.importanceSocial"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        {...field}
                        value={field.value || 5}
                        onChange={(_, value) => field.onChange(value)}
                        min={1}
                        max={10}
                        marks={[
                          { value: 1, label: '1' },
                          { value: 5, label: '5' },
                          { value: 10, label: '10' },
                        ]}
                        valueLabelDisplay="auto"
                        color="primary"
                      />
                    )}
                  />
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 2, borderColor: 'warning.main' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <GavelIcon color="warning" />
                    <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                      Gouvernance
                    </Typography>
                  </Box>
                  <Controller
                    name="durabilite.importanceGouvernance"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        {...field}
                        value={field.value || 5}
                        onChange={(_, value) => field.onChange(value)}
                        min={1}
                        max={10}
                        marks={[
                          { value: 1, label: '1' },
                          { value: 5, label: '5' },
                          { value: 10, label: '10' },
                        ]}
                        valueLabelDisplay="auto"
                        color="warning"
                      />
                    )}
                  />
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* SECTEURS À EXCLURE */}
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Secteurs à exclure
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Cochez les secteurs dans lesquels vous ne souhaitez pas investir
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {secteursExclusion.map((secteur) => (
                <Grid item xs={6} sm={4} md={3} key={secteur.id}>
                  <Controller
                    name={`durabilite.exclusions.${secteur.id}` as any}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value || false}
                            size="small"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{secteur.icon}</span>
                            <Typography variant="body2">{secteur.label}</Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* INVESTISSEMENT À IMPACT */}
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Investissement à impact
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Controller
                  name="durabilite.investissementImpact"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value || false} />}
                      label="Je suis intéressé(e) par l'investissement à impact (générer un impact social ou environnemental positif mesurable)"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="durabilite.investissementSolidaire"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value || false} />}
                      label="Je suis intéressé(e) par l'épargne solidaire (financer des projets d'utilité sociale)"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* TAXONOMIE UE */}
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Alignement Taxonomie UE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Souhaitez-vous un pourcentage minimum d'investissements alignés sur la Taxonomie européenne
              (activités économiques durables sur le plan environnemental) ?
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="durabilite.alignementTaxonomieMin"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Pourcentage minimum souhaité</InputLabel>
                      <Select {...field} label="Pourcentage minimum souhaité">
                        <MenuItem value={0}>Pas de minimum</MenuItem>
                        <MenuItem value={10}>Au moins 10%</MenuItem>
                        <MenuItem value={25}>Au moins 25%</MenuItem>
                        <MenuItem value={50}>Au moins 50%</MenuItem>
                        <MenuItem value={75}>Au moins 75%</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* PRINCIPALES INCIDENCES NÉGATIVES (PAI) */}
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Principales Incidences Négatives (PAI)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Souhaitez-vous que les principales incidences négatives sur les facteurs de durabilité
              soient prises en compte dans vos investissements ?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="durabilite.prendreEnComptePAI"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset">
                      <RadioGroup {...field}>
                        <FormControlLabel
                          value="oui"
                          control={<Radio />}
                          label="Oui, je souhaite que les PAI soient pris en compte (émissions CO2, biodiversité, droits humains...)"
                        />
                        <FormControlLabel
                          value="non"
                          control={<Radio />}
                          label="Non, pas de préférence particulière sur les PAI"
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* SIGNATURE */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Controller
            name="durabilite.confirmationPreferences"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value || false} />}
                label={
                  <Typography variant="body2">
                    Je confirme avoir été informé(e) des différentes options en matière d'investissement durable
                    et que mes préférences ont été correctement recueillies.
                  </Typography>
                }
              />
            )}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
