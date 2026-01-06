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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import api from '../../services/api';

// Fonction pour formater un numéro de téléphone polynésien
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  // Nettoyer le numéro (garder uniquement chiffres et +)
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Format polynésien: +689 87 12 34 56
  if (cleaned.startsWith('+689') && cleaned.length === 12) {
    return `+689 ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
  }
  // Format sans indicatif: 87 12 34 56
  if (cleaned.length === 8 && !cleaned.startsWith('+')) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  }
  // Retourner tel quel si format inconnu
  return phone;
};

interface Client {
  id: string;
  numero_client: string;
  t1_nom: string;
  t1_prenom: string;
  t1_email: string;
  t1_telephone: string;
  profil_risque_calcule?: string;
  statut: string;
  statut_dossier?: string;  // Legacy field
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
      renderCell: (params: { row: Client }) => {
        const row = params.row;
        if (!row) return '';
        const nomComplet = `${row.t1_prenom || ''} ${row.t1_nom || ''}`.trim();
        if (nomComplet) return nomComplet;
        // Afficher le numéro client si pas de nom (brouillon)
        return row.numero_client ? `(${row.numero_client})` : '(Sans nom)';
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
      width: 160,
      renderCell: (params: { row: Client }) => formatPhoneNumber(params.row.t1_telephone),
    },
    {
      field: 'profil_risque_calcule',
      headerName: 'Profil Risque',
      width: 130,
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 130,
      renderCell: (params: { row: Client }) => (
        <StatusChip status={params.row.statut || 'prospect'} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: { row: Client }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Voir">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/clients/${params.row.id}`);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/clients/${params.row.id}/edit`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
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

    const clientStatut = client.statut || '';
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
            <MenuItem value="brouillon">Brouillon</MenuItem>
            <MenuItem value="prospect">Prospect</MenuItem>
            <MenuItem value="client_actif">Client actif</MenuItem>
            <MenuItem value="client_inactif">Client inactif</MenuItem>
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
