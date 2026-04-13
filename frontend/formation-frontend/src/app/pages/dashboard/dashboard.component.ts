import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { StatistiqueService, StatCountItem } from '../../core/services/statistique.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatListModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  login = '';
  role = '';
  totalFormations = 0;
  totalParticipants = 0;
  totalDomaines = 0;
  totalBudget = 0;
  formationsThisYear = 0;
  loading = true;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly statistiqueService: StatistiqueService
  ) {}

  ngOnInit(): void {
    this.login = this.authService.getLogin();
    this.role = this.authService.getDisplayRole();

    if (this.authService.isResponsable()) {
      this.loading = false;
      this.router.navigate(['/statistiques']);
      return;
    }

    if (!this.authService.isAdmin() && !this.authService.isSimpleUser()) {
      this.loading = false;
      this.router.navigate(['/unauthorized']);
      return;
    }

    forkJoin({
      byDomaine: this.statistiqueService.getFormationsByDomaine(),
      byStructure: this.statistiqueService.getParticipantsByStructure(),
      byAnnee: this.statistiqueService.getFormationsByAnnee(),
      budgetTotal: this.statistiqueService.getBudgetTotal()
    }).subscribe({
      next: (result) => {
        this.totalDomaines = result.byDomaine.length;
        this.totalFormations = result.byAnnee.reduce((sum, item: StatCountItem) => sum + item.count, 0);
        this.totalParticipants = result.byStructure.reduce((sum, item: StatCountItem) => sum + item.count, 0);
        this.totalBudget = result.budgetTotal;
        this.formationsThisYear = result.byAnnee.find((item) => Number(item.label) === new Date().getFullYear())?.count ?? 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
