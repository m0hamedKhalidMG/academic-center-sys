import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#63a4ff',
      main: '#1976d2',
      dark: '#004ba0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff6090',
      main: '#e91e63',
      dark: '#b0003a',
      contrastText: '#fff',
    },
    info: {
      main: '#0288d1',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',
      contrastText: '#fff',
    },
    warning: {
      main: '#ed6c02',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
      contrastText: '#fff',
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.5 },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.6 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8, // 1 unit = 8px
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f0f2f5',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.75rem 1.5rem',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-2px)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            '0px 4px 8px rgba(0,0,0,0.05), 0px 8px 16px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow:
              '0px 8px 16px rgba(0,0,0,0.1), 0px 16px 24px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          boxShadow: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px',
          paddingLeft: '2rem',
          paddingRight: '2rem',
        },
      },
    },
  },
});

export default theme;
