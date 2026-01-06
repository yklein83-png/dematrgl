/**
 * Panneau d'indicateurs de complétion des documents
 * Proposition A: Affichage en temps réel de l'état de complétion de chaque document
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DocIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { DocumentCompletionResult } from '../utils/documentCompletion';

interface DocumentCompletionPanelProps {
  completionResults: DocumentCompletionResult[];
  overallCompletion: number;
  onNavigateToSection?: (section: string) => void;
  variant?: 'full' | 'compact' | 'minimal';
}

/**
 * Retourne l'icône et la couleur en fonction du pourcentage de complétion
 */
function getStatusInfo(percentage: number) {
  if (percentage >= 100) {
    return { icon: <CheckIcon />, color: 'success.main', label: 'Complet' };
  } else if (percentage >= 80) {
    return { icon: <CheckIcon />, color: 'success.light', label: 'Prêt' };
  } else if (percentage >= 50) {
    return { icon: <WarningIcon />, color: 'warning.main', label: 'Partiel' };
  } else if (percentage > 0) {
    return { icon: <WarningIcon />, color: 'warning.light', label: 'Incomplet' };
  } else {
    return { icon: <ErrorIcon />, color: 'error.main', label: 'Vide' };
  }
}

/**
 * Carte individuelle pour un document
 */
function DocumentCard({
  result,
  onNavigateToSection,
  expanded,
  onToggleExpand,
}: {
  result: DocumentCompletionResult;
  onNavigateToSection?: (section: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const status = getStatusInfo(result.completionPercentage);
  const hasMissingFields = result.missingFields.length > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 1,
        borderLeft: 4,
        borderLeftColor: result.color,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DocIcon sx={{ color: result.color }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {result.shortLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {result.description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label={`${result.completionPercentage}%`}
            sx={{
              bgcolor: status.color,
              color: 'white',
              fontWeight: 600,
            }}
          />
          {result.isReady && (
            <Tooltip title="Document prêt à être généré">
              <CheckIcon color="success" />
            </Tooltip>
          )}
          {hasMissingFields && (
            <IconButton size="small" onClick={onToggleExpand}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Barre de progression */}
      <Box sx={{ mt: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={result.completionPercentage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: result.color,
              borderRadius: 3,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {result.filledFields} / {result.totalFields} champs remplis
        </Typography>
      </Box>

      {/* Liste des champs manquants */}
      <Collapse in={expanded && hasMissingFields}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={500} color="warning.main" sx={{ mb: 1 }}>
            Champs manquants :
          </Typography>
          <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
            {result.missingFields.map((field, index) => (
              <ListItem
                key={index}
                sx={{
                  cursor: onNavigateToSection ? 'pointer' : 'default',
                  '&:hover': onNavigateToSection
                    ? { bgcolor: 'action.hover' }
                    : {},
                }}
                onClick={() => onNavigateToSection?.(field.section)}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CircleIcon sx={{ fontSize: 8, color: 'warning.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={field.label}
                  secondary={`Section: ${field.section}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Paper>
  );
}

/**
 * Version compacte pour l'affichage dans le header
 */
function CompactView({
  completionResults,
  overallCompletion,
}: {
  completionResults: DocumentCompletionResult[];
  overallCompletion: number;
}) {
  const readyCount = completionResults.filter((r) => r.isReady).length;
  const totalCount = completionResults.length;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Tooltip title="Documents prêts à générer">
        <Badge badgeContent={readyCount} color="success">
          <DocIcon color="action" />
        </Badge>
      </Tooltip>

      <Box sx={{ minWidth: 120 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Complétion globale
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {overallCompletion}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={overallCompletion}
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {completionResults.map((result) => (
          <Tooltip key={result.documentType} title={`${result.shortLabel}: ${result.completionPercentage}%`}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: result.isReady ? 'success.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 2,
                borderColor: result.color,
              }}
            >
              {result.isReady && <CheckIcon sx={{ fontSize: 14, color: 'white' }} />}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Version minimale (juste les badges)
 */
function MinimalView({
  completionResults,
}: {
  completionResults: DocumentCompletionResult[];
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {completionResults.map((result) => (
        <Tooltip
          key={result.documentType}
          title={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {result.label}
              </Typography>
              <Typography variant="caption">
                {result.completionPercentage}% complet
                {result.isReady && ' - Prêt'}
              </Typography>
            </Box>
          }
        >
          <Chip
            size="small"
            label={result.shortLabel}
            sx={{
              bgcolor: result.isReady ? 'success.main' : 'grey.400',
              color: 'white',
              fontWeight: 500,
              opacity: result.completionPercentage > 0 ? 1 : 0.5,
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
}

/**
 * Panneau principal de complétion des documents
 */
export default function DocumentCompletionPanel({
  completionResults,
  overallCompletion,
  onNavigateToSection,
  variant = 'full',
}: DocumentCompletionPanelProps) {
  const [expandedDoc, setExpandedDoc] = React.useState<string | null>(null);

  const readyCount = completionResults.filter((r) => r.isReady).length;
  const totalCount = completionResults.length;

  if (variant === 'compact') {
    return (
      <CompactView
        completionResults={completionResults}
        overallCompletion={overallCompletion}
      />
    );
  }

  if (variant === 'minimal') {
    return <MinimalView completionResults={completionResults} />;
  }

  // Version complète
  return (
    <Paper sx={{ p: 2 }}>
      {/* En-tête global */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Documents réglementaires
          </Typography>
          <Chip
            label={`${readyCount}/${totalCount} prêts`}
            color={readyCount === totalCount ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={overallCompletion}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: `linear-gradient(90deg, #2196F3, #4CAF50, #FF9800)`,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Complétion globale: {overallCompletion}%
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Liste des documents */}
      {completionResults.map((result) => (
        <DocumentCard
          key={result.documentType}
          result={result}
          onNavigateToSection={onNavigateToSection}
          expanded={expandedDoc === result.documentType}
          onToggleExpand={() =>
            setExpandedDoc(expandedDoc === result.documentType ? null : result.documentType)
          }
        />
      ))}

      {/* Message si tous les documents sont prêts */}
      {readyCount === totalCount && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'success.light',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CheckIcon sx={{ color: 'success.dark' }} />
          <Typography variant="body2" color="success.dark" fontWeight={500}>
            Tous les documents sont prêts à être générés !
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
