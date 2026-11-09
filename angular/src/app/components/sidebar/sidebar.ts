import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  @Input() navigation: SidebarItem[] = [];
  @Input() activeSection = 'inicio';
  @Input() mobileOpen = false;

  @Output() sectionChange = new EventEmitter<string>();
  @Output() logoutRequest = new EventEmitter<void>();
  @Output() publishRequest = new EventEmitter<void>();

  selectSection(id: string): void {
    this.sectionChange.emit(id);
  }

  logout(): void {
    this.logoutRequest.emit();
  }

  publish(): void {
    this.publishRequest.emit();
  }
}
