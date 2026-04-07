import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  login(login: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { login, password }).pipe(
      tap((response) => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_login', response.login);
        localStorage.setItem('auth_role', response.role);
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getRole(): string {
    return localStorage.getItem('auth_role') ?? '';
  }

  getNormalizedRole(): string {
    return this.normalizeRoleValue(this.getRole());
  }

  getLogin(): string {
    return localStorage.getItem('auth_login') ?? '';
  }

  isAdmin(): boolean {
    const role = this.getNormalizedRole();
    return role === 'administrateur' || role === 'admin';
  }

  isResponsable(): boolean {
    const role = this.getNormalizedRole();
    return role === 'responsable';
  }

  hasAnyRole(expectedRoles: string[]): boolean {
    if (expectedRoles.length === 0) {
      return true;
    }

    const currentRole = this.getNormalizedRole();
    return expectedRoles.some((role) => {
      const normalizedExpected = this.normalizeRoleValue(role);
      return normalizedExpected === currentRole;
    });
  }

  private normalizeRoleValue(role: string): string {
    const cleaned = role
      .trim()
      .toLowerCase()
      .replace(/^role_/, '')
      .replace(/_/g, ' ')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.includes('admin')) {
      return 'administrateur';
    }
    if (cleaned.includes('responsable')) {
      return 'responsable';
    }
    return cleaned;
  }
}
