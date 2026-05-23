import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import reportWebVitals from './reportWebVitals';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c9a843',
      contrastText: '#0e1220',
    },
    secondary: {
      main: '#4488ee',
    },
    background: {
      default: '#0e1220',
      paper: '#1a2035',
    },
    text: {
      primary: '#e8ecf4',
      secondary: '#8899bb',
    },
    error:   { main: '#e05454' },
    success: { main: '#4caf72' },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
          minHeight: 38,
        },
        containedPrimary: {
          backgroundColor: '#c9a843',
          color: '#0e1220',
          '&:hover': { backgroundColor: '#dab94e' },
        },
        outlinedPrimary: {
          borderColor: 'rgba(201,168,67,0.5)',
          color: '#c9a843',
          '&:hover': {
            borderColor: '#c9a843',
            backgroundColor: 'rgba(201,168,67,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: 'rgba(255,255,255,0.12)' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2a3450',
          border: '1px solid rgba(255,255,255,0.10)',
          fontSize: '0.74rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.08)' },
      },
    },
    MuiListItem: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
