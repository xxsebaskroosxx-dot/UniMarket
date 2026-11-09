import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';
import { ProductListComponent } from '../product-list/product-list';

@Component({
  selector: 'app-favorites-section',
  standalone: true,
  imports: [ProductListComponent],
  templateUrl: './favorites-section.html',
})
export class FavoritesSectionComponent {
  @Input() products: Product[] = [];
  @Input() favoriteIds: number[] = [];
  @Input() viewerId = '';
  @Output() favoriteChange = new EventEmitter<{ id: number; isFavorite: boolean }>();
  @Output() exploreMarketplace = new EventEmitter<void>();
  @Output() contactSeller = new EventEmitter<{ userId: string; username: string }>();
  @Output() productClick = new EventEmitter<Product>();
}
