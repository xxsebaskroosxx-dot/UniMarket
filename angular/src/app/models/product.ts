export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  state: string;
  listingType?: 'Venta' | 'Intercambio';
  tradeWishlist?: string;
  images?: string[];
  description?: string;
  ownerId?: string;
  ownerUsername?: string;
}
