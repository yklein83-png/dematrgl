/**
 * DocumentList - Affichage en liste/tableau des documents
 * Plus lisible et compact que les cartes
 */

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RegenerateIcon,
  CheckCircle as SignedIcon,
  Schedule as PendingIcon,
  Add as GenerateIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { DocumentType, DOCUMENTS_DISPONIBLES } from '../types/client';

export interface DocumentData {
  id?: string;
  type: DocumentType;
  nom_fichier?: string;
  date_generation?: string;
  signe?: boolean;
  status: 'not_generated' | 'generated' | 'signed' | 'error';
}

interface DocumentListProps {
  documents: DocumentData[];
  clientId: string;
  onGenerate: (type: DocumentType) => Promise<void>;
  onDownload: (documentId: string) => Promise<void>;
  onPreview: (document: DocumentData) => void;
  onEdit: (document: DocumentData) => void;
  onDelete: (documentId: string) => Promise<void>;
  onRegenerate: (type: DocumentType) => Promise<void>;
  getCompletionInfo: (docType: DocumentType) => { percent: number; text: string };
  hasClient: boolean;
}

export default function DocumentList({
  documents,
  clientId,
  onGenerate,
  onDownload,
  onPreview,
  onEdit,
  onDelete,
  onRegenerate,
  getCompletionInfo,
  hasClient,
}: DocumentListProps) {
  const [loadingType, setLoadingType] = useState<DocumentType | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; docId: string; docType: string }>({
    open: false,
    docId: '',
    docType: '',
  });

  const handleGenerate = async (type: DocumentType) => {
    setLoadingType(type);
    try {
      await onGenerate(type);
    } finally {
      setLoadingType(null);
    }
  };

  const handleRegenerate = async (type: DocumentType) => {
    setLoadingType(type);
    try {
      await onRegenerate(type);
    } finally {
      setLoadingType(null);
    }
  };

  const handleDownload = async (docId: string, type: DocumentType) => {
    setLoadingType(type);
    try {
      await onDownload(docId);
    } finally {
      setLoadingType(null);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.docId) {
      await onDelete(deleteDialog.docId);
    }
    setDeleteDialog({ open: false, docId: '', docType: '' });
  };

  const getStatusChip = (status: DocumentData['status']) => {
    switch (status) {
      case 'signed':
        return (
          <Chip
            icon={<SignedIcon sx={{ fontSize: 16 }} />}
            label="Signe"
            size="small"
            color="success"
            sx={{ minWidth: 90 }}
          />
        );
      case 'generated':
        return (
          <Chip
            icon={<PendingIcon sx={{ fontSize: 16 }} />}
            label="Genere"
            size="small"
            color="primary"
            sx={{ minWidth: 90 }}
          />
        );
      default:
        return (
          <Chip
            label="A generer"
            size="small"
            color="default"
            variant="outlined"
            sx={{ minWidth: 90 }}
          />
        );
    }
  };

  const getCompletionChip = (docType: DocumentType) => {
    if (!hasClient) return null;

    const info = getCompletionInfo(docType);
    const color = info.percent === 100 ? 'success' : info.percent >= 50 ? 'warning' : 'error';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
        <LinearProgress
          variant="determinate"
          value={info.percent}
          color={color}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
          {info.text}
        </Typography>
      </Box>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, width: '30%' }}>Document</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '12%' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '18%' }}>Date generation</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%' }}>Remplissage</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc, index) => {
              const docInfo = DOCUMENTS_DISPONIBLES.find((d) => d.type === doc.type);
              const isGenerated = doc.status === 'generated' || doc.status === 'signed';
              const isLoading = loadingType === doc.type;
              const completionInfo = hasClient ? getCompletionInfo(doc.type) : { percent: 0, text: '0/0' };

              return (
                <TableRow
                  key={`${doc.type}-${doc.id || index}`}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {/* Type de document */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DocIcon
                        sx={{
                          fontSize: 20,
                          color: isGenerated ? 'primary.main' : 'action.disabled',
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {docInfo?.label || doc.type}
                        </Typography>
                        {docInfo?.obligatoire && (
                          <Chip label="Obligatoire" size="small" color="warning" sx={{ height: 18, fontSize: 10, mt: 0.5 }} />
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Statut */}
                  <TableCell>{getStatusChip(doc.status)}</TableCell>

                  {/* Date */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(doc.date_generation)}
                    </Typography>
                  </TableCell>

                  {/* Remplissage */}
                  <TableCell>{getCompletionChip(doc.type)}</TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}

                      {!isGenerated ? (
                        // Document non genere
                        <>
                          <Tooltip title="Editer les champs">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(doc)}
                              disabled={isLoading || !hasClient}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<GenerateIcon />}
                            onClick={() => handleGenerate(doc.type)}
                            disabled={isLoading || !hasClient || completionInfo.percent < 100}
                            sx={{ ml: 1 }}
                          >
                            Generer
                          </Button>
                        </>
                      ) : (
                        // Document genere
                        <>
                          <Tooltip title="Previsualiser">
                            <IconButton
                              size="small"
                              onClick={() => onPreview(doc)}
                              disabled={isLoading}
                            >
                              <PreviewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editer les champs">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(doc)}
                              disabled={isLoading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Telecharger">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDownload(doc.id!, doc.type)}
                              disabled={isLoading}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Regenerer">
                            <IconButton
                              size="small"
                              onClick={() => handleRegenerate(doc.type)}
                              disabled={isLoading}
                            >
                              <RegenerateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, docId: doc.id!, docType: docInfo?.label || doc.type })}
                              disabled={isLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog confirmation suppression */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Etes-vous sur de vouloir supprimer le document "{deleteDialog.docType}" ?
            Cette action est irreversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
