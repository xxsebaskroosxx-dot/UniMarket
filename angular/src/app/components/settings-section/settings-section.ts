import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings-section',
  standalone: true,
  templateUrl: './settings-section.html',
})
export class SettingsSectionComponent {
  @Input() darkMode = false;
  @Input() privateProfile = false;
  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() privateProfileChange = new EventEmitter<boolean>();

  onDarkModeChange(event: Event): void {
    this.darkModeChange.emit((event.target as HTMLInputElement).checked);
  }

  onPrivacyChange(event: Event): void {
    this.privateProfileChange.emit((event.target as HTMLInputElement).checked);
  }
}
