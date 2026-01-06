/**
 * Hook personnalisé pour la gestion des documents d'un client
 * Extrait de ClientDetail pour meilleure lisibilité
 */

import { useState, useCallback } from 'react';
import api from '../services/api';
import { DocumentData } from '../components/DocumentCard';
import { DocumentType, DOCUMENTS_DISPONIBLES } from '../types/client';

interface DocumentApiResponse {
  id: string;
  type_document: string;
  nom_fichier: string;
  date_generation: string;
  signe: boolean;
}

interface UseClientDocumentsReturn {
  documents: DocumentData[];
  loading: boolean;
  loadDocuments: () => Promise<void>;
  generateDocument: (type: DocumentType) => Promise<{ success: boolean; message: string }>;
  downloadDocument: (documentId: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<boolean>;
}

export function useClientDocuments(clientId: string | undefined): UseClientDocumentsReturn {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      const response = await api.get(`/documents/client/${clientId}`);
      const existingDocs: DocumentData[] = response.data.map((doc: DocumentApiResponse) => ({
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
      setLoading(false);
    }
  }, [clientId]);

  const generateDocument = useCallback(async (type: DocumentType): Promise<{ success: boolean; message: string }> => {
    if (!clientId) {
      return { success: false, message: 'Client ID manquant' };
    }

    try {
      const response = await api.post('/documents/generate', {
        client_id: clientId,
        type_document: type,
      });

      if (response.data.success) {
        await loadDocuments();
        return { success: true, message: `Document ${type} généré avec succès` };
      }
      return { success: false, message: 'Échec de la génération' };
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string | Array<{ msg?: string; message?: string }> | { msg?: string; message?: string } } } };
      const detail = axiosError.response?.data?.detail;

      let errorMessage = 'Erreur lors de la génération';
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail.map((e) => e.msg || e.message || JSON.stringify(e)).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorMessage = detail.msg || detail.message || JSON.stringify(detail);
      }

      console.error('Erreur génération document:', axiosError.response?.data);
      return { success: false, message: errorMessage };
    }
  }, [clientId, loadDocuments]);

  const downloadDocument = useCallback(async (documentId: string): Promise<void> => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob',
      });

      // Extraire le nom de fichier depuis le header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document.docx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[*]?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Télécharger le fichier
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      throw err;
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      await api.delete(`/documents/${documentId}`);
      await loadDocuments();
      return true;
    } catch (err) {
      console.error('Erreur suppression:', err);
      return false;
    }
  }, [loadDocuments]);

  return {
    documents,
    loading,
    loadDocuments,
    generateDocument,
    downloadDocument,
    deleteDocument,
  };
}

export default useClientDocuments;
