import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Profil } from '../../core/models/profil.model';
import { ProfilService } from '../../core/services/profil.service';

@Component({
  selector: 'app-profils',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './profils.component.html',
  styleUrl: './profils.component.css'
})
export class ProfilsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Profil>([]);
  loading = false;
  editingId: number | null = null;
  currentLibelle = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
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
    this.currentLibelle = profil.libelle;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.currentLibelle = '';
  }

  save(): void {
    const trimmed = this.currentLibelle.trim();

    if (!trimmed) {
      this.snackBar.open('Le libellé est obligatoire', 'Fermer', {
        duration: 4000,
        panelClass: ['error-snack']
      });
      return;
    }

    if (this.editingId) {
      const payload: Profil = { id: this.editingId, libelle: trimmed };
      this.profilService.update(this.editingId, payload).subscribe({
        next: () => {
          this.snackBar.open('Profil modifié avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.cancelEdit();
          this.loadProfils();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification du profil', 'Fermer', {
            duration: 4000,
            panelClass: ['error-snack']
          });
        }
      });
      return;
    }

    this.profilService.create({ id: 0, libelle: trimmed }).subscribe({
      next: () => {
        this.snackBar.open('Profil créé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snack']
        });
        this.currentLibelle = '';
        this.loadProfils();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la création du profil', 'Fermer', {
          duration: 4000,
          panelClass: ['error-snack']
        });
      }
    });
  }

  openDeleteDialog(profil: Profil): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        title: 'Supprimer le profil',
        message: `Voulez-vous vraiment supprimer le profil "${profil.libelle}" ?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.profilService.delete(profil.id).subscribe({
          next: () => {
            this.snackBar.open('Profil supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.loadProfils();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression du profil', 'Fermer', {
              duration: 4000,
              panelClass: ['error-snack']
            });
          }
        });
      }
    });
  }
}
