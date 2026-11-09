export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  state: string;
  images?: string[];
  description?: string;
  ownerId?: string;
  ownerUsername?: string;
}
