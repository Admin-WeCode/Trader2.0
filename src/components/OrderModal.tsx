import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import { PortfolioItem } from '../types/portfolio';

export interface OrderModalProps {
  open: boolean;
  type: 'BUY' | 'SELL';
  item: PortfolioItem | null;
  onClose: () => void;
  onSubmit: (type: 'BUY' | 'SELL', item: PortfolioItem, qty: number, price: number) => void;
}

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

export const OrderModal: React.FC<OrderModalProps> = ({
  open,
  type,
  item,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  useEffect(() => {
    if (item) {
      if (type === 'BUY') {
        // Buy box: prefilled script name, rest empty
        setQuantity('');
        setPrice('');
      } else {
        // Sell box: prefilled values from selected holding row, editable on click
        setQuantity(item.quantity.toString());
        setPrice(item.avgPrice.toString());
      }
    }
  }, [item, type, open]);

  if (!item) return null;

  const isBuy = type === 'BUY';
  const parsedQty = parseFloat(quantity) || 0;
  const parsedPrice = parseFloat(price) || 0;
  const totalValue = parsedQty * parsedPrice;

  // Background styling: Light green for Buy, Light red for Sell
  const dialogBgColor = isBuy ? '#122c1e' : '#331417';
  const accentColor = isBuy ? '#00c853' : '#d50000';
  const hoverAccentColor = isBuy ? '#00e676' : '#ff1744';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedQty > 0 && parsedPrice > 0) {
      onSubmit(type, item, parsedQty, parsedPrice);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: dialogBgColor,
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: 3,
          border: `1.5px solid ${accentColor}`,
          boxShadow: `0 8px 32px ${isBuy ? 'rgba(0, 200, 83, 0.25)' : 'rgba(213, 0, 0, 0.25)'}`,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {isBuy ? (
              <ShoppingCartIcon sx={{ color: '#00c853' }} />
            ) : (
              <SellIcon sx={{ color: '#d50000' }} />
            )}
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {isBuy ? 'Buy Stock Order' : 'Sell Stock Order'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            {/* Prefilled Script / Share Name (Readonly) */}
            <TextField
              label="Share / Script Name"
              value={`${item.name} (${item.symbol})`}
              fullWidth
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                },
              }}
            />

            {/* Quantity Input */}
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={isBuy ? 'Enter quantity' : 'Quantity to sell'}
              fullWidth
              required
              inputProps={{ min: 1, step: 1 }}
              helperText={!isBuy ? `Available holding: ${item.quantity}` : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  '&.Mui-focused': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                },
              }}
            />

            {/* Per Share Cost Input (in ₹) */}
            <TextField
              label="Per Share Cost (₹)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={isBuy ? 'Enter price per share' : 'Selling price'}
              fullWidth
              required
              inputProps={{ min: 0.01, step: 0.05 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  '&.Mui-focused': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                },
              }}
            />

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

            {/* Dynamic Real-time Total Order Value Calculation */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Calculated Total Order Value
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: accentColor, mt: 0.5 }}>
                {formatINR(totalValue)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={parsedQty <= 0 || parsedPrice <= 0 || (!isBuy && parsedQty > item.quantity)}
            sx={{
              bgcolor: accentColor,
              color: '#ffffff',
              fontWeight: 800,
              px: 3,
              '&:hover': {
                bgcolor: hoverAccentColor,
              },
            }}
          >
            Confirm {isBuy ? 'Buy' : 'Sell'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
