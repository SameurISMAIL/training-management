import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '../../../core/services/auth.service';
import { AdminUsersService } from '../../../core/services/admin-users.service';
import { User } from '../../../core/models/user.model';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['login', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;
  currentLogin = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      return [data.login, this.getRoleLabel(data.role), data.id]
        .join(' ')
        .toLowerCase()
        .includes(search);
    };
  }

  ngOnInit(): void {
    this.currentLogin = this.authService.getLogin();
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.loading = true;
    this.adminUsersService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading = false;
      },
      error: () => {
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  canDelete(user: User): boolean {
    return user.login !== this.currentLogin;
  }

  getRoleClass(role: unknown): string {
    const normalized = this.getRoleLabel(role).toLowerCase();
    if (normalized.includes('admin')) return 'chip-admin';
    if (normalized.includes('responsable')) return 'chip-responsable';
    return 'chip-user';
  }

  getRoleLabel(role: unknown): string {
    if (typeof role === 'string') {
      return role;
    }

    if (Array.isArray(role)) {
      return role
        .map((item) => this.getRoleLabel(item))
        .filter(Boolean)
        .join(', ');
    }

    if (role && typeof role === 'object') {
      const record = role as Record<string, unknown>;
      const candidate = record['role'] ?? record['nom'] ?? record['name'] ?? record['authority'];
      if (typeof candidate === 'string') {
        return candidate;
      }
    }

    return 'utilisateur';
  }

  private blurActiveElement(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }

  openCreateDialog(): void {
    this.blurActiveElement();

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '560px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.adminUsersService.createUser(result).subscribe({
        next: () => {
          this.snackBar.open('Utilisateur créé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création', 'Fermer', {
            duration: 4000,
            panelClass: ['error-snack']
          });
        }
      });
    });
  }

  openDeleteDialog(user: User): void {
    if (!this.canDelete(user)) {
      this.snackBar.open('Vous ne pouvez pas supprimer votre propre compte', 'Fermer', {
        duration: 4000,
        panelClass: ['error-snack']
      });
      return;
    }

    this.blurActiveElement();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        title: 'Supprimer un utilisateur',
        message: `Voulez-vous vraiment supprimer l'utilisateur ${user.login} ?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminUsersService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.loadUsers();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 4000,
              panelClass: ['error-snack']
            });
          }
        });
      }
    });
  }
}