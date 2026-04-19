import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { MatChipsModule } from '@angular/material/chips';

import { Participant } from '../../../core/models/participant.model';
import { ParticipantService } from '../../../core/services/participant.service';
import { ParticipantDialogComponent } from '../participant-dialog/participant-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-participant-list',
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
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './participant-list.component.html',
  styleUrl: './participant-list.component.css'
})
export class ParticipantListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'tel', 'structure', 'profil', 'actions'];
  dataSource = new MatTableDataSource<Participant>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly participantService: ParticipantService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      return [data.nom, data.prenom]
        .join(' ')
        .toLowerCase()
        .includes(search);
    };
  }

  ngOnInit(): void {
    this.loadParticipants();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadParticipants(): void {
    this.loading = true;
    this.participantService.getAll().subscribe({
      next: (participants) => {
        this.dataSource.data = participants;
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

  openDeleteDialog(participant: Participant): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        title: 'Supprimer le participant',
        message: `Voulez-vous vraiment supprimer le participant ${participant.nom} ${participant.prenom} ?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.participantService.delete(participant.id).subscribe({
          next: () => {
            this.snackBar.open('Participant supprimé', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.loadParticipants();
          },
          error: (err) => {
            const message = err?.error?.message || 'Erreur lors de la suppression';
            this.snackBar.open(message, 'Fermer', {
              duration: 4000,
              panelClass: ['error-snack']
            });
          }
        });
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ParticipantDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.participantService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Participant créé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.loadParticipants();
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

  openEditDialog(participant: Participant): void {
    const dialogRef = this.dialog.open(ParticipantDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: { mode: 'edit', participant }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.participantService.update(participant.id, result).subscribe({
        next: () => {
          this.snackBar.open('Participant modifié avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.loadParticipants();
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

}
