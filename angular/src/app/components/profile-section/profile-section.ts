import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  styleUrl: './profile-section.css',
  templateUrl: './profile-section.html',
})
export class ProfileSectionComponent {
  @Input() loggedUser = '';
  @Input() role: 'admin' | 'user' = 'user';
  @Input() productCount = 0;
  @Input() favoriteCount = 0;
}
