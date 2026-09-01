import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Stack,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { PortfolioItem } from '../types/portfolio';
import { OrderModal } from './OrderModal';

// Initial default Indian stock portfolio in INR (₹)
const defaultIndianPortfolio: PortfolioItem[] = [
  { id: '1', name: 'Reliance Industries', symbol: 'RELIANCE', quantity: 50, avgPrice: 2950.00 },
  { id: '2', name: 'Tata Consultancy Services', symbol: 'TCS', quantity: 20, avgPrice: 4280.50 },
  { id: '3', name: 'Infosys Ltd', symbol: 'INFY', quantity: 75, avgPrice: 1840.00 },
  { id: '4', name: 'HDFC Bank', symbol: 'HDFCBANK', quantity: 60, avgPrice: 1620.75 },
  { id: '5', name: 'Tata Motors', symbol: 'TATAMOTORS', quantity: 100, avgPrice: 980.25 },
];

// INR (₹) Currency Formatter helper
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(defaultIndianPortfolio);
  const [loading, setLoading] = useState<boolean>(true);
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Connecting to Firestore Holdings...');

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Firestore Real-time listener on 'Holdings' document ('Holdings/current')
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const holdingsDocRef = doc(db, 'Holdings', 'current');

      unsubscribe = onSnapshot(
        holdingsDocRef,
        (snapshot) => {
          setLoading(false);
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && Array.isArray(data.items)) {
              setPortfolio(data.items);
              setFirestoreStatus('Live data synced with Cloud Firestore (Holdings document)');
            } else {
              setFirestoreStatus('Holdings document format empty. Initializing defaults...');
            }
          } else {
            // Document doesn't exist yet, initialize it with default Indian stock holdings
            setFirestoreStatus('Holdings document created in Firestore.');
            setDoc(holdingsDocRef, { items: defaultIndianPortfolio }).catch((err) => {
              console.warn('Firestore write notice:', err);
            });
          }
        },
        (error) => {
          console.warn('Firestore subscription notice:', error);
          setLoading(false);
          setFirestoreStatus('Using local holdings (Configure Firebase credentials in .env to sync live)');
        }
      );
    } catch (err) {
      console.warn('Firestore initialization notice:', err);
      setLoading(false);
      setFirestoreStatus('Using local holdings');
    }

    return () => unsubscribe();
  }, []);

  // Calculate total portfolio invested in INR
  const totalPortfolioInvested = portfolio.reduce(
    (sum, item) => sum + item.quantity * item.avgPrice,
    0
  );

  const syncToFirestore = async (updatedItems: PortfolioItem[]) => {
    try {
      const holdingsDocRef = doc(db, 'Holdings', 'current');
      await updateDoc(holdingsDocRef, { items: updatedItems });
    } catch {
      // Fallback silently if offline/demo
    }
  };

  const handleOpenBuyModal = (item: PortfolioItem) => {
    setSelectedItem(item);
    setModalType('BUY');
    setModalOpen(true);
  };

  const handleOpenSellModal = (item: PortfolioItem) => {
    setSelectedItem(item);
    setModalType('SELL');
    setModalOpen(true);
  };

  const handleOrderSubmit = (
    type: 'BUY' | 'SELL',
    targetItem: PortfolioItem,
    qty: number,
    price: number
  ) => {
    let updated: PortfolioItem[];

    if (type === 'BUY') {
      // Recalculate weighted average price on buy
      updated = portfolio.map((item) => {
        if (item.id === targetItem.id) {
          const currentTotal = item.quantity * item.avgPrice;
          const buyTotal = qty * price;
          const newQty = item.quantity + qty;
          const newAvgPrice = newQty > 0 ? (currentTotal + buyTotal) / newQty : price;
          return {
            ...item,
            quantity: newQty,
            avgPrice: Math.round(newAvgPrice * 100) / 100,
          };
        }
        return item;
      });
    } else {
      // Deduct quantity on sell
      updated = portfolio.map((item) => {
        if (item.id === targetItem.id) {
          const newQty = Math.max(0, item.quantity - qty);
          return {
            ...item,
            quantity: newQty,
          };
        }
        return item;
      });
    }

    setPortfolio(updated);
    syncToFirestore(updated);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Status Notice */}
      <Alert
        severity="info"
        icon={<CloudDoneIcon fontSize="inherit" />}
        sx={{ mb: 3, bgcolor: 'rgba(0, 230, 118, 0.08)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.2)' }}
      >
        {firestoreStatus}
      </Alert>

      {/* Portfolio Header & Total Invested Card (in INR) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Portfolio Holdings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time equity holdings pulled from Firestore Holdings document
          </Typography>
        </Box>
        <Card sx={{ minWidth: 240, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Invested
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatINR(totalPortfolioInvested)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Holdings Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="holdings table">
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Share Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Avg Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Total Invested</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.map((row) => {
                const totalInvested = row.quantity * row.avgPrice;
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatINR(row.avgPrice)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatINR(totalInvested)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {/* Buy Button: Opens Buy Modal */}
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenBuyModal(row)}
                          sx={{
                            bgcolor: '#00c853',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            minWidth: '32px',
                            width: '32px',
                            height: '32px',
                            p: 0,
                            '&:hover': {
                              bgcolor: '#00e676',
                            },
                          }}
                        >
                          B
                        </Button>

                        {/* Sell Button: Opens Sell Modal */}
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenSellModal(row)}
                          sx={{
                            bgcolor: '#d50000',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            minWidth: '32px',
                            width: '32px',
                            height: '32px',
                            p: 0,
                            '&:hover': {
                              bgcolor: '#ff1744',
                            },
                          }}
                        >
                          S
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Interactive Order Modal */}
      <OrderModal
        open={modalOpen}
        type={modalType}
        item={selectedItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleOrderSubmit}
      />
    </Box>
  );
};
