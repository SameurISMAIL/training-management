import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';

import { NavbarComponent } from './core/components/navbar/navbar.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, NavbarComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoginRoute = false;
  isMobileView = false;
  isSidenavOpened = true;

  private readonly mobileBreakpoint = 992;

  constructor(
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.updateViewportState();
    this.setRouteState(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.setRouteState(event.urlAfterRedirects);

        if (this.isMobileView) {
          this.isSidenavOpened = false;
        }
      });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const wasMobileView = this.isMobileView;
    this.updateViewportState();

    if (this.isLoginRoute) {
      this.isSidenavOpened = false;
      return;
    }

    if (this.isMobileView) {
      this.isSidenavOpened = false;
      return;
    }

    if (wasMobileView !== this.isMobileView) {
      this.isSidenavOpened = true;
    }
  }

  onToggleSidenav(): void {
    if (this.isLoginRoute) {
      return;
    }

    this.isSidenavOpened = !this.isSidenavOpened;
  }

  onSidebarNavigate(): void {
    if (this.isMobileView) {
      this.isSidenavOpened = false;
    }
  }

  private updateViewportState(): void {
    this.isMobileView = window.innerWidth < this.mobileBreakpoint;
  }

  private setRouteState(url: string): void {
    this.isLoginRoute = url === '/login';
    this.isSidenavOpened = !this.isLoginRoute && !this.isMobileView;
  }
}
