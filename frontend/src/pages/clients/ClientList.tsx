/**
 * ClientList - Liste des clients avec filtres
 * Affichage, recherche, filtrage et actions sur les clients
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import api from '../../services/api';

interface Client {
  id: string;
  numero_client: string;
  t1_nom: string;
  t1_prenom: string;
  t1_email: string;
  t1_telephone: string;
  profil_risque_calcule?: string;
  statut_dossier: string;
  created_at: string;
}

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get('/clients');
      // L'API renvoie { total, page, per_page, clients: [...] }
      const data = response.data;
      if (Array.isArray(data)) {
        setClients(data);
      } else if (data && Array.isArray(data.clients)) {
        setClients(data.clients);
      } else if (data && Array.isArray(data.items)) {
        setClients(data.items);
      } else {
        setClients([]);
      }
      setLoading(false);
    } catch {
      setError('Erreur lors du chargement des clients');
      setClients([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(c => c.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const columns = [
    {
      field: 'numero_client',
      headerName: 'N° Client',
      width: 140,
    },
    {
      field: 'nom_complet',
      headerName: 'Nom complet',
      width: 200,
      valueGetter: (_value: unknown, row: Client) => {
        if (!row) return '';
        return `${row.t1_prenom || ''} ${row.t1_nom || ''}`.trim();
      },
    },
    {
      field: 't1_email',
      headerName: 'Email',
      width: 220,
    },
    {
      field: 't1_telephone',
      headerName: 'Téléphone',
      width: 140,
    },
    {
      field: 'profil_risque_calcule',
      headerName: 'Profil Risque',
      width: 130,
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 120,
    },
  ];

  const actions = [
    {
      label: 'Voir',
      onClick: (client: Client) => navigate(`/clients/${client.id}`),
    },
    {
      label: 'Modifier',
      onClick: (client: Client) => navigate(`/clients/${client.id}/edit`),
    },
    {
      label: 'Supprimer',
      onClick: (client: Client) => handleDelete(client.id),
      color: 'error' as const,
    },
  ];

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      (client.t1_nom || '').toLowerCase().includes(searchLower) ||
      (client.t1_prenom || '').toLowerCase().includes(searchLower) ||
      (client.t1_email || '').toLowerCase().includes(searchLower) ||
      (client.numero_client || '').toLowerCase().includes(searchLower);

    // Le champ statut dans l'API s'appelle 'statut', pas 'statut_dossier'
    const clientStatut = (client as any).statut || client.statut_dossier || '';
    const matchesStatus = statusFilter === '' || clientStatut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Clients"
        subtitle={`${filteredClients.length} client${filteredClients.length > 1 ? 's' : ''}`}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/clients/new')}
          >
            Nouveau client
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="EN_COURS">En cours</MenuItem>
            <MenuItem value="VALIDE">Validé</MenuItem>
            <MenuItem value="ARCHIVE">Archivé</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          disabled={filteredClients.length === 0}
        >
          Exporter CSV
        </Button>
      </Box>

      {/* Tableau */}
      <DataTable
        columns={columns}
        rows={filteredClients}
        onRowClick={(row) => navigate(`/clients/${row.id}`)}
      />
    </Box>
  );
};

export default ClientList;
