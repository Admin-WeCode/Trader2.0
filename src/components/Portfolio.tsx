import React, { useState } from 'react';
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
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { PortfolioItem } from '../types/portfolio';

const initialPortfolioData: PortfolioItem[] = [
  { id: '1', name: 'Apple Inc.', symbol: 'AAPL', quantity: 25, avgPrice: 185.50 },
  { id: '2', name: 'NVIDIA Corporation', symbol: 'NVDA', quantity: 15, avgPrice: 124.80 },
  { id: '3', name: 'Microsoft Corporation', symbol: 'MSFT', quantity: 10, avgPrice: 420.20 },
  { id: '4', name: 'Tesla Inc.', symbol: 'TSLA', quantity: 30, avgPrice: 210.00 },
  { id: '5', name: 'Alphabet Inc.', symbol: 'GOOGL', quantity: 40, avgPrice: 165.75 },
];

export const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolioData);

  // Calculate total portfolio value
  const totalPortfolioInvested = portfolio.reduce(
    (sum, item) => sum + item.quantity * item.avgPrice,
    0
  );

  const handleBuy = (item: PortfolioItem) => {
    setPortfolio((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p))
    );
  };

  const handleSell = (item: PortfolioItem) => {
    setPortfolio((prev) =>
      prev.map((p) =>
        p.id === item.id && p.quantity > 0 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Portfolio Header & Total Invested Card */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Portfolio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of current holdings and assets
          </Typography>
        </Box>
        <Card sx={{ minWidth: 220, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccountBalanceWalletIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Invested
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ${totalPortfolioInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Holdings Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="portfolio holdings table">
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
                    ${row.avgPrice.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {/* Small Green Buy Button with Bold B */}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleBuy(row)}
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

                      {/* Small Red Sell Button with Bold S */}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSell(row)}
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
    </Box>
  );
};
