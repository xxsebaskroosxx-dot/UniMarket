import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-my-listings-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-listings-section.html',
})
export class MyListingsSectionComponent {
  @Input() products: Product[] = [];
  @Input() isAdmin = false;
  @Output() publishRequest = new EventEmitter<void>();
  @Output() productClick = new EventEmitter<Product>();

  money(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }
}
