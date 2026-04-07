import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-formateur-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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

  openDeleteDialog(formateur: Formateur): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      disableClose: true
    });

    dialogRef.componentInstance.title = 'Supprimer le formateur';
    dialogRef.componentInstance.message = `Voulez-vous vraiment supprimer le formateur ${formateur.nom} ${formateur.prenom} ?`;
    dialogRef.componentInstance.confirmText = 'Supprimer';
    dialogRef.componentInstance.cancelText = 'Annuler';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.formateurService.delete(formateur.id).subscribe({
          next: () => {
            this.snackBar.open('Formateur supprimé', 'Fermer', {
              duration: 3000
            });
            this.loadFormateurs();
          },
          error: () => this.loadFormateurs()
        });
      }
    });
  }

  getTypeClass(type: string): string {
    return type?.toLowerCase() === 'interne' ? 'type-chip-interne' : 'type-chip-externe';
  }

}
