import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Profil } from '../../core/models/profil.model';
import { ProfilService } from '../../core/services/profil.service';

@Component({
  selector: 'app-profils',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './profils.component.html',
  styleUrl: './profils.component.css'
})
export class ProfilsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Profil>([]);
  loading = false;
  editingId: number | null = null;
  editingLibelle = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('createInput') createInput?: ElementRef<HTMLInputElement>;

  createForm = this.fb.group({
    libelle: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly profilService: ProfilService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      return [data.id, data.libelle].join(' ').toLowerCase().includes(search);
    };
  }

  ngOnInit(): void {
    this.loadProfils();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  get libelleControl() {
    return this.createForm.controls.libelle;
  }

  loadProfils(): void {
    this.loading = true;
    this.profilService.getAll().subscribe({
      next: (profils) => {
        this.dataSource.data = profils;
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

  startEdit(profil: Profil): void {
    this.editingId = profil.id;
    this.editingLibelle = profil.libelle;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingLibelle = '';
  }

  saveEdit(profil: Profil): void {
    const payload: Profil = {
      id: profil.id,
      libelle: this.editingLibelle.trim()
    };

    if (!payload.libelle) {
      this.snackBar.open('Le libellé est obligatoire', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    this.profilService.update(profil.id, payload).subscribe({
      next: () => {
        this.snackBar.open('Profil modifié avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.cancelEdit();
        this.loadProfils();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la modification du profil', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload: Profil = {
      id: 0,
      libelle: (this.libelleControl.value ?? '').trim()
    };

    this.profilService.create(payload).subscribe({
      next: () => {
        this.snackBar.open('Profil créé avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.createForm.reset();
        this.loadProfils();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la création du profil', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  openDeleteDialog(profil: Profil): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      disableClose: true
    });

    dialogRef.componentInstance.title = 'Supprimer le profil';
    dialogRef.componentInstance.message = `Voulez-vous vraiment supprimer le profil "${profil.libelle}" ?`;
    dialogRef.componentInstance.confirmText = 'Supprimer';
    dialogRef.componentInstance.cancelText = 'Annuler';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.profilService.delete(profil.id).subscribe({
          next: () => {
            this.snackBar.open('Profil supprimé avec succès', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadProfils();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression du profil', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  focusCreateForm(): void {
    this.createInput?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.createInput?.nativeElement.focus();
  }
}
