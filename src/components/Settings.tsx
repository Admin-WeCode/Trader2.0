import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { WishlistItem, defaultWishlistItems, defaultWishlistOrder } from '../types/wishlist';

interface SettingsProps {
  onBackToWishlist?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBackToWishlist }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(defaultWishlistItems);
  const [customOrder, setCustomOrder] = useState<string[]>(defaultWishlistOrder);
  const [statusNotice, setStatusNotice] = useState<string>('');

  // Rename Dialog State
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [targetListToRename, setTargetListToRename] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [targetListToDelete, setTargetListToDelete] = useState<string>('');

  // Create List Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [createdListName, setCreatedListName] = useState<string>('');

  // Listen to Wishlists document in Firestore
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
              setWishlistItems(data.items);
              const foundLists = Array.from(new Set(data.items.map((i: WishlistItem) => i.List)));
              if (Array.isArray(data.customOrder) && data.customOrder.length > 0) {
                // Merge customOrder with any newly discovered lists
                const merged = [...data.customOrder.filter((l: string) => foundLists.includes(l))];
                foundLists.forEach((l) => {
                  if (!merged.includes(l)) merged.push(l);
                });
                setCustomOrder(merged);
              } else {
                setCustomOrder(foundLists.length > 0 ? foundLists : defaultWishlistOrder);
              }
            }
          } else {
            // Initialize document with default wishlist items and order
            setDoc(wishlistDocRef, {
              items: defaultWishlistItems,
              customOrder: defaultWishlistOrder,
            }).catch(() => {});
          }
        },
        () => {
          setStatusNotice('Using local wishlist data');
          setWishlistItems(defaultWishlistItems);
          setCustomOrder(defaultWishlistOrder);
        }
      );
    } catch {
      setStatusNotice('Using local wishlist data');
      setWishlistItems(defaultWishlistItems);
      setCustomOrder(defaultWishlistOrder);
    }
    return () => unsubscribe();
  }, []);

  const syncToFirestore = async (updatedItems: WishlistItem[], updatedOrder: string[]) => {
    try {
      const docRef = doc(db, 'Wishlists', 'current');
      await updateDoc(docRef, { items: updatedItems, customOrder: updatedOrder });
    } catch {
      try {
        const docRef = doc(db, 'Wishlists', 'current');
        await setDoc(docRef, { items: updatedItems, customOrder: updatedOrder });
      } catch {}
    }
  };

  // Reordering handlers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...customOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setCustomOrder(newOrder);
    syncToFirestore(wishlistItems, newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === customOrder.length - 1) return;
    const newOrder = [...customOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setCustomOrder(newOrder);
    syncToFirestore(wishlistItems, newOrder);
  };

  // Rename handlers
  const handleOpenRename = (listName: string) => {
    setTargetListToRename(listName);
    setNewListName(listName);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed || trimmed === targetListToRename) {
      setRenameDialogOpen(false);
      return;
    }

    // Update List property across matching items
    const updatedItems = wishlistItems.map((item) =>
      item.List === targetListToRename ? { ...item, List: trimmed } : item
    );

    // Update custom order
    const updatedOrder = customOrder.map((l) => (l === targetListToRename ? trimmed : l));

    setWishlistItems(updatedItems);
    setCustomOrder(updatedOrder);
    syncToFirestore(updatedItems, updatedOrder);
    setRenameDialogOpen(false);
    setStatusNotice(`Renamed "${targetListToRename}" to "${trimmed}"`);
  };

  // Delete handlers
  const handleOpenDelete = (listName: string) => {
    setTargetListToDelete(listName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Filter out all items in this wishlist
    const updatedItems = wishlistItems.filter((item) => item.List !== targetListToDelete);
    const updatedOrder = customOrder.filter((l) => l !== targetListToDelete);

    setWishlistItems(updatedItems);
    setCustomOrder(updatedOrder);
    syncToFirestore(updatedItems, updatedOrder);
    setDeleteDialogOpen(false);
    setStatusNotice(`Deleted wishlist "${targetListToDelete}"`);
  };

  // Create new list directly from Settings
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = createdListName.trim();
    if (!trimmed) return;
    if (customOrder.includes(trimmed)) {
      setStatusNotice(`Wishlist "${trimmed}" already exists.`);
      setCreateDialogOpen(false);
      return;
    }

    const newOrder = [...customOrder, trimmed];
    setCustomOrder(newOrder);
    syncToFirestore(wishlistItems, newOrder);
    setCreatedListName('');
    setCreateDialogOpen(false);
    setStatusNotice(`Created new wishlist "${trimmed}"`);
  };

  // Count items per list
  const getShareCount = (listName: string) => {
    return wishlistItems.filter((item) => item.List === listName).length;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your wishlists, customize tab order, rename, or delete lists
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlaylistAddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            New Wishlist
          </Button>
          {onBackToWishlist && (
            <Button variant="outlined" color="primary" onClick={onBackToWishlist} sx={{ fontWeight: 700 }}>
              Back to Wishlists
            </Button>
          )}
        </Stack>
      </Box>

      {statusNotice && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setStatusNotice('')}>
          {statusNotice}
        </Alert>
      )}

      {/* Wishlist Management Section */}
      <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Manage Wishlists
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use the arrow buttons to rearrange tab order. You can also rename or delete custom wishlists.
          </Typography>

          {customOrder.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No wishlists found. Click "New Wishlist" to add one.
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
              <List disablePadding>
                {customOrder.map((listName, idx) => {
                  const shareCount = getShareCount(listName);
                  return (
                    <React.Fragment key={listName}>
                      <ListItem sx={{ py: 1.5, px: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, mr: 2 }}>
                          <BookmarkBorderIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {listName}
                          </Typography>
                          <Chip
                            label={`${shareCount} ${shareCount === 1 ? 'share' : 'shares'}`}
                            size="small"
                            variant="outlined"
                            sx={{ color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                          />
                        </Stack>

                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Move Up">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveUp(idx)}
                                  color="primary"
                                >
                                  <ArrowUpwardIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Move Down">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={idx === customOrder.length - 1}
                                  onClick={() => handleMoveDown(idx)}
                                  color="primary"
                                >
                                  <ArrowDownwardIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Rename Wishlist">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenRename(listName)}
                                sx={{ color: '#ffb74d' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Wishlist">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDelete(listName)}
                                color="error"
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {idx < customOrder.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Create Wishlist Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>New Wishlist</DialogTitle>
          <DialogContent>
            <TextField
              label="Wishlist Name"
              value={createdListName}
              onChange={(e) => setCreatedListName(e.target.value)}
              placeholder="e.g. EV Stocks, Energy, Dividends"
              fullWidth
              autoFocus
              required
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={!createdListName.trim()} sx={{ fontWeight: 700 }}>
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleRenameSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Rename Wishlist</DialogTitle>
          <DialogContent>
            <TextField
              label="Wishlist Name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              fullWidth
              autoFocus
              required
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Wishlist?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete the <strong>{targetListToDelete}</strong> wishlist? This will remove all shares saved in this list.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
