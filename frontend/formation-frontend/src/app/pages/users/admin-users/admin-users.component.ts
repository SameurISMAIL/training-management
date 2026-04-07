import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../core/services/auth.service';
import { AdminUsersService, CreateUserRequest } from '../../../core/services/admin-users.service';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'login', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;
  saving = false;
  currentLogin = '';

  roles = [
    { value: 'administrateur', label: 'Admin' },
    { value: 'responsable', label: 'Responsable' },
    { value: 'simple utilisateur', label: 'Utilisateur' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  userForm = this.fb.group({
    login: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminUsersService: AdminUsersService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      return [data.login, data.role, data.id]
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

  get loginControl() {
    return this.userForm.controls.login;
  }

  get passwordControl() {
    return this.userForm.controls.password;
  }

  get roleControl() {
    return this.userForm.controls.role;
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

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const request: CreateUserRequest = this.userForm.getRawValue() as CreateUserRequest;

    this.adminUsersService.createUser(request).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Utilisateur créé avec succès', 'Fermer', { duration: 3000 });
        this.userForm.reset();
        this.loadUsers();
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  canDelete(user: User): boolean {
    return user.login !== this.currentLogin;
  }

  openDeleteDialog(user: User): void {
    if (!this.canDelete(user)) {
      this.snackBar.open('Vous ne pouvez pas supprimer votre propre compte', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      disableClose: true
    });

    dialogRef.componentInstance.title = 'Supprimer un utilisateur';
    dialogRef.componentInstance.message = `Voulez-vous vraiment supprimer l'utilisateur ${user.login} ?`;
    dialogRef.componentInstance.confirmText = 'Supprimer';
    dialogRef.componentInstance.cancelText = 'Annuler';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminUsersService.deleteUser(user.id).subscribe({
          next: () => this.loadUsers(),
          error: () => this.loadUsers()
        });
      }
    });
  }
}
