import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e676', // Vibrant trading green
      light: '#66ffa6',
      dark: '#00b348',
    },
    secondary: {
      main: '#ff1744', // Red for sell/negative
      light: '#ff616f',
      dark: '#b20000',
    },
    background: {
      default: '#0a0e17',
      paper: '#121824',
    },
    text: {
      primary: '#ffffff',
      secondary: '#90a4ae',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 8,
  },
});
