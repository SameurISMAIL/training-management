import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
import { Domaine } from '../../core/models/domaine.model';
import { DomaineService } from '../../core/services/domaine.service';

@Component({
  selector: 'app-domaines',
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
  templateUrl: './domaines.component.html',
  styleUrl: './domaines.component.css'
})
export class DomainesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Domaine>([]);
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

  get libelleControl() {
    return this.createForm.controls.libelle;
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
    this.editingLibelle = domaine.libelle;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingLibelle = '';
  }

  saveEdit(domaine: Domaine): void {
    const payload: Domaine = {
      id: domaine.id,
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

    this.domaineService.update(domaine.id, payload).subscribe({
      next: () => {
        this.snackBar.open('Domaine modifié avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.cancelEdit();
        this.loadDomaines();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la modification du domaine', 'Fermer', {
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

    const payload: Domaine = {
      id: 0,
      libelle: (this.libelleControl.value ?? '').trim()
    };

    this.domaineService.create(payload).subscribe({
      next: () => {
        this.snackBar.open('Domaine créé avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.createForm.reset();
        this.loadDomaines();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la création du domaine', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  openDeleteDialog(domaine: Domaine): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      disableClose: true
    });

    dialogRef.componentInstance.title = 'Supprimer le domaine';
    dialogRef.componentInstance.message = `Voulez-vous vraiment supprimer le domaine "${domaine.libelle}" ?`;
    dialogRef.componentInstance.confirmText = 'Supprimer';
    dialogRef.componentInstance.cancelText = 'Annuler';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.domaineService.delete(domaine.id).subscribe({
          next: () => {
            this.snackBar.open('Domaine supprimé avec succès', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadDomaines();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression du domaine', 'Fermer', {
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
