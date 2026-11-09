import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';
import { ProductListComponent } from '../product-list/product-list';

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  templateUrl: './home-section.html',
})
export class HomeSectionComponent {
  @Input() categories: string[] = [];
  @Input() categoryIcons: string[] = [];
  @Input() products: Product[] = [];
  @Input() favoriteIds: number[] = [];
  @Input() viewerId = '';

  @Output() categorySelected = new EventEmitter<string>();
  @Output() showAllCategories = new EventEmitter<void>();
  @Output() favoriteChange = new EventEmitter<{ id: number; isFavorite: boolean }>();
  @Output() publishRequest = new EventEmitter<void>();
  @Output() contactSeller = new EventEmitter<{ userId: string; username: string }>();
  @Output() productClick = new EventEmitter<Product>();

}
