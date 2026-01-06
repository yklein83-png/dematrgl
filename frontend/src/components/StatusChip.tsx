/**
 * Chip de statut personnalisé
 * Affichage des statuts avec couleurs
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps {
  status: string;
  label?: string;
  size?: ChipProps['size'];
}

const statusConfig: Record<string, { label: string; color: ChipProps['color'] }> = {
  // Statuts client
  prospect: { label: 'Prospect', color: 'warning' },
  client_actif: { label: 'Client actif', color: 'success' },
  client_inactif: { label: 'Client inactif', color: 'default' },
  
  // Profils de risque
  Sécuritaire: { label: 'Sécuritaire', color: 'info' },
  Prudent: { label: 'Prudent', color: 'info' },
  Équilibré: { label: 'Équilibré', color: 'warning' },
  Dynamique: { label: 'Dynamique', color: 'error' },
  
  // Niveaux LCB-FT
  Faible: { label: 'Faible', color: 'success' },
  Standard: { label: 'Standard', color: 'info' },
  Renforcé: { label: 'Renforcé', color: 'warning' },
  Élevé: { label: 'Élevé', color: 'error' },
  
  // Documents
  DER: { label: 'DER', color: 'primary' },
  KYC: { label: 'KYC', color: 'primary' },
  LETTRE_MISSION_CIF: { label: 'Lettre Mission CIF', color: 'primary' },
  DECLARATION_ADEQUATION_CIF: { label: 'Déclaration Adéquation', color: 'primary' },
  CONVENTION_RTO: { label: 'Convention RTO', color: 'primary' },
  RAPPORT_CONSEIL_IAS: { label: 'Rapport Conseil IAS', color: 'primary' },
  
  // Général
  actif: { label: 'Actif', color: 'success' },
  inactif: { label: 'Inactif', color: 'default' },
  signe: { label: 'Signé', color: 'success' },
  non_signe: { label: 'Non signé', color: 'warning' },
};

export default function StatusChip({ status, label, size = 'small' }: StatusChipProps) {
  const config = statusConfig[status] || { 
    label: label || status, 
    color: 'default' as ChipProps['color'] 
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
    />
  );
}