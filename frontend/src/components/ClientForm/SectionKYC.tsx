/**
 * Section KYC - Connaissance et Expérience Client
 * Conformité AMF/ACPR - MIF2
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
  FormLabel,
  Slider,
  Paper,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as KYCIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Control, Controller, useWatch } from 'react-hook-form';
import { ClientFormData, NiveauConnaissance, FrequenceOperation, TypeInstrument } from '../../types/client';

interface SectionKYCProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const niveauxConnaissance: { value: NiveauConnaissance; label: string; description: string }[] = [
  { value: 'aucune', label: 'Aucune', description: 'Pas de connaissance sur ce type de produit' },
  { value: 'basique', label: 'Basique', description: 'Connaissance théorique de base' },
  { value: 'moyenne', label: 'Moyenne', description: 'Connaissance et quelques opérations' },
  { value: 'avancee', label: 'Avancée', description: 'Bonne maîtrise et expérience régulière' },
  { value: 'expert', label: 'Expert', description: 'Maîtrise complète et opérations fréquentes' },
];

const frequencesOperation: { value: FrequenceOperation; label: string }[] = [
  { value: 'jamais', label: 'Jamais' },
  { value: 'rarement', label: 'Rarement (< 5 opérations/an)' },
  { value: 'occasionnel', label: 'Occasionnel (5-20 opérations/an)' },
  { value: 'regulier', label: 'Régulier (20-50 opérations/an)' },
  { value: 'frequent', label: 'Fréquent (> 50 opérations/an)' },
];

const typesInstruments: { value: TypeInstrument; label: string; description: string; risque: 'faible' | 'moyen' | 'eleve' }[] = [
  { value: 'livrets', label: 'Livrets réglementés', description: 'Livret A, LDDS, LEP...', risque: 'faible' },
  { value: 'comptes_terme', label: 'Comptes à terme', description: 'Dépôts à terme, CAT...', risque: 'faible' },
  { value: 'obligations', label: 'Obligations', description: 'Obligations d\'État, corporate...', risque: 'moyen' },
  { value: 'actions', label: 'Actions', description: 'Actions cotées, ETF actions...', risque: 'eleve' },
  { value: 'opcvm', label: 'OPCVM / FCP', description: 'Fonds diversifiés, SICAV...', risque: 'moyen' },
  { value: 'assurance_vie_euros', label: 'Assurance-vie Fonds €', description: 'Fonds euros garantis', risque: 'faible' },
  { value: 'assurance_vie_uc', label: 'Assurance-vie UC', description: 'Unités de compte', risque: 'eleve' },
  { value: 'per', label: 'PER / Épargne retraite', description: 'Plans d\'épargne retraite', risque: 'moyen' },
  { value: 'scpi', label: 'SCPI / OPCI', description: 'Pierre-papier', risque: 'moyen' },
  { value: 'private_equity', label: 'Private Equity', description: 'Capital investissement, FCPR...', risque: 'eleve' },
  { value: 'produits_structures', label: 'Produits structurés', description: 'Autocalls, certificats...', risque: 'eleve' },
  { value: 'derives', label: 'Produits dérivés', description: 'Options, futures, CFD...', risque: 'eleve' },
  { value: 'crypto', label: 'Crypto-actifs', description: 'Bitcoin, Ethereum...', risque: 'eleve' },
  { value: 'crowdfunding', label: 'Crowdfunding', description: 'Financement participatif', risque: 'eleve' },
];

const getRisqueColor = (risque: 'faible' | 'moyen' | 'eleve') => {
  switch (risque) {
    case 'faible': return 'success';
    case 'moyen': return 'warning';
    case 'eleve': return 'error';
  }
};

export default function SectionKYC({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionKYCProps) {
  // Watch pour affichage conditionnel
  const formationFinanciere = useWatch({ control, name: 'kyc.formationFinanciere' });
  const experienceProfessionnelleFinance = useWatch({ control, name: 'kyc.experienceProfessionnelleFinance' });

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
          <KYCIcon color="primary" />
          <Typography variant="h6">Connaissance et Expérience (KYC)</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Directive MIF2</strong> : Ces informations permettent d'évaluer votre niveau de connaissance
            et d'expérience en matière d'investissement, afin de vous proposer des produits adaptés.
          </Typography>
        </Alert>

        {/* FORMATION ET DIPLÔMES */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Formation et parcours
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="kyc.niveauEtudes"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Niveau d'études</InputLabel>
                  <Select {...field} label="Niveau d'études">
                    <MenuItem value="sans_diplome">Sans diplôme</MenuItem>
                    <MenuItem value="cap_bep">CAP / BEP</MenuItem>
                    <MenuItem value="bac">Baccalauréat</MenuItem>
                    <MenuItem value="bac_plus_2">Bac +2</MenuItem>
                    <MenuItem value="bac_plus_3">Bac +3 (Licence)</MenuItem>
                    <MenuItem value="bac_plus_5">Bac +5 (Master)</MenuItem>
                    <MenuItem value="doctorat">Doctorat</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="kyc.domaineEtudes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Domaine d'études"
                  size="small"
                  fullWidth
                  placeholder="Ex: Commerce, Ingénierie, Droit..."
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="kyc.formationFinanciere"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Formation spécifique en finance/économie/gestion"
                />
              )}
            />
          </Grid>

          {formationFinanciere && (
            <Grid item xs={12}>
              <Controller
                name="kyc.formationFinanciereDetail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Précisez la formation"
                    size="small"
                    fullWidth
                    placeholder="Ex: Master Finance, CFA, CESB CGP..."
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* EXPÉRIENCE PROFESSIONNELLE */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Expérience professionnelle dans le secteur financier
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Controller
              name="kyc.experienceProfessionnelleFinance"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Expérience professionnelle dans le secteur financier (banque, assurance, gestion d'actifs...)"
                />
              )}
            />
          </Grid>

          {experienceProfessionnelleFinance && (
            <>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kyc.experienceFinanceDuree"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Durée de l'expérience</InputLabel>
                      <Select {...field} label="Durée de l'expérience">
                        <MenuItem value="moins_2_ans">Moins de 2 ans</MenuItem>
                        <MenuItem value="2_5_ans">2 à 5 ans</MenuItem>
                        <MenuItem value="5_10_ans">5 à 10 ans</MenuItem>
                        <MenuItem value="plus_10_ans">Plus de 10 ans</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kyc.experienceFinancePoste"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Poste occupé"
                      size="small"
                      fullWidth
                      placeholder="Ex: Conseiller clientèle, Gérant de portefeuille..."
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* CONNAISSANCE DES INSTRUMENTS */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Connaissance des instruments financiers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pour chaque type de produit, indiquez votre niveau de connaissance
        </Typography>

        <Box sx={{ mb: 3 }}>
          {typesInstruments.map((instrument) => (
            <Paper key={instrument.value} variant="outlined" sx={{ p: 2, mb: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {instrument.label}
                      </Typography>
                      <Chip
                        label={instrument.risque === 'faible' ? 'Faible' : instrument.risque === 'moyen' ? 'Moyen' : 'Élevé'}
                        size="small"
                        color={getRisqueColor(instrument.risque)}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {instrument.description}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`kyc.connaissanceInstruments.${instrument.value}.niveau`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Connaissance</InputLabel>
                        <Select {...field} label="Connaissance">
                          {niveauxConnaissance.map((n) => (
                            <MenuItem key={n.value} value={n.value}>
                              {n.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`kyc.connaissanceInstruments.${instrument.value}.frequence`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Fréquence</InputLabel>
                        <Select {...field} label="Fréquence">
                          {frequencesOperation.map((f) => (
                            <MenuItem key={f.value} value={f.value}>
                              {f.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* EXPÉRIENCE D'INVESTISSEMENT */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Expérience d'investissement personnelle
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="kyc.anneesPremierInvestissement"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Depuis combien d'années investissez-vous ?</InputLabel>
                  <Select {...field} label="Depuis combien d'années investissez-vous ?">
                    <MenuItem value="jamais">Jamais investi</MenuItem>
                    <MenuItem value="moins_1_an">Moins d'1 an</MenuItem>
                    <MenuItem value="1_3_ans">1 à 3 ans</MenuItem>
                    <MenuItem value="3_5_ans">3 à 5 ans</MenuItem>
                    <MenuItem value="5_10_ans">5 à 10 ans</MenuItem>
                    <MenuItem value="plus_10_ans">Plus de 10 ans</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="kyc.montantMoyenOperation"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Montant moyen d'une opération</InputLabel>
                  <Select {...field} label="Montant moyen d'une opération">
                    <MenuItem value="moins_1000">Moins de 1 000 €</MenuItem>
                    <MenuItem value="1000_5000">1 000 € à 5 000 €</MenuItem>
                    <MenuItem value="5000_10000">5 000 € à 10 000 €</MenuItem>
                    <MenuItem value="10000_50000">10 000 € à 50 000 €</MenuItem>
                    <MenuItem value="50000_100000">50 000 € à 100 000 €</MenuItem>
                    <MenuItem value="plus_100000">Plus de 100 000 €</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="kyc.gestionParProfessionnel"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Avez-vous déjà confié la gestion de vos investissements à un professionnel ?"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="kyc.conseillerActuel"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Êtes-vous actuellement accompagné par un conseiller financier ?"
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* SOURCES D'INFORMATION */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Sources d'information financière
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Comment vous informez-vous sur les marchés financiers ?
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="kyc.sourcesPresse"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Presse spécialisée"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="kyc.sourcesInternet"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Sites internet financiers"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="kyc.sourcesConseiller"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Conseiller financier"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="kyc.sourcesBanque"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Ma banque"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="kyc.sourcesEntourage"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Entourage / Bouche à oreille"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="kyc.sourcesReseauxSociaux"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Réseaux sociaux"
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* COMPRÉHENSION DES RISQUES */}
        <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
          Compréhension des risques
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="kyc.comprendRisquePerte"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Je comprends que les investissements en instruments financiers comportent un risque de perte en capital"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="kyc.comprendRisqueLiquidite"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Je comprends que certains investissements peuvent être peu liquides (difficiles à revendre rapidement)"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="kyc.comprendRisqueChange"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Je comprends que les investissements en devises étrangères comportent un risque de change"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="kyc.comprendEffetLevier"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value || false} />}
                  label="Je comprends le fonctionnement de l'effet de levier et ses risques"
                />
              )}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
