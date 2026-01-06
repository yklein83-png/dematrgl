/**
 * Page de connexion
 * Formulaire d'authentification avec validation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Identifiants invalides. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h5"
        component="h2"
        fontWeight={600}
        sx={{ mb: 1, textAlign: 'center' }}
      >
        Connexion
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, textAlign: 'center' }}
      >
        Accédez à votre espace conseiller
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          sx={{ mb: 2 }}
          {...register('email', {
            required: 'Email requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          sx={{ mb: 3 }}
          {...register('password', {
            required: 'Mot de passe requis',
            minLength: {
              value: 8,
              message: 'Minimum 8 caractères',
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            mb: 2,
            height: 48,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Compte de test :
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
          <strong>Email:</strong> pierre.poher@fare-epargne.com
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          <strong>Password:</strong> FareTest2025!
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
