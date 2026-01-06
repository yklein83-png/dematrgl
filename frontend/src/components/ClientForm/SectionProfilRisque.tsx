/**
 * Section Profil de Risque
 * Conformité AMF/ACPR - MIF2
 * Détermination du profil investisseur selon le questionnaire réglementaire
 */

import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  RadioGroup,
  Radio,
  FormLabel,
  Slider,
  Paper,
  Chip,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as RisqueIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch } from 'react-hook-form';
import { ClientFormData, HorizonPlacement, ObjectifPrincipal, NiveauRisque } from '../../types/client';

interface SectionProfilRisqueProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const horizonsPlacements: { value: HorizonPlacement; label: string; description: string; points: number }[] = [
  { value: 'court_terme', label: 'Court terme', description: 'Moins de 2 ans', points: 1 },
  { value: 'moyen_terme', label: 'Moyen terme', description: '2 à 5 ans', points: 2 },
  { value: 'long_terme', label: 'Long terme', description: '5 à 10 ans', points: 3 },
  { value: 'tres_long_terme', label: 'Très long terme', description: 'Plus de 10 ans', points: 4 },
];

const objectifsPrincipaux: { value: ObjectifPrincipal; label: string; description: string; points: number }[] = [
  { value: 'securite', label: 'Sécurité du capital', description: 'Préserver mon capital à tout prix', points: 1 },
  { value: 'revenus_reguliers', label: 'Revenus réguliers', description: 'Générer des revenus complémentaires', points: 2 },
  { value: 'croissance_moderee', label: 'Croissance modérée', description: 'Faire croître mon patrimoine progressivement', points: 3 },
  { value: 'croissance_dynamique', label: 'Croissance dynamique', description: 'Maximiser la performance sur le long terme', points: 4 },
];

const profilsRisque: { value: NiveauRisque; label: string; description: string; color: string; minScore: number; maxScore: number }[] = [
  { value: 'securitaire', label: 'Sécuritaire', description: 'Priorité absolue à la préservation du capital', color: '#4caf50', minScore: 0, maxScore: 8 },
  { value: 'prudent', label: 'Prudent', description: 'Recherche de sécurité avec une petite part de risque', color: '#8bc34a', minScore: 9, maxScore: 14 },
  { value: 'equilibre', label: 'Équilibré', description: 'Arbitrage entre sécurité et performance', color: '#ffeb3b', minScore: 15, maxScore: 20 },
  { value: 'dynamique', label: 'Dynamique', description: 'Recherche de performance avec acceptation du risque', color: '#ff9800', minScore: 21, maxScore: 26 },
  { value: 'offensif', label: 'Offensif', description: 'Maximisation de la performance, risque élevé accepté', color: '#f44336', minScore: 27, maxScore: 32 },
];

export default function SectionProfilRisque({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionProfilRisqueProps) {
  // Watch pour calculer le profil automatiquement
  const horizonPlacement = useWatch({ control, name: 'profilRisque.horizonPlacement' });
  const objectifPrincipal = useWatch({ control, name: 'profilRisque.objectifPrincipal' });
  const tolerancePerte = useWatch({ control, name: 'profilRisque.tolerancePerte' });
  const reactionBaisse = useWatch({ control, name: 'profilRisque.reactionBaisse' });
  const partRisquee = useWatch({ control, name: 'profilRisque.partRisquee' });
  const importanceGarantieCapital = useWatch({ control, name: 'profilRisque.importanceGarantieCapital' });

  // Calcul du score et du profil suggéré
  const calculatedProfile = useMemo(() => {
    let score = 0;

    // Horizon (1-4 points)
    const horizonPoints = horizonsPlacements.find(h => h.value === horizonPlacement)?.points || 0;
    score += horizonPoints;

    // Objectif (1-4 points)
    const objectifPoints = objectifsPrincipaux.find(o => o.value === objectifPrincipal)?.points || 0;
    score += objectifPoints;

    // Tolérance perte (1-5 points basé sur le pourcentage)
    if (tolerancePerte !== undefined) {
      if (tolerancePerte <= 5) score += 1;
      else if (tolerancePerte <= 10) score += 2;
      else if (tolerancePerte <= 20) score += 3;
      else if (tolerancePerte <= 30) score += 4;
      else score += 5;
    }

    // Réaction baisse (1-5 points)
    const reactionPoints: Record<string, number> = {
      'vendre_tout': 1,
      'vendre_partie': 2,
      'attendre': 3,
      'conserver': 4,
      'acheter_plus': 5,
    };
    score += reactionPoints[reactionBaisse as string] || 0;

    // Part risquée (1-5 points basé sur le pourcentage)
    if (partRisquee !== undefined) {
      if (partRisquee <= 10) score += 1;
      else if (partRisquee <= 25) score += 2;
      else if (partRisquee <= 50) score += 3;
      else if (partRisquee <= 75) score += 4;
      else score += 5;
    }

    // Importance garantie capital (inverse: 5-1 points)
    if (importanceGarantieCapital !== undefined) {
      score += (6 - Math.ceil(importanceGarantieCapital / 2));
    }

    // Déterminer le profil
    const profile = profilsRisque.find(p => score >= p.minScore && score <= p.maxScore) || profilsRisque[2];

    return { score, profile };
  }, [horizonPlacement, objectifPrincipal, tolerancePerte, reactionBaisse, partRisquee, importanceGarantieCapital]);

  return (
    <Accordion expanded={expanded} onChange={(_, exp) => onExpandChange(exp)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RisqueIcon color="primary" />
          <Typography variant="h6">Profil de Risque</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Obligation réglementaire MIF2</strong> : Ce questionnaire permet de déterminer votre profil investisseur
            et de s'assurer que les recommandations seront adaptées à votre situation et vos objectifs.
          </Typography>
        </Alert>

        {/* HORIZON DE PLACEMENT */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          <TimerIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Horizon de placement
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sur quelle durée souhaitez-vous investir la majeure partie de vos avoirs ?
        </Typography>
        <Controller
          name="profilRisque.horizonPlacement"
          control={control}
          rules={{ required: 'Horizon de placement requis' }}
          render={({ field }) => (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {horizonsPlacements.map((horizon) => (
                <Grid item xs={6} sm={3} key={horizon.value}>
                  <Paper
                    variant="outlined"
                    onClick={() => field.onChange(horizon.value)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      borderColor: field.value === horizon.value ? 'primary.main' : 'divider',
                      bgcolor: field.value === horizon.value ? 'primary.50' : 'background.paper',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {horizon.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {horizon.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        />

        <Divider sx={{ my: 3 }} />

        {/* OBJECTIF PRINCIPAL */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          <SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Objectif principal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Quel est votre objectif principal pour ce placement ?
        </Typography>
        <Controller
          name="profilRisque.objectifPrincipal"
          control={control}
          rules={{ required: 'Objectif principal requis' }}
          render={({ field }) => (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {objectifsPrincipaux.map((objectif) => (
                <Grid item xs={12} sm={6} md={3} key={objectif.value}>
                  <Paper
                    variant="outlined"
                    onClick={() => field.onChange(objectif.value)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'all 0.2s',
                      borderColor: field.value === objectif.value ? 'primary.main' : 'divider',
                      bgcolor: field.value === objectif.value ? 'primary.50' : 'background.paper',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {objectif.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {objectif.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        />

        <Divider sx={{ my: 3 }} />

        {/* TOLÉRANCE À LA PERTE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Tolérance à la perte
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Quelle perte maximale sur votre capital seriez-vous prêt(e) à accepter sur une année ?
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Controller
              name="profilRisque.tolerancePerte"
              control={control}
              render={({ field }) => (
                <Box sx={{ px: 2 }}>
                  <Slider
                    {...field}
                    value={field.value || 0}
                    onChange={(_, value) => field.onChange(value)}
                    min={0}
                    max={50}
                    step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 10, label: '10%' },
                      { value: 20, label: '20%' },
                      { value: 30, label: '30%' },
                      { value: 40, label: '40%' },
                      { value: 50, label: '50%' },
                    ]}
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => `${value}%`}
                    sx={{
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                </Box>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Alert
              severity={
                (tolerancePerte || 0) <= 10 ? 'success' :
                (tolerancePerte || 0) <= 20 ? 'info' :
                (tolerancePerte || 0) <= 30 ? 'warning' : 'error'
              }
              sx={{ height: '100%' }}
            >
              <Typography variant="body2">
                Perte maximale acceptée : <strong>{tolerancePerte || 0}%</strong>
              </Typography>
            </Alert>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* RÉACTION EN CAS DE BAISSE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Réaction face à une baisse des marchés
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Si vos investissements perdaient 20% de leur valeur en quelques mois, que feriez-vous ?
        </Typography>
        <Controller
          name="profilRisque.reactionBaisse"
          control={control}
          rules={{ required: 'Réaction requise' }}
          render={({ field }) => (
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup {...field}>
                <FormControlLabel
                  value="vendre_tout"
                  control={<Radio />}
                  label="Je vendrais tout pour éviter de perdre davantage"
                />
                <FormControlLabel
                  value="vendre_partie"
                  control={<Radio />}
                  label="Je vendrais une partie pour limiter les pertes"
                />
                <FormControlLabel
                  value="attendre"
                  control={<Radio />}
                  label="J'attendrais de voir l'évolution avant de décider"
                />
                <FormControlLabel
                  value="conserver"
                  control={<Radio />}
                  label="Je conserverais mes positions, convaincu(e) d'une remontée"
                />
                <FormControlLabel
                  value="acheter_plus"
                  control={<Radio />}
                  label="J'achèterais davantage pour profiter des prix bas"
                />
              </RadioGroup>
            </FormControl>
          )}
        />

        <Divider sx={{ my: 3 }} />

        {/* PART RISQUÉE DU PORTEFEUILLE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Part risquée du portefeuille
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Quelle part de votre patrimoine financier seriez-vous prêt(e) à investir sur des supports risqués (actions, private equity...) ?
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Controller
              name="profilRisque.partRisquee"
              control={control}
              render={({ field }) => (
                <Box sx={{ px: 2 }}>
                  <Slider
                    {...field}
                    value={field.value || 0}
                    onChange={(_, value) => field.onChange(value)}
                    min={0}
                    max={100}
                    step={10}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' },
                    ]}
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Box>
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* IMPORTANCE GARANTIE CAPITAL */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          <ShieldIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Importance de la garantie du capital
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          À quel point la garantie du capital investi est-elle importante pour vous ?
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Controller
              name="profilRisque.importanceGarantieCapital"
              control={control}
              render={({ field }) => (
                <Box sx={{ px: 2 }}>
                  <Slider
                    {...field}
                    value={field.value || 5}
                    onChange={(_, value) => field.onChange(value)}
                    min={1}
                    max={10}
                    step={1}
                    marks={[
                      { value: 1, label: 'Peu important' },
                      { value: 5, label: 'Moyennement' },
                      { value: 10, label: 'Essentiel' },
                    ]}
                    valueLabelDisplay="on"
                  />
                </Box>
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* OBJECTIFS SPÉCIFIQUES */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Objectifs spécifiques
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Avez-vous des objectifs particuliers pour ce placement ?
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="profilRisque.objectifRetraite"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<input type="checkbox" {...field} checked={field.value || false} style={{ marginRight: 8 }} />}
                  label="Préparer ma retraite"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="profilRisque.objectifTransmission"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<input type="checkbox" {...field} checked={field.value || false} style={{ marginRight: 8 }} />}
                  label="Transmettre mon patrimoine"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="profilRisque.objectifProjetVie"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<input type="checkbox" {...field} checked={field.value || false} style={{ marginRight: 8 }} />}
                  label="Financer un projet de vie"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="profilRisque.objectifRevenuComplementaire"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<input type="checkbox" {...field} checked={field.value || false} style={{ marginRight: 8 }} />}
                  label="Générer des revenus complémentaires"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="profilRisque.objectifOptimisationFiscale"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<input type="checkbox" {...field} checked={field.value || false} style={{ marginRight: 8 }} />}
                  label="Optimiser ma fiscalité"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="profilRisque.objectifEpargneSecurite"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<input type="checkbox" {...field} checked={field.value || false} style={{ marginRight: 8 }} />}
                  label="Constituer une épargne de sécurité"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="profilRisque.objectifAutre"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Autre objectif (précisez)"
                  size="small"
                  fullWidth
                  placeholder="Ex: Achat résidence secondaire dans 5 ans..."
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* PROFIL CALCULÉ */}
        <Card
          sx={{
            bgcolor: calculatedProfile.profile.color,
            color: calculatedProfile.profile.value === 'equilibre' ? 'text.primary' : 'white',
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profil de risque suggéré
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h4" fontWeight={700}>
                {calculatedProfile.profile.label}
              </Typography>
              <Chip
                label={`Score: ${calculatedProfile.score}/32`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                }}
              />
            </Box>
            <Typography variant="body2">
              {calculatedProfile.profile.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(calculatedProfile.score / 32) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption">Sécuritaire</Typography>
                <Typography variant="caption">Offensif</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* VALIDATION DU PROFIL */}
        <Box sx={{ mt: 3 }}>
          <Controller
            name="profilRisque.profilValide"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Profil retenu *</InputLabel>
                <Select {...field} label="Profil retenu *">
                  {profilsRisque.map((profil) => (
                    <MenuItem key={profil.value} value={profil.value}>
                      {profil.label} - {profil.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Le profil suggéré est basé sur vos réponses. Vous pouvez le modifier si nécessaire après discussion avec votre conseiller.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
