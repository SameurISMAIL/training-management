import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
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

import { Domaine } from '../../../core/models/domaine.model';
import { Formateur } from '../../../core/models/formateur.model';
import { Formation } from '../../../core/models/formation.model';
import { Participant } from '../../../core/models/participant.model';
import { DomaineService } from '../../../core/services/domaine.service';
import { FormateurService } from '../../../core/services/formateur.service';
import { FormationService } from '../../../core/services/formation.service';
import { ParticipantService } from '../../../core/services/participant.service';
import { FormationDialogComponent } from '../formation-dialog/formation-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-formation-list',
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
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './formation-list.component.html',
  styleUrl: './formation-list.component.css'
})
export class FormationListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['titre', 'dateFormation', 'duree', 'domaine', 'budget', 'actions'];
  dataSource = new MatTableDataSource<Formation>([]);
  loading = false;
  formations: Formation[] = [];
  allDomaines: Domaine[] = [];
  allFormateurs: Formateur[] = [];
  allParticipants: Participant[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly formationService: FormationService,
    private readonly domaineService: DomaineService,
    private readonly formateurService: FormateurService,
    private readonly participantService: ParticipantService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      const searchableText = [
        data.titre,
        data.dateFormation,
        data.duree,
        data.budget,
        data.domaine?.libelle,
        `${data.formateur?.nom ?? ''} ${data.formateur?.prenom ?? ''}`
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    };
  }

  ngOnInit(): void {
    this.loadFormations();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFormations(): void {
    this.loading = true;
    forkJoin([
      this.formationService.getAllFormations(),
      this.domaineService.getAll(),
      this.formateurService.getAll(),
      this.participantService.getAll()
    ]).subscribe({
      next: ([formations, domaines, formateurs, participants]) => {
        this.formations = formations;
        this.dataSource.data = formations;
        this.allDomaines = domaines;
        this.allFormateurs = formateurs;
        this.allParticipants = participants;
        this.loading = false;
      },
      error: () => {
        this.formations = [];
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(FormationDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        mode: 'create',
        domaines: this.allDomaines,
        formateurs: this.allFormateurs,
        participants: this.allParticipants
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.formationService.createFormation(result).subscribe({
        next: () => {
          this.snackBar.open('Formation créée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.loadFormations();
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

  openEditDialog(formation: Formation): void {
    const dialogRef = this.dialog.open(FormationDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        mode: 'edit',
        formation,
        domaines: this.allDomaines,
        formateurs: this.allFormateurs,
        participants: this.allParticipants
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.formationService.updateFormation(formation.id, result).subscribe({
        next: () => {
          this.snackBar.open('Formation modifiée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snack']
          });
          this.loadFormations();
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

  deleteFormation(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '680px',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        title: 'Supprimer la formation',
        message: 'Voulez-vous vraiment supprimer cette formation ?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.formationService.deleteFormation(id).subscribe({
          next: () => {
            this.snackBar.open('Formation supprimée', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.loadFormations();
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
}
