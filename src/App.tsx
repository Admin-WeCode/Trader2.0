import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import PaletteIcon from '@mui/icons-material/Palette';
import { db } from './firebase/firebase';

export const App: React.FC = () => {
  const isFirestoreReady = Boolean(db);

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={1} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Toolbar>
          <ShowChartIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            Trader 2.0
          </Typography>
          <Chip
            icon={<StorageIcon />}
            label={isFirestoreReady ? 'Firestore Connected' : 'Firestore Disconnected'}
            color={isFirestoreReady ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 5, pb: 5 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
            Welcome to Trader 2.0
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto' }}>
            Next-generation trading platform powered by React, Vite, Material UI, and Google Cloud Firestore.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <CodeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  React + Vite
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fast HMR development environment with TypeScript support and optimized builds.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <PaletteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Material UI Theme
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Custom dark trading theme built using MUI v6 components and Emotion styling.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <StorageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Cloud Firestore
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time NoSQL database integration for positions, orders, and real-time streams.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <ShowChartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  GitHub Ready
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Repository set up and synced with GitHub for CI/CD and continuous integration.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="h6" gutterBottom>
            Get Started
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure your Firebase environment credentials in <code>.env</code> file:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: '#05070a',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflowX: 'auto',
              color: '#00e676',
            }}
          >
            {`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com`}
          </Box>
          <Button variant="contained" color="primary" sx={{ mt: 2, fontWeight: 700 }}>
            Launch Trading Terminal
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
