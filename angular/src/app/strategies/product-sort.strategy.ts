import { Product } from '../models/product';

/** Estrategia seleccionable para ordenar los productos del marketplace. */
export interface ProductSortStrategy {
  sort(products: Product[]): Product[];
}

export type ProductSortOption = 'recent' | 'price-asc' | 'price-desc' | 'name-asc';

export class RecentProductsStrategy implements ProductSortStrategy {
  sort(products: Product[]): Product[] {
    return [...products].sort((left, right) => right.id - left.id);
  }
}

export class LowestPriceStrategy implements ProductSortStrategy {
  sort(products: Product[]): Product[] {
    return [...products].sort((left, right) => left.price - right.price);
  }
}

export class HighestPriceStrategy implements ProductSortStrategy {
  sort(products: Product[]): Product[] {
    return [...products].sort((left, right) => right.price - left.price);
  }
}

export class NameStrategy implements ProductSortStrategy {
  sort(products: Product[]): Product[] {
    return [...products].sort((left, right) => left.name.localeCompare(right.name, 'es'));
  }
}

export function strategyFor(option: ProductSortOption): ProductSortStrategy {
  switch (option) {
    case 'price-asc':
      return new LowestPriceStrategy();
    case 'price-desc':
      return new HighestPriceStrategy();
    case 'name-asc':
      return new NameStrategy();
    case 'recent':
    default:
      return new RecentProductsStrategy();
  }
}
