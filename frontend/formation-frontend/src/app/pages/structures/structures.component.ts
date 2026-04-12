import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Structure } from '../../core/models/structure.model';
import { StructureService } from '../../core/services/structure.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-structures',
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
  templateUrl: './structures.component.html',
  styleUrl: './structures.component.css'
})
export class StructuresComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['libelle', 'actions'];
  dataSource = new MatTableDataSource<Structure>([]);
  loading = false;
  editingId: number | null = null;
  currentLibelle = '';
  private formDialogRef: MatDialogRef<unknown> | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('formDialog') formDialog!: TemplateRef<unknown>;

  constructor(
    private readonly structureService: StructureService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      return [data.id, data.libelle].join(' ').toLowerCase().includes(search);
    };
  }

  ngOnInit(): void {
    this.loadStructures();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadStructures(): void {
    this.loading = true;
    this.structureService.getAll().subscribe({
      next: (structures) => {
        this.dataSource.data = structures;
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

  openCreateDialog(): void {
    this.editingId = null;
    this.currentLibelle = '';
    this.formDialogRef = this.dialog.open(this.formDialog, {
      width: '520px',
      panelClass: 'custom-dialog',
      disableClose: true
    });
  }

  startEdit(structure: Structure): void {
    this.editingId = structure.id;
    this.currentLibelle = structure.libelle;
    this.formDialogRef = this.dialog.open(this.formDialog, {
      width: '520px',
      panelClass: 'custom-dialog',
      disableClose: true
    });
  }

  closeFormDialog(): void {
    this.formDialogRef?.close();
    this.formDialogRef = null;
    this.cancelEdit();
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
      const payload: Structure = { id: this.editingId, libelle: trimmed };
      this.structureService.update(this.editingId, payload).subscribe({
        next: () => {
          this.snackBar.open('Structure modifiée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.closeFormDialog();
          this.loadStructures();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification de la structure', 'Fermer', {
            duration: 4000,
            panelClass: ['error-snack']
          });
        }
      });
      return;
    }

    this.structureService.create({ id: 0, libelle: trimmed }).subscribe({
      next: () => {
        this.snackBar.open('Structure créée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snack']
        });
        this.closeFormDialog();
        this.loadStructures();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la création de la structure', 'Fermer', {
          duration: 4000,
          panelClass: ['error-snack']
        });
      }
    });
  }

  openDeleteDialog(structure: Structure): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        title: 'Supprimer la structure',
        message: `Voulez-vous vraiment supprimer la structure "${structure.libelle}" ?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.structureService.delete(structure.id).subscribe({
          next: () => {
            this.snackBar.open('Structure supprimée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.loadStructures();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression de la structure', 'Fermer', {
              duration: 4000,
              panelClass: ['error-snack']
            });
          }
        });
      }
    });
  }
}
