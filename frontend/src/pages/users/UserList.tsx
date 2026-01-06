/**
 * UserList - Gestion des utilisateurs (Admin uniquement)
 * CRUD utilisateurs/conseillers
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';

const UserList: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Utilisateurs"
        subtitle="Gestion des conseillers et administrateurs"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled
          >
            Nouvel utilisateur
          </Button>
        }
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          🚧 Page en cours de développement - Gestion des utilisateurs à venir
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Fonctionnalités prévues
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Liste des conseillers</li>
            <li>Créer/Modifier/Désactiver des utilisateurs</li>
            <li>Gestion des rôles (Admin/Conseiller)</li>
            <li>Statistiques par conseiller</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserList;
