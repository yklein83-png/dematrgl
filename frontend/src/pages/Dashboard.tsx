/**
 * Dashboard - Page d'accueil avec statistiques
 * Vue d'ensemble de l'activité du conseiller
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardStats {
  total_clients: number;
  clients_actifs: number;
  documents_generes: number;
  clients_ce_mois: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur stats:', err);
      setError('Erreur lors du chargement des statistiques');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.total_clients || 0,
      icon: <PeopleIcon fontSize="large" />,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
    },
    {
      title: 'Clients Actifs',
      value: stats?.clients_actifs || 0,
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Documents Générés',
      value: stats?.documents_generes || 0,
      icon: <DescriptionIcon fontSize="large" />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Nouveaux ce mois',
      value: stats?.clients_ce_mois || 0,
      icon: <PersonAddIcon fontSize="large" />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Bonjour, {user?.prenom} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue sur votre espace de gestion patrimoniale
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions rapides */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Actions rapides
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/clients/new')}
            >
              Nouveau client
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/clients')}
            >
              Voir tous les clients
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/documents')}
              >
              Documents
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Informations
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Cette application vous permet de gérer vos clients, générer les documents
            réglementaires (DER, KYC, etc.) et exporter les données vers votre CRM.
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              borderLeft: 4,
              borderColor: 'info.main',
            }}
          >
            <Typography variant="body2" fontWeight={600} color="info.dark">
              📊 Conformité AMF/ACPR
            </Typography>
            <Typography variant="body2" color="info.dark" sx={{ mt: 0.5 }}>
              Tous les documents générés sont conformes aux exigences réglementaires
              en vigueur en Polynésie Française.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
