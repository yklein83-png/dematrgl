/**
 * Documents - Gestion des documents générés
 * Liste complète avec filtres et actions individuelles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import DocumentList from '../components/DocumentList';
import { DocumentData } from '../components/DocumentCard';
import DocumentEditor, { DOCUMENT_REQUIRED_FIELDS } from '../components/DocumentEditor';
import ProfilRisqueEditor from '../components/ProfilRisqueEditor';
import { DocumentType, DOCUMENTS_DISPONIBLES } from '../types/client';
import api from '../services/api';

interface Client {
  id: string;
  numero_client: string;
  t1_nom: string;
  t1_prenom: string;
}

interface DocumentWithClient extends DocumentData {
  client_id: string;
  client_nom?: string;
  client_prenom?: string;
  client_numero?: string;
}

const Documents: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filtres
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Données
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<DocumentWithClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientFullData, setClientFullData] = useState<Record<string, any> | null>(null);

  // Éditeur
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentWithClient | null>(null);
  const [editingClientData, setEditingClientData] = useState<Record<string, any>>({});

  // Messages
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Charger les clients pour l'autocomplete
  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const response = await api.get('/clients', { params: { limit: 100 } });
      const data = response.data;
      // L'API renvoie { total, page, per_page, clients: [...] }
      if (Array.isArray(data)) {
        setClients(data);
      } else if (data && Array.isArray(data.clients)) {
        setClients(data.clients);
      } else if (data && Array.isArray(data.items)) {
        setClients(data.items);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error('Erreur chargement clients:', err);
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  // Charger les documents
  const loadDocuments = useCallback(async () => {
    if (!selectedClient) {
      // Si pas de client sélectionné, afficher tous les types de documents disponibles (non générés)
      const allDocs: DocumentWithClient[] = DOCUMENTS_DISPONIBLES.map((doc) => ({
        type: doc.type,
        status: 'not_generated' as const,
        client_id: '',
      }));
      setDocuments(allDocs);
      setClientFullData(null);
      return;
    }

    setLoading(true);
    try {
      // Récupérer les données complètes du client pour calculer le % de remplissage
      const clientResponse = await api.get(`/clients/${selectedClient.id}`);
      setClientFullData(clientResponse.data);

      // Récupérer les documents existants du client
      const response = await api.get(`/documents/client/${selectedClient.id}`);
      const existingDocs: DocumentWithClient[] = response.data.map((doc: any) => ({
        id: doc.id,
        type: doc.type_document,
        nom_fichier: doc.nom_fichier,
        date_generation: doc.date_generation,
        signe: doc.signe,
        status: doc.signe ? 'signed' : 'generated',
        client_id: selectedClient.id,
        client_nom: selectedClient.t1_nom,
        client_prenom: selectedClient.t1_prenom,
        client_numero: selectedClient.numero_client,
      }));

      // Ajouter les documents non encore générés
      const existingTypes = existingDocs.map((d) => d.type);
      const missingDocs: DocumentWithClient[] = DOCUMENTS_DISPONIBLES
        .filter((d) => !existingTypes.includes(d.type))
        .map((doc) => ({
          type: doc.type,
          status: 'not_generated' as const,
          client_id: selectedClient.id,
          client_nom: selectedClient.t1_nom,
          client_prenom: selectedClient.t1_prenom,
          client_numero: selectedClient.numero_client,
        }));

      setDocuments([...existingDocs, ...missingDocs]);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
      setSnackbar({ open: true, message: 'Erreur lors du chargement des documents', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedClient]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Récupérer le client depuis l'URL si présent
  useEffect(() => {
    const clientIdFromUrl = searchParams.get('client');
    if (clientIdFromUrl && clients.length > 0) {
      const client = clients.find((c) => c.id === clientIdFromUrl);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [searchParams, clients]);

  // Actions sur les documents
  const handleGenerate = async (type: DocumentType) => {
    if (!selectedClient) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner un client', severity: 'error' });
      return;
    }

    try {
      const response = await api.post('/documents/generate', {
        client_id: selectedClient.id,
        type_document: type,
      });

      if (response.data.success) {
        setSnackbar({ open: true, message: `Document ${type} généré avec succès`, severity: 'success' });
        loadDocuments();
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Erreur lors de la génération',
        severity: 'error',
      });
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extraire le nom du fichier du header ou utiliser un nom par défaut
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document.docx';
      if (contentDisposition) {
        const matches = /filename="(.+)"/.exec(contentDisposition);
        if (matches) filename = matches[1];
      }

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
    // Pour l'instant, télécharger le document (preview à implémenter avec un viewer DOCX)
    if (document.id) {
      handleDownload(document.id);
    }
  };

  const handleEdit = async (document: DocumentData) => {
    if (!selectedClient) return;

    // Charger les données du client pour pré-remplir l'éditeur
    try {
      const response = await api.get(`/clients/${selectedClient.id}`);
      const clientData = response.data;

      // Récupérer les données supplémentaires stockées dans form_data
      const formDataExtra = clientData.form_data || {};

      // Mapper les données client vers les champs du document
      // On fusionne les colonnes SQL + les données form_data (champs supplémentaires)
      const mappedData: Record<string, any> = {
        // Titulaire 1
        t1_civilite: clientData.t1_civilite,
        t1_nom: clientData.t1_nom,
        t1_prenom: clientData.t1_prenom,
        t1_date_naissance: clientData.t1_date_naissance,
        t1_lieu_naissance: clientData.t1_lieu_naissance,
        t1_nationalite: clientData.t1_nationalite,
        t1_adresse: clientData.t1_adresse,
        t1_email: clientData.t1_email,
        t1_telephone: clientData.t1_telephone,
        t1_profession: clientData.t1_profession,
        t1_us_person: clientData.t1_us_person,
        // Situation
        situation_familiale: clientData.situation_familiale,
        regime_matrimonial: clientData.regime_matrimonial,
        nombre_enfants: clientData.nombre_enfants,
        // Finances - noms de champs alignés avec le backend
        revenus_annuels_foyer: clientData.revenus_annuels_foyer,
        patrimoine_global: clientData.patrimoine_global,
        capacite_epargne_mensuelle: clientData.capacite_epargne_mensuelle,
        // Profil - noms de champs alignés avec le backend
        objectifs_investissement: clientData.objectifs_investissement,
        horizon_placement: clientData.horizon_placement,
        profil_risque_calcule: clientData.profil_risque_calcule,
        pertes_maximales_acceptables: clientData.pertes_maximales_acceptables,
        tolerance_risque: clientData.tolerance_risque,
        reaction_perte: clientData.reaction_perte,
        // Client info
        client_nom: clientData.t1_nom,
        client_prenom: clientData.t1_prenom,
        // form_data pour accès aux données supplémentaires
        form_data: formDataExtra,
        // Fusionner les champs supplémentaires de form_data directement
        ...formDataExtra,
      };

      setEditingClientData(mappedData);
      setEditingDocument(document as DocumentWithClient);
      setEditorOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données', severity: 'error' });
    }
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
    // Trouver et supprimer l'ancien document, puis régénérer
    const existingDoc = documents.find((d) => d.type === type && d.id);
    if (existingDoc?.id) {
      await handleDelete(existingDoc.id);
    }
    await handleGenerate(type);
  };

  const handleEditorSave = async (data: Record<string, any>) => {
    if (!selectedClient) return;

    try {
      // Mettre à jour les données du client avec les champs modifiés
      await api.patch(`/clients/${selectedClient.id}`, data);

      // Mettre à jour les données locales pour le pré-remplissage
      setEditingClientData((prev) => ({ ...prev, ...data }));

      setSnackbar({ open: true, message: 'Données client sauvegardées', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Erreur lors de la sauvegarde',
        severity: 'error',
      });
    }
  };

  const handleEditorGenerateAndDownload = async (data: Record<string, any>) => {
    if (!editingDocument || !selectedClient) return;

    try {
      // D'abord sauvegarder les données client
      await api.patch(`/clients/${selectedClient.id}`, data);

      // Générer le document avec les données à jour
      const response = await api.post('/documents/generate', {
        client_id: selectedClient.id,
        type_document: editingDocument.type,
        metadata: { custom_fields: data },
      });

      if (response.data.success && response.data.document_id) {
        // Télécharger immédiatement
        await handleDownload(response.data.document_id);
        setEditorOpen(false);
        loadDocuments();
        setSnackbar({ open: true, message: 'Document généré et téléchargé', severity: 'success' });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Erreur lors de la génération',
        severity: 'error',
      });
    }
  };

  // Calculer le % de remplissage pour un type de document
  const getCompletionInfo = (docType: DocumentType): { percent: number; text: string } => {
    if (!clientFullData) return { percent: 0, text: '0/0' };

    const fields = DOCUMENT_REQUIRED_FIELDS[docType] || [];
    const requiredFields = fields.filter((f) => f.required);
    if (requiredFields.length === 0) return { percent: 100, text: '0/0' };

    // Fusionner les données client avec form_data pour vérifier tous les champs
    const formData = clientFullData.form_data || {};
    const allData = { ...clientFullData, ...formData };

    const filledFields = requiredFields.filter((f) => {
      const value = allData[f.key];
      return value !== null && value !== undefined && value !== '';
    });

    const percent = Math.round((filledFields.length / requiredFields.length) * 100);
    return {
      percent,
      text: `${filledFields.length}/${requiredFields.length}`,
    };
  };

  // Filtrer les documents
  const filteredDocuments = documents.filter((doc) => {
    if (selectedType && doc.type !== selectedType) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'generated' && doc.status !== 'generated' && doc.status !== 'signed') return false;
      if (statusFilter === 'not_generated' && doc.status !== 'not_generated') return false;
      if (statusFilter === 'signed' && doc.status !== 'signed') return false;
    }
    return true;
  });

  return (
    <Box>
      <PageHeader
        title="Documents"
        subtitle="Gestion individuelle des documents réglementaires"
        action={
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadDocuments}
            disabled={loading}
          >
            Actualiser
          </Button>
        }
      />

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => `${option.numero_client} - ${option.t1_nom} ${option.t1_prenom}`}
                value={selectedClient}
                onChange={(_, newValue) => {
                  setSelectedClient(newValue);
                  if (newValue) {
                    setSearchParams({ client: newValue.id });
                  } else {
                    setSearchParams({});
                  }
                }}
                loading={clientsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Client"
                    placeholder="Rechercher un client..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type de document</InputLabel>
                <Select
                  value={selectedType}
                  label="Type de document"
                  onChange={(e) => setSelectedType(e.target.value as DocumentType | '')}
                >
                  <MenuItem value="">Tous les types</MenuItem>
                  {DOCUMENTS_DISPONIBLES.map((doc) => (
                    <MenuItem key={doc.type} value={doc.type}>
                      {doc.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous les statuts</MenuItem>
                  <MenuItem value="not_generated">Non générés</MenuItem>
                  <MenuItem value="generated">Générés</MenuItem>
                  <MenuItem value="signed">Signés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`${filteredDocuments.length} doc(s)`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Message si pas de client sélectionné */}
      {!selectedClient && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Sélectionnez un client pour voir et gérer ses documents.
        </Alert>
      )}

      {/* Liste des documents */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DocumentList
          documents={filteredDocuments}
          clientId={selectedClient?.id || ''}
          onGenerate={handleGenerate}
          onDownload={handleDownload}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRegenerate={handleRegenerate}
          getCompletionInfo={getCompletionInfo}
          hasClient={!!selectedClient}
        />
      )}

      {/* Éditeur de document - Interface spéciale pour Profil de Risque */}
      {editingDocument && editingDocument.type === 'PROFIL_RISQUE' ? (
        <ProfilRisqueEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          clientData={editingClientData}
          onSave={handleEditorSave}
          onGenerateAndDownload={handleEditorGenerateAndDownload}
        />
      ) : editingDocument && (
        <DocumentEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          documentType={editingDocument.type}
          clientData={editingClientData}
          onSave={handleEditorSave}
          onGenerateAndDownload={handleEditorGenerateAndDownload}
        />
      )}

      {/* Snackbar messages */}
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

export default Documents;
