/**
 * ClientDetail - Vue détaillée d'un client
 * Affichage complet des informations et gestion des documents
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Tabs,
  Tab,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  AccountBalance as FinanceIcon,
  Assessment as RiskIcon,
  Folder as FolderIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import DocumentList from '../../components/DocumentList';
import { DocumentData } from '../../components/DocumentCard';
import DocumentEditor, { DOCUMENT_REQUIRED_FIELDS } from '../../components/DocumentEditor';
import { DocumentType, DOCUMENTS_DISPONIBLES } from '../../types/client';
import api from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ClientDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // États
  const [activeTab, setActiveTab] = useState(0);
  const [client, setClient] = useState<Record<string, unknown> | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Éditeur
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [editingClientData, setEditingClientData] = useState<Record<string, unknown>>({});

  // Messages
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Charger le client
  const loadClient = useCallback(async () => {
    if (!id) return;

    try {
      const response = await api.get(`/clients/${id}`);
      setClient(response.data);
    } catch (err) {
      console.error('Erreur chargement client:', err);
      setSnackbar({ open: true, message: 'Erreur lors du chargement du client', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Charger les documents
  const loadDocuments = useCallback(async () => {
    if (!id) return;

    setDocumentsLoading(true);
    try {
      const response = await api.get(`/documents/client/${id}`);
      const existingDocs: DocumentData[] = response.data.map((doc: { id: string; type_document: string; nom_fichier: string; date_generation: string; signe: boolean }) => ({
        id: doc.id,
        type: doc.type_document,
        nom_fichier: doc.nom_fichier,
        date_generation: doc.date_generation,
        signe: doc.signe,
        status: doc.signe ? 'signed' : 'generated',
      }));

      // Ajouter les documents non générés
      const existingTypes = existingDocs.map((d) => d.type);
      const missingDocs: DocumentData[] = DOCUMENTS_DISPONIBLES
        .filter((d) => !existingTypes.includes(d.type))
        .map((doc) => ({
          type: doc.type,
          status: 'not_generated' as const,
        }));

      setDocuments([...existingDocs, ...missingDocs]);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
    } finally {
      setDocumentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClient();
    loadDocuments();
  }, [loadClient, loadDocuments]);

  // Actions documents
  const handleGenerate = async (type: DocumentType) => {
    if (!id) return;

    try {
      const response = await api.post('/documents/generate', {
        client_id: id,
        type_document: type,
      });

      if (response.data.success) {
        setSnackbar({ open: true, message: `Document ${type} généré avec succès`, severity: 'success' });
        loadDocuments();
      }
    } catch (err: unknown) {
      // Gérer les différents formats d'erreur API
      let errorMessage = 'Erreur lors de la génération';
      const axiosError = err as { response?: { data?: { detail?: string | Array<{ msg?: string; message?: string }> | { msg?: string; message?: string } } } };
      const detail = axiosError.response?.data?.detail;

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        // Erreur de validation Pydantic (tableau d'objets)
        errorMessage = detail.map((e) => e.msg || e.message || JSON.stringify(e)).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorMessage = detail.msg || detail.message || JSON.stringify(detail);
      }

      console.error('Erreur génération document:', axiosError.response?.data);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob',
      });

      // Extraire le nom de fichier depuis le header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document.docx';
      if (contentDisposition) {
        // Format: attachment; filename="NOM_FICHIER.docx" ou filename*=UTF-8''NOM_FICHIER.docx
        const filenameMatch = contentDisposition.match(/filename[*]?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors du téléchargement', severity: 'error' });
    }
  };

  const handlePreview = (document: DocumentData) => {
    if (document.id) {
      handleDownload(document.id);
    }
  };

  const handleEdit = (document: DocumentData) => {
    if (!client) return;

    // Récupérer les données supplémentaires stockées dans form_data
    const formDataExtra = (client as any).form_data || {};

    // Passer toutes les données du client + les données form_data fusionnées
    // form_data contient les champs supplémentaires stockés en JSON
    setEditingClientData({ ...client, ...formDataExtra });
    setEditingDocument(document);
    setEditorOpen(true);
  };

  const handleDelete = async (documentId: string) => {
    try {
      await api.delete(`/documents/${documentId}`, { params: { delete_file: true } });
      setSnackbar({ open: true, message: 'Document supprimé', severity: 'success' });
      loadDocuments();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const handleRegenerate = async (type: DocumentType) => {
    const existingDoc = documents.find((d) => d.type === type && d.id);
    if (existingDoc?.id) {
      await handleDelete(existingDoc.id);
    }
    await handleGenerate(type);
  };

  const handleEditorSave = async (data: Record<string, unknown>) => {
    if (!id) return;

    try {
      // Sauvegarder les données du client en base
      await api.patch(`/clients/${id}`, data);

      // Recharger le client pour avoir les données à jour
      await loadClient();

      setSnackbar({ open: true, message: 'Modifications sauvegardées', severity: 'success' });
      setEditorOpen(false);
    } catch (err: unknown) {
      console.error('Erreur sauvegarde:', err);
      // Gérer les erreurs de validation Pydantic (422) qui sont des tableaux d'objets
      let errorMessage = 'Erreur lors de la sauvegarde';
      const axiosError = err as { response?: { data?: { detail?: string | Array<{ msg?: string }> | { msg?: string } } } };
      const detail = axiosError.response?.data?.detail;
      if (detail) {
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // Erreur de validation Pydantic - extraire les messages
          errorMessage = detail.map((e) => e.msg || String(e)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || JSON.stringify(detail);
        }
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleEditorGenerateAndDownload = async (data: Record<string, unknown>) => {
    if (!editingDocument || !id) return;

    try {
      const response = await api.post('/documents/generate', {
        client_id: id,
        type_document: editingDocument.type,
        metadata: { custom_fields: data },
      });

      if (response.data.success && response.data.document_id) {
        await handleDownload(response.data.document_id);
        setEditorOpen(false);
        loadDocuments();
        setSnackbar({ open: true, message: 'Document généré et téléchargé', severity: 'success' });
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setSnackbar({
        open: true,
        message: axiosError.response?.data?.detail || 'Erreur lors de la génération',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box>
        <Alert severity="error">Client non trouvé</Alert>
        <Button onClick={() => navigate('/clients')} sx={{ mt: 2 }}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  // Compter les documents générés
  const generatedCount = documents.filter((d) => d.status === 'generated' || d.status === 'signed').length;
  const totalCount = documents.length;

  // Calculer le % de remplissage pour un type de document
  const getCompletionInfo = (docType: DocumentType): { percent: number; text: string; missingFields: string[] } => {
    if (!client) return { percent: 0, text: '0/0', missingFields: [] };

    const fields = DOCUMENT_REQUIRED_FIELDS[docType] || [];
    const requiredFields = fields.filter((f) => f.required);
    if (requiredFields.length === 0) return { percent: 100, text: '0/0', missingFields: [] };

    // Fusionner les données client avec form_data pour vérifier tous les champs
    const formData = (client as any).form_data || {};
    const allData = { ...client, ...formData };

    const filledFields: typeof requiredFields = [];
    const missingFields: string[] = [];

    requiredFields.forEach((f) => {
      const value = allData[f.key];
      if (value !== null && value !== undefined && value !== '') {
        filledFields.push(f);
      } else {
        missingFields.push(f.label);
      }
    });

    const percent = Math.round((filledFields.length / requiredFields.length) * 100);
    return {
      percent,
      text: `${filledFields.length}/${requiredFields.length}`,
      missingFields,
    };
  };

  return (
    <Box>
      <PageHeader
        title={`${client.t1_prenom} ${client.t1_nom}`}
        subtitle={`${client.numero_client} - ${client.statut || 'Prospect'}`}
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/clients')}
            >
              Retour
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clients/${id}/edit`)}
            >
              Modifier
            </Button>
            <Button
              variant="contained"
              startIcon={<DocumentIcon />}
              onClick={() => navigate(`/documents?client=${id}`)}
            >
              Tous les documents
            </Button>
          </Box>
        }
      />

      {/* Onglets */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Informations" iconPosition="start" />
          <Tab
            icon={<DocumentIcon />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Documents
                <Chip label={`${generatedCount}/${totalCount}`} size="small" color="primary" />
              </Box>
            }
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Onglet Informations */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Identité */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6">Identité</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Civilité</Typography>
                    <Typography>{client.t1_civilite || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Nom complet</Typography>
                    <Typography>{client.t1_prenom} {client.t1_nom}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Date de naissance</Typography>
                    <Typography>
                      {client.t1_date_naissance
                        ? new Date(client.t1_date_naissance).toLocaleDateString('fr-FR')
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Nationalité</Typography>
                    <Typography>{client.t1_nationalite || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Adresse</Typography>
                    <Typography>{client.t1_adresse || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography>{client.t1_email || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                    <Typography>{client.t1_telephone || '-'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Situation */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FamilyIcon color="primary" />
                  <Typography variant="h6">Situation</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Situation familiale</Typography>
                    <Typography>{client.situation_familiale || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Profession</Typography>
                    <Typography>{client.t1_profession || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Revenus annuels</Typography>
                    <Typography>{client.revenus_annuels || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Patrimoine global</Typography>
                    <Typography>{client.patrimoine_global || '-'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Profil de risque */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <RiskIcon color="primary" />
                  <Typography variant="h6">Profil de risque</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Profil</Typography>
                    <Chip
                      label={client.profil_risque || 'Non défini'}
                      color={
                        client.profil_risque === 'prudent' ? 'success' :
                        client.profil_risque === 'equilibre' ? 'info' :
                        client.profil_risque === 'dynamique' ? 'warning' :
                        client.profil_risque === 'offensif' ? 'error' : 'default'
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Horizon de placement</Typography>
                    <Typography>{client.horizon_placement || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Niveau LCB-FT</Typography>
                    <Chip
                      label={client.lcb_ft_niveau || 'Standard'}
                      size="small"
                      color={
                        client.lcb_ft_niveau === 'Faible' ? 'success' :
                        client.lcb_ft_niveau === 'Standard' ? 'info' :
                        client.lcb_ft_niveau === 'Renforce' ? 'warning' :
                        client.lcb_ft_niveau === 'Eleve' ? 'error' : 'default'
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Métadonnées */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FinanceIcon color="primary" />
                  <Typography variant="h6">Informations dossier</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Numéro client</Typography>
                    <Typography>{client.numero_client}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Statut</Typography>
                    <Chip
                      label={client.statut || 'prospect'}
                      color={client.statut === 'actif' ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Créé le</Typography>
                    <Typography>
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Modifié le</Typography>
                    <Typography>
                      {client.updated_at
                        ? new Date(client.updated_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Onglet Documents */}
      <TabPanel value={activeTab} index={1}>
        {documentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* En-tete avec statut global */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Dossier Reglementaire
                </Typography>
                {/* Indicateur de statut global */}
                {(() => {
                  const mainDocs = documents.filter(d =>
                    ['DER', 'QCC', 'PROFIL_RISQUE', 'LETTRE_MISSION'].includes(d.type)
                  );
                  const generatedDocs = mainDocs.filter(d => d.status === 'generated' || d.status === 'signed');

                  if (generatedDocs.length === 0) {
                    return <Chip icon={<WarningIcon />} label="Incomplet" color="error" size="small" />;
                  } else if (generatedDocs.length === mainDocs.length) {
                    return <Chip icon={<CheckIcon />} label="Complet" color="success" size="small" />;
                  } else {
                    return <Chip icon={<ScheduleIcon />} label={`${generatedDocs.length}/${mainDocs.length}`} color="warning" size="small" />;
                  }
                })()}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={loadDocuments}
              >
                Actualiser
              </Button>
            </Box>

            {/* Liste des documents en tableau */}
            <DocumentList
              documents={documents}
              clientId={id || ''}
              onGenerate={handleGenerate}
              onDownload={handleDownload}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
              getCompletionInfo={(docType) => {
                const info = getCompletionInfo(docType);
                return { percent: info.percent, text: info.text };
              }}
              hasClient={true}
            />
          </Box>
        )}
      </TabPanel>

      {/* Éditeur de document */}
      {editingDocument && (
        <DocumentEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          documentType={editingDocument.type}
          clientData={editingClientData}
          onSave={handleEditorSave}
          onGenerateAndDownload={handleEditorGenerateAndDownload}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientDetail;
