/**
 * Theme Premium Dark - Inspiré de Finary
 * Design élégant avec fond noir et accents verts
 */

import { createTheme, alpha } from '@mui/material/styles';
import { frFR } from '@mui/material/locale';

// Couleurs de base
const colors = {
  // Backgrounds - Dégradé de noirs profonds
  bgPrimary: '#0A0A0B',      // Fond principal (presque noir)
  bgSecondary: '#111113',    // Fond secondaire
  bgElevated: '#18181B',     // Cards, surfaces élevées
  bgHover: '#1F1F23',        // Survol
  bgInput: '#141416',        // Champs de saisie

  // Accents - Vert Finary
  accentPrimary: '#00D9A6',  // Vert principal (signature Finary)
  accentPrimaryLight: '#33E3BC',
  accentPrimaryDark: '#00B88A',

  // Couleurs secondaires
  accentSecondary: '#6366F1', // Violet/Indigo pour variation
  accentSecondaryLight: '#818CF8',

  // États
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Texte
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textMuted: '#52525B',

  // Bordures
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderFocus: 'rgba(0, 217, 166, 0.5)',
};

const theme = createTheme(
  {
    palette: {
      mode: 'dark',
      primary: {
        main: colors.accentPrimary,
        light: colors.accentPrimaryLight,
        dark: colors.accentPrimaryDark,
        contrastText: '#000000',
      },
      secondary: {
        main: colors.accentSecondary,
        light: colors.accentSecondaryLight,
        dark: '#4F46E5',
        contrastText: '#FFFFFF',
      },
      success: {
        main: colors.success,
        light: '#34D399',
        dark: '#059669',
      },
      warning: {
        main: colors.warning,
        light: '#FBBF24',
        dark: '#D97706',
      },
      error: {
        main: colors.error,
        light: '#F87171',
        dark: '#DC2626',
      },
      info: {
        main: colors.info,
        light: '#60A5FA',
        dark: '#2563EB',
      },
      background: {
        default: colors.bgPrimary,
        paper: colors.bgElevated,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
        disabled: colors.textMuted,
      },
      divider: colors.border,
      action: {
        active: colors.textSecondary,
        hover: 'rgba(255, 255, 255, 0.05)',
        selected: 'rgba(0, 217, 166, 0.12)',
        disabled: colors.textMuted,
        disabledBackground: 'rgba(255, 255, 255, 0.05)',
      },
    },

    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
      subtitle2: {
        fontWeight: 500,
        color: colors.textSecondary,
      },
      body1: {
        fontSize: '0.9375rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.57,
        color: colors.textSecondary,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none' as const,
        letterSpacing: '0.01em',
      },
      caption: {
        fontSize: '0.75rem',
        color: colors.textTertiary,
      },
      overline: {
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: colors.textTertiary,
      },
    },

    shape: {
      borderRadius: 12,
    },

    shadows: [
      'none',
      '0 1px 2px rgba(0, 0, 0, 0.3)',
      '0 2px 4px rgba(0, 0, 0, 0.3)',
      '0 4px 8px rgba(0, 0, 0, 0.3)',
      '0 6px 12px rgba(0, 0, 0, 0.3)',
      '0 8px 16px rgba(0, 0, 0, 0.3)',
      '0 12px 24px rgba(0, 0, 0, 0.3)',
      '0 16px 32px rgba(0, 0, 0, 0.3)',
      '0 20px 40px rgba(0, 0, 0, 0.3)',
      '0 24px 48px rgba(0, 0, 0, 0.3)',
      '0 28px 56px rgba(0, 0, 0, 0.3)',
      '0 32px 64px rgba(0, 0, 0, 0.3)',
      '0 36px 72px rgba(0, 0, 0, 0.3)',
      '0 40px 80px rgba(0, 0, 0, 0.3)',
      '0 44px 88px rgba(0, 0, 0, 0.3)',
      '0 48px 96px rgba(0, 0, 0, 0.3)',
      '0 52px 104px rgba(0, 0, 0, 0.3)',
      '0 56px 112px rgba(0, 0, 0, 0.3)',
      '0 60px 120px rgba(0, 0, 0, 0.3)',
      '0 64px 128px rgba(0, 0, 0, 0.3)',
      '0 68px 136px rgba(0, 0, 0, 0.3)',
      '0 72px 144px rgba(0, 0, 0, 0.3)',
      '0 76px 152px rgba(0, 0, 0, 0.3)',
      '0 80px 160px rgba(0, 0, 0, 0.3)',
      '0 84px 168px rgba(0, 0, 0, 0.3)',
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: `${colors.bgHover} ${colors.bgPrimary}`,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: colors.bgPrimary,
            },
            '&::-webkit-scrollbar-thumb': {
              background: colors.bgHover,
              borderRadius: '4px',
              '&:hover': {
                background: colors.textMuted,
              },
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(colors.accentPrimary, 0.4)}`,
              transform: 'translateY(-1px)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${colors.accentPrimary} 0%, ${colors.accentPrimaryDark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.accentPrimaryLight} 0%, ${colors.accentPrimary} 100%)`,
            },
          },
          outlined: {
            borderColor: colors.border,
            '&:hover': {
              borderColor: colors.accentPrimary,
              backgroundColor: alpha(colors.accentPrimary, 0.08),
            },
          },
          text: {
            '&:hover': {
              backgroundColor: alpha(colors.accentPrimary, 0.08),
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.border}`,
          },
          elevation1: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          },
          elevation2: {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.border}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: colors.borderLight,
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: alpha(colors.bgSecondary, 0.8),
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${colors.border}`,
            boxShadow: 'none',
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.bgSecondary,
            borderRight: `1px solid ${colors.border}`,
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.bgInput,
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderColor: colors.border,
                transition: 'all 0.2s ease',
              },
              '&:hover fieldset': {
                borderColor: colors.borderLight,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.accentPrimary,
                boxShadow: `0 0 0 3px ${alpha(colors.accentPrimary, 0.15)}`,
              },
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: colors.bgInput,
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.borderLight,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.accentPrimary,
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: colors.bgInput,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
          },
          filled: {
            backgroundColor: alpha(colors.accentPrimary, 0.15),
            color: colors.accentPrimary,
            '&:hover': {
              backgroundColor: alpha(colors.accentPrimary, 0.25),
            },
          },
          outlined: {
            borderColor: colors.border,
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: colors.bgHover,
            borderRadius: 4,
          },
          bar: {
            borderRadius: 4,
            background: `linear-gradient(90deg, ${colors.accentPrimary}, ${colors.accentPrimaryLight})`,
          },
        },
      },

      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: colors.accentPrimary,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 4,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: colors.bgHover,
            },
            '&.Mui-selected': {
              backgroundColor: alpha(colors.accentPrimary, 0.15),
              color: colors.accentPrimary,
              '&:hover': {
                backgroundColor: alpha(colors.accentPrimary, 0.2),
              },
              '& .MuiListItemIcon-root': {
                color: colors.accentPrimary,
              },
            },
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: colors.textSecondary,
            minWidth: 40,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border,
          },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: colors.bgSecondary,
            '& .MuiTableCell-root': {
              color: colors.textSecondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              borderBottom: `1px solid ${colors.border}`,
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.border}`,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: colors.bgHover,
            },
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: colors.bgHover,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: '0.8125rem',
            padding: '8px 12px',
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: '1px solid',
          },
          standardSuccess: {
            backgroundColor: alpha(colors.success, 0.1),
            borderColor: alpha(colors.success, 0.3),
            color: colors.success,
          },
          standardError: {
            backgroundColor: alpha(colors.error, 0.1),
            borderColor: alpha(colors.error, 0.3),
            color: colors.error,
          },
          standardWarning: {
            backgroundColor: alpha(colors.warning, 0.1),
            borderColor: alpha(colors.warning, 0.3),
            color: colors.warning,
          },
          standardInfo: {
            backgroundColor: alpha(colors.info, 0.1),
            borderColor: alpha(colors.info, 0.3),
            color: colors.info,
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(colors.accentPrimary, 0.2),
            color: colors.accentPrimary,
            fontWeight: 600,
          },
        },
      },

      MuiStepper: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },

      MuiStepLabel: {
        styleOverrides: {
          label: {
            color: colors.textSecondary,
            '&.Mui-active': {
              color: colors.accentPrimary,
              fontWeight: 600,
            },
            '&.Mui-completed': {
              color: colors.textPrimary,
            },
          },
        },
      },

      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: colors.bgHover,
            '&.Mui-active': {
              color: colors.accentPrimary,
            },
            '&.Mui-completed': {
              color: colors.accentPrimary,
            },
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              color: colors.accentPrimary,
            },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: colors.accentPrimary,
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },

      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.border}`,
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              margin: 0,
            },
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
          },
          switchBase: {
            padding: 0,
            margin: 2,
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: colors.accentPrimary,
                opacity: 1,
              },
            },
          },
          thumb: {
            width: 22,
            height: 22,
          },
          track: {
            borderRadius: 13,
            backgroundColor: colors.bgHover,
            opacity: 1,
          },
        },
      },

      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: `0 4px 14px ${alpha(colors.accentPrimary, 0.4)}`,
          },
          primary: {
            background: `linear-gradient(135deg, ${colors.accentPrimary} 0%, ${colors.accentPrimaryDark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.accentPrimaryLight} 0%, ${colors.accentPrimary} 100%)`,
            },
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&:hover': {
              backgroundColor: colors.bgHover,
            },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
          },
        },
      },

      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.border}`,
          },
        },
      },

      MuiBadge: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: colors.accentPrimary,
            color: '#000',
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: colors.bgHover,
            },
          },
        },
      },
    },
  },
  frFR
);

export default theme;
