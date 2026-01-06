/**
 * Profile - Profil utilisateur
 * Modification des informations personnelles et mot de passe
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      <PageHeader
        title="Mon Profil"
        subtitle="Gérer vos informations personnelles"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          🚧 Page en cours de développement - Modification du profil à venir
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                bgcolor: 'primary.main',
                fontSize: 32,
              }}
            >
              {user?.nom?.[0]}{user?.prenom?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {user?.prenom} {user?.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'inline-block',
                  mt: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: user?.role === 'admin' ? 'error.light' : 'info.light',
                  color: user?.role === 'admin' ? 'error.dark' : 'info.dark',
                  fontWeight: 600,
                }}
              >
                {user?.role === 'admin' ? 'Administrateur' : 'Conseiller'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Fonctionnalités prévues
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Modifier informations personnelles</li>
            <li>Changer mot de passe</li>
            <li>Préférences (langue, notifications)</li>
            <li>Historique d'activité</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
