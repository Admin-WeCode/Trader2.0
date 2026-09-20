export interface WishlistItem {
  id: string;
  List: string; // Name of the wishlist, e.g. "Tech", "Tata"
  name: string;
  symbol: string;
  currentPrice: number;
}

export const defaultWishlistItems: WishlistItem[] = [
  { id: 'w1', List: 'Tech', name: 'Tata Consultancy Services', symbol: 'TCS', currentPrice: 4280.50 },
  { id: 'w2', List: 'Tech', name: 'Infosys Ltd', symbol: 'INFY', currentPrice: 1840.00 },
  { id: 'w3', List: 'Tata', name: 'Tata Consultancy Services', symbol: 'TCS', currentPrice: 4280.50 },
  { id: 'w4', List: 'Tata', name: 'Tata Motors', symbol: 'TATAMOTORS', currentPrice: 980.25 },
  { id: 'w5', List: 'Banking', name: 'HDFC Bank', symbol: 'HDFCBANK', currentPrice: 1620.75 },
  { id: 'w6', List: 'Banking', name: 'ICICI Bank', symbol: 'ICICIBANK', currentPrice: 1210.30 },
];

export const defaultWishlistOrder: string[] = ['Tech', 'Tata', 'Banking'];
