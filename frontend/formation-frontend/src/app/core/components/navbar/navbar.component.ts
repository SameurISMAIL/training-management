import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventEmitter, Input, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() showMenuButton = false;
  @Output() menuClick = new EventEmitter<void>();

  constructor(public readonly authService: AuthService) {}

  toggleMenu(): void {
    this.menuClick.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
