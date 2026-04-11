import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Formateur } from '../../../core/models/formateur.model';
import { FormateurService } from '../../../core/services/formateur.service';
import { FormateurDialogComponent } from '../formateur-dialog/formateur-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-formateur-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './formateur-list.component.html',
  styleUrl: './formateur-list.component.css'
})
export class FormateurListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'tel', 'type', 'actions'];
  dataSource = new MatTableDataSource<Formateur>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly formateurService: FormateurService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      return [data.nom, data.prenom, data.email, data.tel, data.type]
        .join(' ')
        .toLowerCase()
        .includes(search);
    };
  }

  ngOnInit(): void {
    this.loadFormateurs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFormateurs(): void {
    this.loading = true;
    this.formateurService.getAll().subscribe({
      next: (formateurs) => {
        this.dataSource.data = formateurs;
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

  private blurActiveElement(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }

  openDeleteDialog(formateur: Formateur): void {
    this.blurActiveElement();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        title: 'Supprimer le formateur',
        message: `Voulez-vous vraiment supprimer le formateur ${formateur.nom} ${formateur.prenom} ?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.formateurService.delete(formateur.id).subscribe({
          next: () => {
            this.snackBar.open('Formateur supprimé', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.loadFormateurs();
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

  openCreateDialog(): void {
    this.blurActiveElement();

    const dialogRef = this.dialog.open(FormateurDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.formateurService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Formateur créé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.loadFormateurs();
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

  openEditDialog(formateur: Formateur): void {
    this.blurActiveElement();

    const dialogRef = this.dialog.open(FormateurDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: { mode: 'edit', formateur }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.formateurService.update(formateur.id, result).subscribe({
        next: () => {
          this.snackBar.open('Formateur modifié avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.loadFormateurs();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification', 'Fermer', {
            duration: 4000,
            panelClass: ['error-snack']
          });
        }
      });
    });
  }

  getTypeClass(type: string): string {
    return type?.toLowerCase() === 'interne' ? 'type-chip-interne' : 'type-chip-externe';
  }

}
