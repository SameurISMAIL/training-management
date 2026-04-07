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

import { Structure } from '../../core/models/structure.model';
import { StructureService } from '../../core/services/structure.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-structures',
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
  templateUrl: './structures.component.html',
  styleUrl: './structures.component.css'
})
export class StructuresComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Structure>([]);
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

  get libelleControl() {
    return this.createForm.controls.libelle;
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

  startEdit(structure: Structure): void {
    this.editingId = structure.id;
    this.editingLibelle = structure.libelle;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingLibelle = '';
  }

  saveEdit(structure: Structure): void {
    const payload: Structure = {
      id: structure.id,
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

    this.structureService.update(structure.id, payload).subscribe({
      next: () => {
        this.snackBar.open('Structure modifiée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.cancelEdit();
        this.loadStructures();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la modification de la structure', 'Fermer', {
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

    const payload: Structure = {
      id: 0,
      libelle: (this.libelleControl.value ?? '').trim()
    };

    this.structureService.create(payload).subscribe({
      next: () => {
        this.snackBar.open('Structure créée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.createForm.reset();
        this.loadStructures();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la création de la structure', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  openDeleteDialog(structure: Structure): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      disableClose: true
    });

    dialogRef.componentInstance.title = 'Supprimer la structure';
    dialogRef.componentInstance.message = `Voulez-vous vraiment supprimer la structure "${structure.libelle}" ?`;
    dialogRef.componentInstance.confirmText = 'Supprimer';
    dialogRef.componentInstance.cancelText = 'Annuler';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.structureService.delete(structure.id).subscribe({
          next: () => {
            this.snackBar.open('Structure supprimée avec succès', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadStructures();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression de la structure', 'Fermer', {
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
