/**
 * Section Patrimoine Détaillé
 * Conformité AMF/ACPR - Inventaire complet des actifs et passifs
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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalanceWallet as PatrimoineIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { ClientFormData, FormeDetention } from '../../types/client';

interface SectionPatrimoineProps {
  control: Control<ClientFormData>;
  errors: any;
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

const formesDetention: { value: FormeDetention; label: string }[] = [
  { value: 'pleine_propriete', label: 'Pleine propriété' },
  { value: 'usufruit', label: 'Usufruit' },
  { value: 'nue_propriete', label: 'Nue-propriété' },
  { value: 'indivision', label: 'Indivision' },
];

export default function SectionPatrimoine({
  control,
  errors,
  expanded,
  onExpandChange,
}: SectionPatrimoineProps) {
  // Field arrays pour chaque type de patrimoine
  const {
    fields: actifsFinanciers,
    append: appendFinancier,
    remove: removeFinancier,
  } = useFieldArray({ control, name: 'patrimoine.actifsFinanciers' });

  const {
    fields: actifsImmobiliers,
    append: appendImmobilier,
    remove: removeImmobilier,
  } = useFieldArray({ control, name: 'patrimoine.actifsImmobiliers' });

  const {
    fields: actifsProfessionnels,
    append: appendProfessionnel,
    remove: removeProfessionnel,
  } = useFieldArray({ control, name: 'patrimoine.actifsProfessionnels' });

  const {
    fields: emprunts,
    append: appendEmprunt,
    remove: removeEmprunt,
  } = useFieldArray({ control, name: 'patrimoine.emprunts' });

  const {
    fields: revenus,
    append: appendRevenu,
    remove: removeRevenu,
  } = useFieldArray({ control, name: 'patrimoine.revenus' });

  const {
    fields: charges,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({ control, name: 'patrimoine.charges' });

  return (
    <Accordion expanded={expanded} onChange={(_, exp) => onExpandChange(exp)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PatrimoineIcon color="primary" />
          <Typography variant="h6">Patrimoine Détaillé</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* ACTIFS FINANCIERS */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Actifs Financiers
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                appendFinancier({
                  designation: '',
                  organisme: '',
                  valeur: 0,
                  detenteur: '',
                  formeDetention: 'pleine_propriete',
                  dateSouscription: null,
                })
              }
            >
              Ajouter
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Liquidités, comptes titres, PEA, assurance-vie, PER, etc.
          </Typography>

          {actifsFinanciers.length === 0 ? (
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">Aucun actif financier renseigné</Typography>
            </Card>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Désignation</TableCell>
                    <TableCell>Organisme</TableCell>
                    <TableCell>Valeur (€)</TableCell>
                    <TableCell>Détenteur</TableCell>
                    <TableCell>Forme</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {actifsFinanciers.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsFinanciers.${index}.designation`}
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} size="small" fullWidth placeholder="Ex: PEA" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsFinanciers.${index}.organisme`}
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} size="small" fullWidth placeholder="Banque" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsFinanciers.${index}.valeur`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              fullWidth
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsFinanciers.${index}.detenteur`}
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} size="small" fullWidth placeholder="T1/T2/Commun" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsFinanciers.${index}.formeDetention`}
                          control={control}
                          render={({ field }) => (
                            <FormControl size="small" fullWidth>
                              <Select {...field}>
                                {formesDetention.map((f) => (
                                  <MenuItem key={f.value} value={f.value}>
                                    {f.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsFinanciers.${index}.dateSouscription`}
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              slotProps={{
                                textField: { size: 'small', fullWidth: true },
                              }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeFinancier(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* ACTIFS IMMOBILIERS */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Actifs Immobiliers
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                appendImmobilier({
                  designation: '',
                  formePropriete: 'pleine_propriete',
                  valeurAcquisition: 0,
                  valeurActuelle: 0,
                  revenusAnnuels: 0,
                  chargesAnnuelles: 0,
                  creditEnCours: false,
                  capitalRestantDu: 0,
                })
              }
            >
              Ajouter
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Résidence principale, secondaire, locatif, SCPI, etc.
          </Typography>

          {actifsImmobiliers.length === 0 ? (
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">Aucun actif immobilier renseigné</Typography>
            </Card>
          ) : (
            actifsImmobiliers.map((item, index) => (
              <Card key={item.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name={`patrimoine.actifsImmobiliers.${index}.designation`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Désignation"
                            size="small"
                            fullWidth
                            placeholder="Ex: Résidence principale"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Controller
                        name={`patrimoine.actifsImmobiliers.${index}.formePropriete`}
                        control={control}
                        render={({ field }) => (
                          <FormControl size="small" fullWidth>
                            <InputLabel>Forme</InputLabel>
                            <Select {...field} label="Forme">
                              {formesDetention.map((f) => (
                                <MenuItem key={f.value} value={f.value}>
                                  {f.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                      <Controller
                        name={`patrimoine.actifsImmobiliers.${index}.valeurAcquisition`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Val. acquisition"
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
                    <Grid item xs={6} sm={3} md={2}>
                      <Controller
                        name={`patrimoine.actifsImmobiliers.${index}.valeurActuelle`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Val. actuelle"
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
                    <Grid item xs={6} sm={3} md={2}>
                      <Controller
                        name={`patrimoine.actifsImmobiliers.${index}.revenusAnnuels`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Revenus/an"
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
                    <Grid item xs={6} sm={3} md={1}>
                      <IconButton color="error" onClick={() => removeImmobilier(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>

                    {/* Ligne 2 : charges et crédit */}
                    <Grid item xs={6} sm={3} md={3}>
                      <Controller
                        name={`patrimoine.actifsImmobiliers.${index}.chargesAnnuelles`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Charges/an"
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
                    <Grid item xs={6} sm={3} md={3}>
                      <Controller
                        name={`patrimoine.actifsImmobiliers.${index}.capitalRestantDu`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Capital restant dû"
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
                </CardContent>
              </Card>
            ))
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* ACTIFS PROFESSIONNELS */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Actifs Professionnels
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                appendProfessionnel({
                  designation: '',
                  capitalDetenu: 0,
                  valeur: 0,
                  chargesAnnuelles: 0,
                })
              }
            >
              Ajouter
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Parts sociales, fonds de commerce, entreprise individuelle, etc.
          </Typography>

          {actifsProfessionnels.length === 0 ? (
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">Aucun actif professionnel renseigné</Typography>
            </Card>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Désignation</TableCell>
                    <TableCell>Capital détenu (%)</TableCell>
                    <TableCell>Valeur estimée (€)</TableCell>
                    <TableCell>Charges annuelles (€)</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {actifsProfessionnels.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsProfessionnels.${index}.designation`}
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} size="small" fullWidth placeholder="Ex: SARL XXX" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsProfessionnels.${index}.capitalDetenu`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
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
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsProfessionnels.${index}.valeur`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              fullWidth
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.actifsProfessionnels.${index}.chargesAnnuelles`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              fullWidth
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeProfessionnel(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* EMPRUNTS / PASSIF */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Emprunts et Passif
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                appendEmprunt({
                  objet: '',
                  emprunteur: '',
                  dateDebut: null,
                  dateFin: null,
                  capitalInitial: 0,
                  capitalRestant: 0,
                  echeanceMensuelle: 0,
                  tauxInteret: 0,
                })
              }
            >
              Ajouter
            </Button>
          </Box>

          {emprunts.length === 0 ? (
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">Aucun emprunt renseigné</Typography>
            </Card>
          ) : (
            emprunts.map((item, index) => (
              <Card key={item.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.objet`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Objet"
                            size="small"
                            fullWidth
                            placeholder="Ex: Résidence principale"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.emprunteur`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Emprunteur"
                            size="small"
                            fullWidth
                            placeholder="T1/T2/Commun"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.dateDebut`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Début"
                            value={field.value}
                            onChange={field.onChange}
                            slotProps={{
                              textField: { size: 'small', fullWidth: true },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.dateFin`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Fin"
                            value={field.value}
                            onChange={field.onChange}
                            slotProps={{
                              textField: { size: 'small', fullWidth: true },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.tauxInteret`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Taux"
                            type="number"
                            size="small"
                            fullWidth
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              inputProps: { min: 0, max: 100, step: 0.01 },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3} md={1}>
                      <IconButton color="error" onClick={() => removeEmprunt(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>

                    {/* Ligne 2 : montants */}
                    <Grid item xs={6} sm={3} md={3}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.capitalInitial`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Capital initial"
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
                    <Grid item xs={6} sm={3} md={3}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.capitalRestant`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Capital restant"
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
                    <Grid item xs={6} sm={3} md={3}>
                      <Controller
                        name={`patrimoine.emprunts.${index}.echeanceMensuelle`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Échéance/mois"
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
                </CardContent>
              </Card>
            ))
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* REVENUS DÉTAILLÉS */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Revenus Détaillés
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                appendRevenu({
                  type: '',
                  montantAnnuel: 0,
                  beneficiaire: '',
                })
              }
            >
              Ajouter
            </Button>
          </Box>

          {revenus.length === 0 ? (
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">Aucun revenu détaillé renseigné</Typography>
            </Card>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Type de revenu</TableCell>
                    <TableCell>Montant annuel (€)</TableCell>
                    <TableCell>Bénéficiaire</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenus.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Controller
                          name={`patrimoine.revenus.${index}.type`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              fullWidth
                              placeholder="Ex: Salaires, Dividendes, Loyers..."
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.revenus.${index}.montantAnnuel`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              fullWidth
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.revenus.${index}.beneficiaire`}
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} size="small" fullWidth placeholder="T1/T2" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeRevenu(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* CHARGES DÉTAILLÉES */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Charges Détaillées
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                appendCharge({
                  type: '',
                  montantAnnuel: 0,
                  debiteur: '',
                })
              }
            >
              Ajouter
            </Button>
          </Box>

          {charges.length === 0 ? (
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">Aucune charge détaillée renseignée</Typography>
            </Card>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Type de charge</TableCell>
                    <TableCell>Montant annuel (€)</TableCell>
                    <TableCell>Débiteur</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {charges.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Controller
                          name={`patrimoine.charges.${index}.type`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              fullWidth
                              placeholder="Ex: Loyer, Impôts, Pension..."
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.charges.${index}.montantAnnuel`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              fullWidth
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`patrimoine.charges.${index}.debiteur`}
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} size="small" fullWidth placeholder="T1/T2/Commun" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeCharge(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
