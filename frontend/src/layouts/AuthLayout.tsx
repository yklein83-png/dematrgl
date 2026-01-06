/**
 * AuthLayout - Layout premium dark pour les pages publiques (Login)
 * Design élégant inspiré de Finary
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(ellipse at 20% 0%, rgba(0, 217, 166, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          linear-gradient(180deg, #0A0A0B 0%, #111113 100%)
        `,
        py: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient orbs */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 217, 166, 0.08) 0%, transparent 70%)',
          top: -200,
          left: -200,
          filter: 'blur(40px)',
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.1)', opacity: 0.8 },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
          bottom: -150,
          right: -150,
          filter: 'blur(40px)',
          animation: 'pulse 10s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header avec logo */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #00D9A6 0%, #00B88A 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 217, 166, 0.4)',
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight={800} sx={{ color: '#000' }}>
              F
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Le Fare de l'Épargne
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 400,
            }}
          >
            Gestion Patrimoniale - Polynésie Française
          </Typography>
        </Box>

        {/* Login card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(24, 24, 27, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Outlet />
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.4)',
              display: 'block',
              mb: 0.5,
            }}
          >
            ORIAS N°21003330 - Régulé AMF/ACPR
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.7rem',
            }}
          >
            Conseiller en Investissement Financier (CIF) - Courtier en Assurance (COA)
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
