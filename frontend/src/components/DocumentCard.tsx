/**
 * DocumentCard - Carte individuelle pour un document
 * Actions: Prévisualiser, Éditer champs, Générer, Télécharger, Supprimer
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Description as DocIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Refresh as RegenerateIcon,
  CheckCircle as SignedIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon,
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

interface DocumentCardProps {
  document: DocumentData;
  clientId: string;
  onGenerate: (type: DocumentType) => Promise<void>;
  onDownload: (documentId: string) => Promise<void>;
  onPreview: (document: DocumentData) => void;
  onEdit: (document: DocumentData) => void;
  onDelete: (documentId: string) => Promise<void>;
  onRegenerate: (type: DocumentType) => Promise<void>;
  loading?: boolean;
  /** Pourcentage de remplissage des champs requis (0-100) */
  completionPercent?: number;
  /** Nombre de champs remplis / requis */
  completionText?: string;
  /** Liste des labels des champs manquants */
  missingFields?: string[];
}

export default function DocumentCard({
  document,
  clientId,
  onGenerate,
  onDownload,
  onPreview,
  onEdit,
  onDelete,
  onRegenerate,
  loading = false,
  completionPercent,
  completionText,
  missingFields = [],
}: DocumentCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Récupérer les infos du type de document
  const docInfo = DOCUMENTS_DISPONIBLES.find((d) => d.type === document.type);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGenerate = async () => {
    setActionLoading(true);
    try {
      await onGenerate(document.type);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async () => {
    handleMenuClose();
    setActionLoading(true);
    try {
      await onRegenerate(document.type);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async () => {
    if (document.id) {
      setActionLoading(true);
      try {
        await onDownload(document.id);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    if (document.id) {
      setActionLoading(true);
      try {
        await onDelete(document.id);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getStatusChip = () => {
    switch (document.status) {
      case 'signed':
        return (
          <Chip
            icon={<SignedIcon />}
            label="Signé"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'generated':
        return (
          <Chip
            icon={<PendingIcon />}
            label="Généré"
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      case 'error':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Erreur"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            label="Non généré"
            size="small"
            color="default"
            variant="outlined"
          />
        );
    }
  };

  const isGenerated = document.status === 'generated' || document.status === 'signed';
  const isLoading = loading || actionLoading;

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 2,
          },
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <DocIcon
              sx={{
                fontSize: 40,
                color: isGenerated ? 'primary.main' : 'action.disabled',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {docInfo?.label || document.type}
                </Typography>
                {docInfo?.obligatoire && (
                  <Chip label="Obligatoire" size="small" color="warning" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {docInfo?.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {getStatusChip()}
                {document.date_generation && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(document.date_generation).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                )}
                {/* Affichage du % de remplissage */}
                {completionPercent !== undefined && (
                  <Chip
                    label={completionText || `${completionPercent}%`}
                    size="small"
                    color={completionPercent === 100 ? 'success' : completionPercent >= 50 ? 'warning' : 'error'}
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </Box>
            {isGenerated && (
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}

          {!isGenerated ? (
            <>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEdit(document)}
                disabled={isLoading}
              >
                Éditer
              </Button>
              <Tooltip
                title={
                  completionPercent !== undefined && completionPercent < 100 ? (
                    <div>
                      <strong>Champs manquants :</strong>
                      <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                        {missingFields.slice(0, 8).map((field, i) => (
                          <li key={i}>{field}</li>
                        ))}
                        {missingFields.length > 8 && (
                          <li>... et {missingFields.length - 8} autres</li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    "Générer le document"
                  )
                }
              >
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DocIcon />}
                    onClick={handleGenerate}
                    disabled={isLoading || (completionPercent !== undefined && completionPercent < 100)}
                  >
                    Générer
                  </Button>
                </span>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Prévisualiser">
                <IconButton
                  size="small"
                  onClick={() => onPreview(document)}
                  disabled={isLoading}
                >
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Éditer les champs">
                <IconButton
                  size="small"
                  onClick={() => onEdit(document)}
                  disabled={isLoading}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={isLoading}
              >
                Télécharger
              </Button>
            </>
          )}
        </CardActions>
      </Card>

      {/* Menu actions supplémentaires */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRegenerate}>
          <ListItemIcon>
            <RegenerateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Régénérer</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDeleteDialogOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog confirmation suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce document ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
