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
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedIcon from '@mui/icons-material/Verified';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { WishlistItem } from '../types/wishlist';
import { PortfolioItem } from '../types/portfolio';
import { OrderModal } from './OrderModal';

interface CombinedWishlistRow {
  symbol: string;
  name: string;
  currentPrice: number;
  lists: string[];
  ids: string[];
}

const defaultWishlistItems: WishlistItem[] = [
  { id: 'w1', List: 'Tech', name: 'Tata Consultancy Services', symbol: 'TCS', currentPrice: 4280.50 },
  { id: 'w2', List: 'Tech', name: 'Infosys Ltd', symbol: 'INFY', currentPrice: 1840.00 },
  { id: 'w3', List: 'Tata', name: 'Tata Consultancy Services', symbol: 'TCS', currentPrice: 4280.50 },
  { id: 'w4', List: 'Tata', name: 'Tata Motors', symbol: 'TATAMOTORS', currentPrice: 980.25 },
  { id: 'w5', List: 'Banking', name: 'HDFC Bank', symbol: 'HDFCBANK', currentPrice: 1620.75 },
  { id: 'w6', List: 'Banking', name: 'ICICI Bank', symbol: 'ICICIBANK', currentPrice: 1210.30 },
];

const availableStockCatalog = [
  { name: 'Tata Consultancy Services', symbol: 'TCS', price: 4280.50 },
  { name: 'Infosys Ltd', symbol: 'INFY', price: 1840.00 },
  { name: 'Reliance Industries', symbol: 'RELIANCE', price: 2950.00 },
  { name: 'Tata Motors', symbol: 'TATAMOTORS', price: 980.25 },
  { name: 'HDFC Bank', symbol: 'HDFCBANK', price: 1620.75 },
  { name: 'ICICI Bank', symbol: 'ICICIBANK', price: 1210.30 },
  { name: 'State Bank of India', symbol: 'SBIN', price: 815.40 },
  { name: 'Bharti Airtel', symbol: 'BHARTIARTL', price: 1540.00 },
];

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

export const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(defaultWishlistItems);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusNotice, setStatusNotice] = useState<string>('Syncing Wishlists with Cloud Firestore...');

  // Dialog States
  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(availableStockCatalog[0].symbol);
  const [targetListName, setTargetListName] = useState<string>('Tech');
  const [customNewList, setCustomNewList] = useState<string>('');

  // Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderModalType, setOrderModalType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderModalItem, setOrderModalItem] = useState<PortfolioItem | null>(null);

  // Firestore Listener for Wishlists ('Wishlists/current')
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const wishlistDocRef = doc(db, 'Wishlists', 'current');
      unsubscribe = onSnapshot(
        wishlistDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && Array.isArray(data.items)) {
              setWishlist(data.items);
              setStatusNotice('Live Wishlists synced from Cloud Firestore.');
            }
          } else {
            setDoc(wishlistDocRef, { items: defaultWishlistItems }).catch(() => {});
          }
        },
        () => {
          setStatusNotice('Using local wishlists');
        }
      );
    } catch {
      setStatusNotice('Using local wishlists');
    }
    return () => unsubscribe();
  }, []);

  // Firestore Listener for Holdings ('Holdings/current') to cross-reference quantity & avg price
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const holdingsDocRef = doc(db, 'Holdings', 'current');
      unsubscribe = onSnapshot(holdingsDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.items)) {
            setPortfolioHoldings(data.items);
          }
        }
      });
    } catch {}
    return () => unsubscribe();
  }, []);

  // Sync Wishlists to Firestore
  const syncWishlistsToFirestore = async (updated: WishlistItem[]) => {
    try {
      const docRef = doc(db, 'Wishlists', 'current');
      await updateDoc(docRef, { items: updated });
    } catch {
      try {
        const docRef = doc(db, 'Wishlists', 'current');
        await setDoc(docRef, { items: updated });
      } catch {}
    }
  };

  // Get unique wishlist names
  const existingLists = Array.from(new Set(wishlist.map((item) => item.List)));
  const allTabCategories = ['All', ...existingLists];

  // Filter raw items based on selected tab
  const rawFilteredItems =
    selectedCategory === 'All'
      ? wishlist
      : wishlist.filter((item) => item.List === selectedCategory);

  // Group items by stock symbol so duplicate shares in multiple wishlists combine into 1 row
  const groupedMap = new Map<string, CombinedWishlistRow>();
  rawFilteredItems.forEach((item) => {
    if (!groupedMap.has(item.symbol)) {
      groupedMap.set(item.symbol, {
        symbol: item.symbol,
        name: item.name,
        currentPrice: item.currentPrice,
        lists: [item.List],
        ids: [item.id],
      });
    } else {
      const existing = groupedMap.get(item.symbol)!;
      if (!existing.lists.includes(item.List)) {
        existing.lists.push(item.List);
      }
      existing.ids.push(item.id);
    }
  });

  const displayRows = Array.from(groupedMap.values());

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockInfo = availableStockCatalog.find((s) => s.symbol === selectedStockSymbol);
    const listName = customNewList.trim() ? customNewList.trim() : targetListName;

    if (stockInfo && listName) {
      const newItem: WishlistItem = {
        id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        List: listName,
        name: stockInfo.name,
        symbol: stockInfo.symbol,
        currentPrice: stockInfo.price,
      };

      const updated = [...wishlist, newItem];
      setWishlist(updated);
      syncWishlistsToFirestore(updated);
      setAddStockOpen(false);
      setCustomNewList('');
      if (!existingLists.includes(listName)) {
        setSelectedCategory(listName);
      }
    }
  };

  const handleRemoveCombinedRow = (idsToRemove: string[]) => {
    const updated = wishlist.filter((item) => !idsToRemove.includes(item.id));
    setWishlist(updated);
    syncWishlistsToFirestore(updated);
  };

  // Order modal triggers from wishlist
  const handleOpenBuy = (item: CombinedWishlistRow) => {
    const holdingMatch = portfolioHoldings.find((h) => h.symbol === item.symbol);
    setOrderModalItem({
      id: holdingMatch?.id || item.ids[0],
      name: item.name,
      symbol: item.symbol,
      quantity: holdingMatch?.quantity || 0,
      avgPrice: item.currentPrice,
    });
    setOrderModalType('BUY');
    setOrderModalOpen(true);
  };

  const handleOpenSell = (item: CombinedWishlistRow) => {
    const holdingMatch = portfolioHoldings.find((h) => h.symbol === item.symbol);
    setOrderModalItem({
      id: holdingMatch?.id || item.ids[0],
      name: item.name,
      symbol: item.symbol,
      quantity: holdingMatch?.quantity || 0,
      avgPrice: holdingMatch?.avgPrice || item.currentPrice,
    });
    setOrderModalType('SELL');
    setOrderModalOpen(true);
  };

  const handleOrderSubmit = (
    type: 'BUY' | 'SELL',
    targetItem: PortfolioItem,
    qty: number,
    price: number
  ) => {
    // Update portfolio holdings in Firestore
    const updatedHoldings = portfolioHoldings.map((h) => {
      if (h.symbol === targetItem.symbol) {
        if (type === 'BUY') {
          const currentTotal = h.quantity * h.avgPrice;
          const buyTotal = qty * price;
          const newQty = h.quantity + qty;
          return {
            ...h,
            quantity: newQty,
            avgPrice: Math.round(((currentTotal + buyTotal) / newQty) * 100) / 100,
          };
        } else {
          return {
            ...h,
            quantity: Math.max(0, h.quantity - qty),
          };
        }
      }
      return h;
    });

    if (!portfolioHoldings.some((h) => h.symbol === targetItem.symbol) && type === 'BUY') {
      updatedHoldings.push({
        id: `h_${Date.now()}`,
        name: targetItem.name,
        symbol: targetItem.symbol,
        quantity: qty,
        avgPrice: price,
      });
    }

    setPortfolioHoldings(updatedHoldings);
    try {
      updateDoc(doc(db, 'Holdings', 'current'), { items: updatedHoldings }).catch(() => {});
    } catch {}
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Notice Alert */}
      <Alert severity="success" icon={<BookmarkBorderIcon fontSize="inherit" />} sx={{ mb: 3, bgcolor: 'rgba(0, 230, 118, 0.08)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
        {statusNotice}
      </Alert>

      {/* Wishlist Header & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Wishlists
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage custom stock watchlists with combined share views and holding indicators
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddStockOpen(true)}
          sx={{ fontWeight: 700 }}
        >
          Add Share to Wishlist
        </Button>
      </Box>

      {/* Wishlist Categories / Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_e, val) => setSelectedCategory(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          {allTabCategories.map((cat) => (
            <Tab key={cat} label={cat} value={cat} sx={{ fontWeight: 600 }} />
          ))}
        </Tabs>
      </Box>

      {/* Wishlist Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Share Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Wishlists (`List` field)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Market Price</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.map((row) => {
              // Cross-reference with Portfolio Holdings
              const holdingMatch = portfolioHoldings.find(
                (h) => h.symbol === row.symbol && h.quantity > 0
              );

              return (
                <TableRow key={row.symbol} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                  {/* Share Name Column with Inline Holding Symbol & Tooltip aligned with Share Name */}
                  <TableCell component="th" scope="row">
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {row.name}
                        </Typography>

                        {/* Portfolio Holding Symbol & Hover Tooltip aligned next to Share Name */}
                        {holdingMatch && (
                          <Tooltip
                            arrow
                            placement="right"
                            title={
                              <Box sx={{ p: 1 }}>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 0.5, mb: 1 }}>
                                  <VerifiedIcon sx={{ fontSize: 16, color: '#00e676' }} />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    Portfolio Holding: {holdingMatch.symbol}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2">
                                  <strong>Quantity Held:</strong> {holdingMatch.quantity} shares
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Avg Purchase Price:</strong> {formatINR(holdingMatch.avgPrice)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#00e676', mt: 0.5 }}>
                                  <strong>Total Invested Value:</strong> {formatINR(holdingMatch.quantity * holdingMatch.avgPrice)}
                                </Typography>
                              </Box>
                            }
                          >
                            <Chip
                              icon={<AccountBalanceWalletIcon sx={{ fontSize: '13px !important', color: '#00c853 !important' }} />}
                              label={`${holdingMatch.quantity}`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0, 200, 83, 0.15)',
                                color: '#00e676',
                                border: '1px solid rgba(0, 200, 83, 0.4)',
                                fontWeight: 700,
                                height: 22,
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: 'rgba(0, 200, 83, 0.25)',
                                },
                              }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {row.symbol}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Combined Wishlist Chips */}
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {row.lists.map((listName) => (
                        <Chip
                          key={listName}
                          label={listName}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatINR(row.currentPrice)}
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenBuy(row)}
                        sx={{ bgcolor: '#00c853', color: '#fff', fontWeight: 900, minWidth: 32, width: 32, height: 32, p: 0, '&:hover': { bgcolor: '#00e676' } }}
                      >
                        B
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenSell(row)}
                        disabled={!holdingMatch}
                        sx={{ bgcolor: '#d50000', color: '#fff', fontWeight: 900, minWidth: 32, width: 32, height: 32, p: 0, '&:hover': { bgcolor: '#ff1744' } }}
                      >
                        S
                      </Button>

                      <IconButton size="small" color="error" onClick={() => handleRemoveCombinedRow(row.ids)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Stock to Wishlist Dialog */}
      <Dialog open={addStockOpen} onClose={() => setAddStockOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddStockSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add Stock to Wishlist</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                select
                label="Select Stock"
                value={selectedStockSymbol}
                onChange={(e) => setSelectedStockSymbol(e.target.value)}
                fullWidth
              >
                {availableStockCatalog.map((stock) => (
                  <MenuItem key={stock.symbol} value={stock.symbol}>
                    {stock.name} ({stock.symbol}) - {formatINR(stock.price)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Assign to Wishlist (`List` field)"
                value={targetListName}
                onChange={(e) => setTargetListName(e.target.value)}
                fullWidth
              >
                {existingLists.map((list) => (
                  <MenuItem key={list} value={list}>
                    {list}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Or Create New Wishlist Name"
                value={customNewList}
                onChange={(e) => setCustomNewList(e.target.value)}
                placeholder="e.g. Energy, Dividend, Core"
                fullWidth
                helperText="Fills the `List` field in the Firestore document."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setAddStockOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
              Add to Wishlist
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Order Modal Integration */}
      <OrderModal
        open={orderModalOpen}
        type={orderModalType}
        item={orderModalItem}
        onClose={() => setOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
      />
    </Box>
  );
};
