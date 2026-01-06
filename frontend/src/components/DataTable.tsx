/**
 * Composant tableau de données réutilisable
 * Basé sur MUI DataGrid avec personnalisations
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridRowSelectionModel,
  frFR,
} from '@mui/x-data-grid';
import { Search, Refresh, FileDownload } from '@mui/icons-material';

interface DataTableProps {
  columns: GridColDef[];
  rows: any[];
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (ids: GridRowSelectionModel) => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  height?: number | string;
}

export default function DataTable({
  columns,
  rows,
  loading = false,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  checkboxSelection = false,
  onRowClick,
  onSelectionChange,
  searchable = true,
  onSearch,
  onRefresh,
  onExport,
  height = 600,
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSize,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  // Filtrer les lignes localement si pas de onSearch
  const filteredRows = React.useMemo(() => {
    // S'assurer que rows est toujours un tableau
    const safeRows = Array.isArray(rows) ? rows : [];

    if (!searchable || onSearch || !searchQuery) {
      return safeRows;
    }

    const query = searchQuery.toLowerCase();
    return safeRows.filter(row => {
      return Object.values(row).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [rows, searchQuery, searchable, onSearch]);

  // Gérer la recherche
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (onSearch) {
      // Debounce pour API
      const timeoutId = setTimeout(() => {
        onSearch(query);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <Paper sx={{ height: '100%', width: '100%' }}>
      {/* Barre d'outils */}
      {(searchable || onRefresh || onExport) && (
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {searchable && (
            <TextField
              size="small"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
          )}
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {onRefresh && (
              <Tooltip title="Actualiser">
                <IconButton onClick={onRefresh}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
            
            {onExport && (
              <Tooltip title="Exporter">
                <IconButton onClick={onExport}>
                  <FileDownload />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}

      {/* Tableau */}
      <Box sx={{ height: height, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(newSelection) => {
            setSelectionModel(newSelection);
            if (onSelectionChange) {
              onSelectionChange(newSelection);
            }
          }}
          pageSizeOptions={pageSizeOptions}
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick
          onRowClick={(params) => {
            if (onRowClick) {
              onRowClick(params.row);
            }
          }}
          localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
}