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
import { Domaine } from '../../core/models/domaine.model';
import { DomaineService } from '../../core/services/domaine.service';

@Component({
  selector: 'app-domaines',
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
  templateUrl: './domaines.component.html',
  styleUrl: './domaines.component.css'
})
export class DomainesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Domaine>([]);
  loading = false;
  editingId: number | null = null;
  currentLibelle = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly domaineService: DomaineService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      return [data.id, data.libelle].join(' ').toLowerCase().includes(search);
    };
  }

  ngOnInit(): void {
    this.loadDomaines();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDomaines(): void {
    this.loading = true;
    this.domaineService.getAll().subscribe({
      next: (domaines) => {
        this.dataSource.data = domaines;
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

  startEdit(domaine: Domaine): void {
    this.editingId = domaine.id;
    this.currentLibelle = domaine.libelle;
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
      const payload: Domaine = { id: this.editingId, libelle: trimmed };
      this.domaineService.update(this.editingId, payload).subscribe({
        next: () => {
          this.snackBar.open('Domaine modifié avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.cancelEdit();
          this.loadDomaines();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification du domaine', 'Fermer', {
            duration: 4000,
            panelClass: ['error-snack']
          });
        }
      });
      return;
    }

    this.domaineService.create({ id: 0, libelle: trimmed }).subscribe({
      next: () => {
        this.snackBar.open('Domaine créé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snack']
        });
        this.currentLibelle = '';
        this.loadDomaines();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la création du domaine', 'Fermer', {
          duration: 4000,
          panelClass: ['error-snack']
        });
      }
    });
  }

  openDeleteDialog(domaine: Domaine): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        title: 'Supprimer le domaine',
        message: `Voulez-vous vraiment supprimer le domaine "${domaine.libelle}" ?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.domaineService.delete(domaine.id).subscribe({
          next: () => {
            this.snackBar.open('Domaine supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.loadDomaines();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression du domaine', 'Fermer', {
              duration: 4000,
              panelClass: ['error-snack']
            });
          }
        });
      }
    });
  }
}
