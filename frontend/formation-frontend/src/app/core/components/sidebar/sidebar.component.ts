import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() navigate = new EventEmitter<void>();

  mainNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur', 'ROLE_RESPONSABLE', 'RESPONSABLE', 'responsable', 'ROLE_USER', 'USER', 'simple utilisateur', 'utilisateur'] },
    { label: 'Formations', route: '/formations', icon: 'school', roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur', 'ROLE_USER', 'USER', 'simple utilisateur', 'utilisateur'] },
    { label: 'Formateurs', route: '/formateurs', icon: 'person_outline', roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur', 'ROLE_USER', 'USER', 'simple utilisateur', 'utilisateur'] },
    { label: 'Participants', route: '/participants', icon: 'group', roles: ['ROLE_ADMIN', 'ADMIN', 'administrateur', 'ROLE_USER', 'USER', 'simple utilisateur', 'utilisateur'] },
    { label: 'Statistiques', route: '/statistiques', icon: 'bar_chart', roles: ['ROLE_RESPONSABLE', 'RESPONSABLE', 'ROLE_ADMIN', 'ADMIN'] },
  ];

  adminNavItems: NavItem[] = [
    { label: 'Domaines', route: '/admin/domaines', icon: 'category', roles: ['ROLE_ADMIN', 'ADMIN'] },
    { label: 'Structures', route: '/admin/structures', icon: 'account_tree', roles: ['ROLE_ADMIN', 'ADMIN'] },
    { label: 'Profils', route: '/admin/profils', icon: 'badge', roles: ['ROLE_ADMIN', 'ADMIN'] },
    { label: 'Utilisateurs', route: '/admin/users', icon: 'manage_accounts', roles: ['ROLE_ADMIN', 'ADMIN'] }
  ];

  constructor(public readonly authService: AuthService) {}

  canShow(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return this.authService.hasAnyRole(item.roles);
  }

  onNavigate(): void {
    this.navigate.emit();
  }
}
