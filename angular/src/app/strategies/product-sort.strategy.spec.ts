import { Product } from '../models/product';
import { strategyFor } from './product-sort.strategy';

const products: Product[] = [
  { id: 1, name: 'Cuaderno', price: 20_000, category: 'Papelería', emoji: '📓', state: 'Publicado' },
  { id: 3, name: 'Audífonos', price: 80_000, category: 'Electrónica', emoji: '🎧', state: 'Publicado' },
  { id: 2, name: 'Libro', price: 10_000, category: 'Libros', emoji: '📚', state: 'Publicado' },
];

describe('Product sort strategies', () => {
  it('ordena por productos recientes sin modificar la lista original', () => {
    const result = strategyFor('recent').sort(products);
    expect(result.map((product) => product.id)).toEqual([3, 2, 1]);
    expect(products.map((product) => product.id)).toEqual([1, 3, 2]);
  });

  it('ordena por precio ascendente y descendente', () => {
    expect(strategyFor('price-asc').sort(products).map((product) => product.price)).toEqual([10_000, 20_000, 80_000]);
    expect(strategyFor('price-desc').sort(products).map((product) => product.price)).toEqual([80_000, 20_000, 10_000]);
  });

  it('ordena alfabéticamente por nombre', () => {
    expect(strategyFor('name-asc').sort(products).map((product) => product.name)).toEqual(['Audífonos', 'Cuaderno', 'Libro']);
  });
});
