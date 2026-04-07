import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Formation } from '../../../core/models/formation.model';
import { FormationService } from '../../../core/services/formation.service';
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
    MatSelectModule,
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
  displayedColumns: string[] = ['titre', 'annee', 'duree', 'domaine', 'budget', 'actions'];
  dataSource = new MatTableDataSource<Formation>([]);
  loading = false;
  selectedYear: number | null = null;
  availableYears: number[] = [];
  totalBudget = 0;
  allFormations: Formation[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly formationService: FormationService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      const search = filter.trim().toLowerCase();
      const searchableText = [
        data.titre,
        data.annee,
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
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.allFormations = formations;
        this.availableYears = [...new Set(formations.map((item) => item.annee))].sort((a, b) => b - a);
        this.applyYearFilter();
        this.loading = false;
      },
      error: () => {
        this.allFormations = [];
        this.dataSource.data = [];
        this.totalBudget = 0;
        this.loading = false;
      }
    });
  }

  applyYearFilter(): void {
    const filtered = this.selectedYear ? this.allFormations.filter((item) => item.annee === this.selectedYear) : this.allFormations;
    this.dataSource.data = filtered;
    this.totalBudget = filtered.reduce((sum, item) => sum + item.budget, 0);
    this.dataSource.paginator?.firstPage();
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getFormateurName(formation: Formation): string {
    return `${formation.formateur?.nom ?? ''} ${formation.formateur?.prenom ?? ''}`.trim();
  }

  openDeleteDialog(formation: Formation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      disableClose: true
    });

    dialogRef.componentInstance.title = 'Supprimer la formation';
    dialogRef.componentInstance.message = `Voulez-vous vraiment supprimer la formation "${formation.titre}" ?`;
    dialogRef.componentInstance.confirmText = 'Supprimer';
    dialogRef.componentInstance.cancelText = 'Annuler';

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.formationService.deleteFormation(formation.id).subscribe({
          next: () => {
            this.snackBar.open('Formation supprimée', 'Fermer', { duration: 3000 });
            this.loadFormations();
          },
          error: () => this.loadFormations()
        });
      }
    });
  }

  openDetail(formation: Formation): void {
    this.router.navigate(['/formations', formation.id]);
  }

}
