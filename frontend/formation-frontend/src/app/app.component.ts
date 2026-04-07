import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';

import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, NavbarComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'formation-frontend';

  private currentUrl = '';
  isMobile = false;
  sidenavOpened = false;

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.currentUrl = this.router.url;
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl = event.urlAfterRedirects;
    });
    this.updateViewportState();
  }

  showShell(): boolean {
    return this.authService.isLoggedIn() && this.currentUrl !== '/login';
  }

  onMenuClick(): void {
    if (this.isMobile) {
      this.sidenavOpened = !this.sidenavOpened;
    }
  }

  onSidebarNavigate(): void {
    if (this.isMobile) {
      this.sidenavOpened = false;
    }
  }

  onBackdropClick(): void {
    if (this.isMobile) {
      this.sidenavOpened = false;
    }
  }

  private updateViewportState(): void {
    this.isMobile = window.innerWidth < 768;
    this.sidenavOpened = !this.isMobile;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewportState();
  }
}
