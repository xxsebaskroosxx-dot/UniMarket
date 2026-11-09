import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCardComponent {
  product = input.required<Product>();
  isFavorite = input(false);
  viewerId = input('');
  favoriteChange = output<{ id: number; isFavorite: boolean }>();
  contactSeller = output<{ userId: string; username: string }>();
  productClick = output<Product>();

  formattedPrice = computed(() => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(this.product().price));

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    const nextState = !this.isFavorite();
    this.favoriteChange.emit({ id: this.product().id, isFavorite: nextState });
  }

  openProductDetails(): void {
    this.productClick.emit(this.product());
  }

  messageSeller(event?: Event): void {
    event?.stopPropagation();
    const product = this.product();
    if (product.ownerId && product.ownerUsername) {
      this.contactSeller.emit({ userId: product.ownerId, username: product.ownerUsername });
    }
  }
}
