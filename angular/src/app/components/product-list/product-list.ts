import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';
import { ProductCardComponent } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Input() favoriteIds: number[] = [];
  @Input() viewerId = '';
  @Output() favoriteChange = new EventEmitter<{ id: number; isFavorite: boolean }>();
  @Output() contactSeller = new EventEmitter<{ userId: string; username: string }>();
  @Output() productClick = new EventEmitter<Product>();
  onFavoriteChange(event: { id: number; isFavorite: boolean }): void {
    this.favoriteChange.emit(event);
  }

  onProductClick(product: Product): void {
    this.productClick.emit(product);
  }
}
