/**
 * Composant racine de l'application
 * Gestion du routage et de l'authentification
 * Utilise React.lazy pour le code splitting
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { SnackbarProvider } from 'notistack';

// Theme
import theme from './theme';

// Contextes
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts (chargés immédiatement car utilisés partout)
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Composants (chargés immédiatement)
import PrivateRoute from './components/PrivateRoute';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Pages - Code Splitting avec React.lazy
// Les pages sont chargées à la demande pour réduire le bundle initial
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ClientList = React.lazy(() => import('./pages/clients/ClientList'));
const ClientForm = React.lazy(() => import('./pages/clients/ClientForm'));
const ClientDetail = React.lazy(() => import('./pages/clients/ClientDetail'));
const Documents = React.lazy(() => import('./pages/Documents'));
const UserList = React.lazy(() => import('./pages/users/UserList'));
const Profile = React.lazy(() => import('./pages/Profile'));
const EntrepriseSettings = React.lazy(() => import('./pages/settings/EntrepriseSettings'));

/**
 * Composant App principal
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <AuthProvider>
              <Router>
                <AppRoutes />
              </Router>
            </AuthProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

/**
 * Configuration des routes
 */
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Routes publiques */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
        </Route>

        {/* Routes privées */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Clients */}
            <Route path="/clients">
              <Route index element={<ClientList />} />
              <Route path="new" element={<ClientForm />} />
              <Route path=":id" element={<ClientDetail />} />
              <Route path=":id/edit" element={<ClientForm />} />
            </Route>

            {/* Documents */}
            <Route path="/documents" element={<Documents />} />

            {/* Utilisateurs (admin) */}
            <Route path="/users" element={<UserList />} />

            {/* Profil */}
            <Route path="/profile" element={<Profile />} />

            {/* Parametres */}
            <Route path="/settings">
              <Route path="entreprise" element={<EntrepriseSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Redirection 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default App;