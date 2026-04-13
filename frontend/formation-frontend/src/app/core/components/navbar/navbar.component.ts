import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private readonly themeStorageKey = 'theme-preference';

  @Output() toggleSidenav = new EventEmitter<void>();
  isDarkMode = false;

  constructor(public readonly authService: AuthService) {
    this.initializeTheme();
  }

  get userInitial(): string {
    const login = this.authService.getLogin();
    return login ? login.charAt(0).toUpperCase() : 'U';
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkMode);
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.themeStorageKey);
    if (savedTheme === 'dark') {
      this.setDarkMode(true);
      return;
    }

    if (savedTheme === 'light') {
      this.setDarkMode(false);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setDarkMode(prefersDark);
  }

  private setDarkMode(enabled: boolean): void {
    this.isDarkMode = enabled;
    document.body.classList.toggle('dark-theme', enabled);
    localStorage.setItem(this.themeStorageKey, enabled ? 'dark' : 'light');
  }
}
