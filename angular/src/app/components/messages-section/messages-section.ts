import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../../models/conversation';
import { UserProfile } from '../../services/marketplace';

@Component({
  selector: 'app-messages-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './messages-section.css',
  templateUrl: './messages-section.html',
})
export class MessagesSectionComponent {
  @Input() conversations: Conversation[] = [];
  @Input() activeChat = 0;
  @Input() chatInput = '';
  @Input() searchTerm = '';
  @Input() searchResults: UserProfile[] = [];
  @Input() chatError = '';
  @Input() sending = false;

  @Output() activeChatChange = new EventEmitter<number>();
  @Output() chatInputChange = new EventEmitter<string>();
  @Output() sendMessage = new EventEmitter<void>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() searchUsers = new EventEmitter<void>();
  @Output() startConversation = new EventEmitter<string>();

  get currentConversation(): Conversation | undefined {
    return this.conversations[this.activeChat];
  }
}
