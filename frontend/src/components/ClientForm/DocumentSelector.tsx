/**
 * Sélecteur de documents réglementaires
 * Permet de choisir les documents à générer pour un client
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Description as DocIcon,
} from '@mui/icons-material';
import { DocumentType, DocumentSelection, DOCUMENTS_DISPONIBLES } from '../../types/client';

interface DocumentSelectorProps {
  selectedDocuments: DocumentType[];
  onSelectionChange: (documents: DocumentType[]) => void;
}

export default function DocumentSelector({
  selectedDocuments,
  onSelectionChange,
}: DocumentSelectorProps) {
  const handleToggle = (docType: DocumentType, obligatoire: boolean) => {
    // Permettre de tout décocher pour les tests - les docs seront générés individuellement après
    if (selectedDocuments.includes(docType)) {
      onSelectionChange(selectedDocuments.filter((d) => d !== docType));
    } else {
      onSelectionChange([...selectedDocuments, docType]);
    }
  };

  const documentsObligatoires = DOCUMENTS_DISPONIBLES.filter((d) => d.obligatoire);
  const documentsOptionnels = DOCUMENTS_DISPONIBLES.filter((d) => !d.obligatoire);

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Sélectionnez les documents à pré-générer. Vous pourrez générer chaque document
          individuellement depuis la fiche client ou la page Documents.
        </Typography>
      </Alert>

      {/* Documents obligatoires */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Documents obligatoires
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        {documentsObligatoires.map((doc) => {
          const isSelected = selectedDocuments.includes(doc.type);
          return (
            <Card
              key={doc.type}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: isSelected ? 'action.selected' : 'background.paper',
                borderColor: isSelected ? 'primary.main' : 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => handleToggle(doc.type, doc.obligatoire)}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(doc.type, doc.obligatoire)}
                      />
                    }
                    label=""
                    sx={{ mr: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <DocIcon color={isSelected ? 'primary' : 'action'} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {doc.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doc.description}
                    </Typography>
                  </Box>
                  <Chip
                    label="Obligatoire"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Documents optionnels */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Documents optionnels
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {documentsOptionnels.map((doc) => {
          const isSelected = selectedDocuments.includes(doc.type);
          return (
            <Card
              key={doc.type}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: isSelected ? 'action.selected' : 'background.paper',
                borderColor: isSelected ? 'primary.main' : 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => handleToggle(doc.type, doc.obligatoire)}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(doc.type, doc.obligatoire)}
                      />
                    }
                    label=""
                    sx={{ mr: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <DocIcon color={isSelected ? 'primary' : 'action'} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {doc.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doc.description}
                    </Typography>
                  </Box>
                  <Chip
                    label="Optionnel"
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Résumé */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>{selectedDocuments.length}</strong> document(s) sélectionné(s)
          {' - '}
          {documentsObligatoires.length} obligatoire(s),{' '}
          {selectedDocuments.length - documentsObligatoires.length} optionnel(s)
        </Typography>
      </Box>
    </Box>
  );
}
