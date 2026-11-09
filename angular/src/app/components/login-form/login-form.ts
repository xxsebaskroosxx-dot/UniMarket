import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginFormComponent implements OnChanges {
  step: 'email' | 'password' = 'email';
  emailDraft = '';

  @Input() loginUser = '';
  @Input() loginPassword = '';
  @Input() showPassword = false;
  @Input() loginError = '';
  @Input() loginErrorSuccess = false;

  @Output() loginUserChange = new EventEmitter<string>();
  @Output() loginPasswordChange = new EventEmitter<string>();
  @Output() showPasswordChange = new EventEmitter<boolean>();
  @Output() submitLogin = new EventEmitter<void>();
  @Output() resetPassword = new EventEmitter<void>();
  @Output() openRegister = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loginUser']) {
      this.emailDraft = this.loginUser;
    }
  }

  onLogin(): void {
    this.submitLogin.emit();
  }

  continueToPassword(): void {
    this.emailDraft = this.emailDraft.trim();
    this.loginUserChange.emit(this.emailDraft);
    this.step = 'password';
  }

  backToEmail(): void {
    this.step = 'email';
    this.loginPasswordChange.emit('');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.showPasswordChange.emit(this.showPassword);
  }

  onResetPassword(): void {
    this.loginUserChange.emit(this.emailDraft.trim());
    this.resetPassword.emit();
  }

  onOpenRegister(): void {
    this.openRegister.emit();
  }
}
