import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';
import { ProductListComponent } from '../product-list/product-list';

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  templateUrl: './categories-section.html',
})
export class CategoriesSectionComponent {
  @Input() categories: string[] = [];
  @Input() categoryIcons: string[] = [];
  @Input() products: Product[] = [];
  @Input() favoriteIds: number[] = [];
  @Input() viewerId = '';
  @Input() activeCategory = '';

  @Output() categorySelected = new EventEmitter<string>();
  @Output() clearCategory = new EventEmitter<void>();
  @Output() favoriteChange = new EventEmitter<{ id: number; isFavorite: boolean }>();
  @Output() contactSeller = new EventEmitter<{ userId: string; username: string }>();
  @Output() productClick = new EventEmitter<Product>();
}
