import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';

import { StatCountItem, StatistiqueService } from '../../core/services/statistique.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistique',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, BaseChartDirective],
  templateUrl: './statistique.component.html',
  styleUrl: './statistique.component.css'
})
export class StatistiqueComponent implements OnInit {
  loading = true;

  totalFormations = 0;
  totalParticipants = 0;
  totalBudget = 0;
  formationsThisYear = 0;

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Formations' }]
  };

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [], label: 'Formations', fill: false, tension: 0.35 }]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  private currentYear = new Date().getFullYear();

  constructor(private readonly statistiqueService: StatistiqueService) {}

  ngOnInit(): void {
    forkJoin({
      byDomaine: this.statistiqueService.getFormationsByDomaine(),
      byStructure: this.statistiqueService.getParticipantsByStructure(),
      byAnnee: this.statistiqueService.getFormationsByAnnee(),
      budgetTotal: this.statistiqueService.getBudgetTotal()
    }).subscribe({
      next: (result) => {
        this.setChartsAndCards(result.byDomaine, result.byStructure, result.byAnnee, result.budgetTotal);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private setChartsAndCards(
    byDomaine: StatCountItem[],
    byStructure: StatCountItem[],
    byAnnee: StatCountItem[],
    budgetTotal: number
  ): void {
    this.barChartData = {
      labels: byDomaine.map((item) => item.label),
      datasets: [{ data: byDomaine.map((item) => item.count), label: 'Formations par domaine' }]
    };

    this.pieChartData = {
      labels: byStructure.map((item) => item.label),
      datasets: [{ data: byStructure.map((item) => item.count) }]
    };

    this.lineChartData = {
      labels: byAnnee.map((item) => item.label),
      datasets: [{ data: byAnnee.map((item) => item.count), label: 'Formations par année', fill: false, tension: 0.35 }]
    };

    this.totalFormations = byAnnee.reduce((sum, item) => sum + item.count, 0);
    this.totalParticipants = byStructure.reduce((sum, item) => sum + item.count, 0);
    this.totalBudget = budgetTotal;
    this.formationsThisYear = byAnnee.find((item) => Number(item.label) === this.currentYear)?.count ?? 0;
  }

}
