import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StorageIcon from '@mui/icons-material/Storage';
import PieChartIcon from '@mui/icons-material/PieChart';
import { db } from './firebase/firebase';
import { Portfolio } from './components/Portfolio';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const isFirestoreReady = Boolean(db);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Application Bar */}
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

        {/* Navigation Tabs for Page Components */}
        <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', px: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab icon={<PieChartIcon />} iconPosition="start" label="Portfolio" />
          </Tabs>
        </Box>
      </AppBar>

      {/* Main Container rendering active page component */}
      <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
        {activeTab === 0 && <Portfolio />}
      </Container>
    </Box>
  );
};
