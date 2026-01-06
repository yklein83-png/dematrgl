/**
 * ClientForm Page - Formulaire de création/édition client
 * Conformité AMF/ACPR - MIF2 - SFDR
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { ClientForm as ClientFormComponent } from '../../components/ClientForm';
import { ClientFormData, defaultClientFormData } from '../../types/client';
import api from '../../services/api';

const ClientFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // État
  const [loading, setLoading] = useState(isEdit);
  const [initialData, setInitialData] = useState<Partial<ClientFormData> | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les données existantes en mode édition
  useEffect(() => {
    if (isEdit && id) {
      loadClientData(id);
    }
  }, [isEdit, id]);

  const loadClientData = async (clientId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/clients/${clientId}`);
      // Transformer les données du backend au format du formulaire
      setInitialData(transformBackendToFormData(response.data));
    } catch (err) {
      setError('Erreur lors du chargement des données client');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Transformer les données backend vers le format formulaire
  const transformBackendToFormData = (backendData: any): Partial<ClientFormData> => {
    // Si le backend a stocké les données complètes du formulaire, les utiliser
    if (backendData.form_data) {
      return backendData.form_data;
    }

    // Sinon, reconstruire à partir des champs individuels
    return {
      ...defaultClientFormData,
      titulaire1: {
        ...defaultClientFormData.titulaire1,
        nom: backendData.nom || '',
        prenom: backendData.prenom || '',
        email: backendData.email || '',
        telephone: backendData.telephone || '',
        dateNaissance: backendData.date_naissance || '',
        adresse: backendData.adresse || '',
        codePostal: backendData.code_postal || '',
        ville: backendData.ville || '',
        nationalite: backendData.nationalite || 'francaise',
        profession: backendData.profession || '',
      },
      situationFamiliale: {
        ...defaultClientFormData.situationFamiliale,
        situation: backendData.situation_familiale || 'celibataire',
        nombreEnfants: backendData.nombre_enfants || 0,
      },
      documentsSelectionnes: backendData.documents_selectionnes || [],
    };
  };

  // Soumission du formulaire - utilise l'endpoint /form pour les données complètes
  const handleSubmit = async (data: ClientFormData) => {
    try {
      // Envoyer les données complètes du formulaire
      const payload = {
        form_data: data,
        statut: 'actif',
      };

      if (isEdit && id) {
        await api.put(`/clients/${id}/form`, payload);
        setSuccessMessage('Client mis à jour avec succès');
      } else {
        const response = await api.post('/clients/form', payload);
        setSuccessMessage('Client créé avec succès');
        // Rediriger vers la page de détail après création
        setTimeout(() => {
          navigate(`/clients/${response.data.id}`);
        }, 1500);
      }
    } catch (err) {
      throw new Error('Erreur lors de l\'enregistrement du client');
    }
  };

  // Sauvegarde brouillon
  const handleSaveDraft = async (data: ClientFormData) => {
    try {
      const payload = {
        form_data: data,
        statut: 'brouillon',
      };

      if (isEdit && id) {
        await api.put(`/clients/${id}/form`, payload);
      } else {
        await api.post('/clients/form', payload);
      }
      setSuccessMessage('Brouillon sauvegardé');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du brouillon');
    }
  };

  // Affichage chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Modifier le client' : 'Nouveau client'}
        subtitle={
          isEdit
            ? 'Modification des informations réglementaires'
            : 'Création d\'un nouveau dossier client avec liasse réglementaire'
        }
        action={
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/clients')}
          >
            Retour à la liste
          </Button>
        }
      />

      {/* Erreur générale */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Formulaire */}
      <ClientFormComponent
        initialData={initialData}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        clientId={id}
        mode={isEdit ? 'edit' : 'create'}
      />

      {/* Message de succès */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientFormPage;
