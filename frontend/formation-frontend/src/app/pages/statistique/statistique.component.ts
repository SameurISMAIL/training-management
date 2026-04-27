import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { catchError, forkJoin, of } from 'rxjs';

import { FormateurTypeItem, StatBudgetItem, StatCountItem, StatistiqueService } from '../../core/services/statistique.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistique',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, BaseChartDirective],
  templateUrl: './statistique.component.html',
  styleUrl: './statistique.component.css'
})
export class StatistiqueComponent implements OnInit {
  selectedSection: 'formations' | 'participants' | 'budget' | 'formateurs' | null = null;
  activeVoirToutPopup: 'formationsByFormateurList' | 'formateursTable' | null = null;
  loading = true;
  errorMessage = '';

  totalFormations = 0;
  totalParticipants = 0;
  totalFormateurs = 0;
  totalBudget = 0;

  formationsGrowthPct = 0;
  participantsGrowthPct = 0;
  formateursGrowthPct = 0;
  budgetGrowthPct = 0;

  participantsByAnnee: StatCountItem[] = [];
  budgetByAnnee: StatBudgetItem[] = [];
  participantsByDomaine: StatCountItem[] = [];
  formationsByStructure: StatCountItem[] = [];
  formationsByFormateur: StatCountItem[] = [];
  budgetByDomaine: StatBudgetItem[] = [];
  budgetByFormation: StatBudgetItem[] = [];
  topFormations: StatCountItem[] = [];
  mostActiveParticipants: StatCountItem[] = [];
  averageParticipantsPerFormation = 0;
  byStructureChartData: Array<{ label: string; count: number; percentage: number }> = [];

  formationsByYearData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Formations par année', backgroundColor: '#4f46e5' }]
  };

  formationsByDomaineData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'] }]
  };

  participantsByStructureData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Participants par structure', backgroundColor: '#06b6d4' }]
  };

  participantsByYearData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Participants par annee', backgroundColor: '#34d399' }]
  };

  budgetByYearData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Budget par annee', backgroundColor: '#fb923c' }]
  };

  participantsByDomaineDataChart: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#4f46e5', '#34d399', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9', '#14b8a6'] }]
  };

  formateursTypeData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#10b981', '#f97316', '#64748b'] }]
  };

  monthlyEvolutionData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [], label: 'Formations mensuelles', fill: true, tension: 0.35, borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.18)' }]
  };

  commonBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  barCompactOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.18)' }
      }
    }
  };

  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  pieCompactOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  doughnutCompactOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  lineOptions: ChartOptions<'line'> = {
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

  lineCompactOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.18)' }
      }
    }
  };

  constructor(private readonly statistiqueService: StatistiqueService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      global: this.statistiqueService.getGlobalStats(),
      byDomaine: this.statistiqueService.getFormationsByDomaine(),
      byStructure: this.statistiqueService.getParticipantsByStructure(),
      byAnnee: this.statistiqueService.getFormationsByAnnee(),
      byMois: this.statistiqueService.getFormationsByMois(),
      formateursRepartition: this.statistiqueService.getFormateursRepartition(),
      formateursByAnnee: this.statistiqueService.getFormateursByAnnee().pipe(catchError(() => of([] as StatCountItem[]))),
      participantsByAnnee: this.statistiqueService.getParticipantsByAnnee(),
      budgetByAnnee: this.statistiqueService.getBudgetByAnnee(),
      participantsByDomaine: this.statistiqueService.getParticipantsByDomaine(),
      formationsByStructure: this.statistiqueService.getFormationsByStructure(),
      formationsByFormateur: this.statistiqueService.getFormationsByFormateur(),
      budgetByDomaine: this.statistiqueService.getBudgetByDomaine(),
      budgetByFormation: this.statistiqueService.getBudgetByFormation(),
      topFormations: this.statistiqueService.getTopFormations(),
      averageParticipantsPerFormation: this.statistiqueService.getAverageParticipantsPerFormation(),
      mostActiveParticipants: this.statistiqueService.getMostActiveParticipants()
    }).subscribe({
      next: (result) => {
        this.setChartsAndCards(
          result.global.totalFormations,
          result.global.totalParticipants,
          result.global.totalFormateurs,
          result.global.budgetTotal,
          result.byDomaine,
          result.byStructure,
          result.byAnnee,
          result.byMois,
          result.formateursRepartition
        );

        this.participantsByAnnee = result.participantsByAnnee;
        this.budgetByAnnee = result.budgetByAnnee;
        this.participantsByDomaine = result.participantsByDomaine;
        this.formationsByStructure = result.formationsByStructure;
        this.formationsByFormateur = result.formationsByFormateur;
        this.budgetByDomaine = result.budgetByDomaine;
        this.budgetByFormation = result.budgetByFormation;
        this.topFormations = result.topFormations;
        this.averageParticipantsPerFormation = result.averageParticipantsPerFormation;
        this.mostActiveParticipants = result.mostActiveParticipants;

        this.participantsByYearData = {
          labels: this.participantsByAnnee.map((item) => item.label),
          datasets: [{ data: this.participantsByAnnee.map((item) => item.count), label: 'Participants par annee', backgroundColor: '#34d399' }]
        };

        this.budgetByYearData = {
          labels: this.budgetByAnnee.map((item) => item.label),
          datasets: [{ data: this.budgetByAnnee.map((item) => item.budget), label: 'Budget par annee', backgroundColor: '#fb923c' }]
        };

        this.participantsByDomaineDataChart = {
          labels: this.participantsByDomaine.map((item) => item.label),
          datasets: [{ data: this.participantsByDomaine.map((item) => item.count), backgroundColor: ['#4f46e5', '#34d399', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9', '#14b8a6'] }]
        };

        this.formationsGrowthPct = this.computeYearOverYearGrowth(result.byAnnee.map((item) => item.count));
        this.participantsGrowthPct = this.computeYearOverYearGrowth(result.participantsByAnnee.map((item) => item.count));
        this.budgetGrowthPct = this.computeYearOverYearGrowth(result.budgetByAnnee.map((item) => item.budget));
        this.formateursGrowthPct = this.computeYearOverYearGrowth(result.formateursByAnnee.map((item) => item.count));

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les statistiques. Veuillez reessayer.';
        this.loading = false;
      }
    });
  }

  private setChartsAndCards(
    totalFormations: number,
    totalParticipants: number,
    totalFormateurs: number,
    totalBudget: number,
    byDomaine: StatCountItem[],
    byStructure: StatCountItem[],
    byAnnee: StatCountItem[],
    byMois: StatCountItem[],
    formateursRepartition: FormateurTypeItem[]
  ): void {
    this.formationsByYearData = {
      labels: byAnnee.map((item) => item.label),
      datasets: [{ data: byAnnee.map((item) => item.count), label: 'Formations par année', backgroundColor: '#4f46e5' }]
    };

    this.formationsByDomaineData = {
      labels: byDomaine.map((item) => item.label),
      datasets: [{ data: byDomaine.map((item) => item.count), backgroundColor: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'] }]
    };

    this.participantsByStructureData = {
      labels: byStructure.map((item) => item.label),
      datasets: [{ data: byStructure.map((item) => item.count), label: 'Participants par structure', backgroundColor: '#06b6d4' }]
    };

    const maxStructureCount = byStructure.reduce((max, item) => Math.max(max, item.count), 0);
    this.byStructureChartData = byStructure.map((item) => ({
      label: item.label,
      count: item.count,
      percentage: maxStructureCount ? (item.count / maxStructureCount) * 100 : 0
    }));

    this.formateursTypeData = {
      labels: formateursRepartition.map((item) => this.formatTypeLabel(item.type)),
      datasets: [{ data: formateursRepartition.map((item) => item.count), backgroundColor: ['#10b981', '#f97316', '#64748b'] }]
    };

    this.monthlyEvolutionData = {
      labels: byMois.map((item) => item.label),
      datasets: [{ data: byMois.map((item) => item.count), label: 'Formations mensuelles', fill: true, tension: 0.35, borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.18)' }]
    };

    this.totalFormations = totalFormations;
    this.totalParticipants = totalParticipants;
    this.totalFormateurs = totalFormateurs;
    this.totalBudget = totalBudget;
  }

  private formatTypeLabel(type: string): string {
    const normalized = type.toLowerCase();
    if (normalized === 'interne') {
      return 'Interne';
    }

    if (normalized === 'externe') {
      return 'Externe';
    }

    return 'Autre';
  }

  get budgetByDomaineMax(): number {
    return this.budgetByDomaine.reduce((max, item) => Math.max(max, item.budget), 0);
  }

  get budgetByFormationMax(): number {
    return this.budgetByFormation.reduce((max, item) => Math.max(max, item.budget), 0);
  }

  domaineColorAt(index: number): string {
    const palette = ['#4f46e5', '#34d399', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9', '#14b8a6'];
    return palette[index % palette.length];
  }

  formationDomainPercentageAt(index: number): number {
    const total = this.formationsByDomaineData.datasets[0]?.data.reduce((sum, value) => sum + Number(value), 0) || 0;
    const value = Number(this.formationsByDomaineData.datasets[0]?.data[index] || 0);
    return total ? Math.round((value / total) * 100) : 0;
  }

  participantsDomainPercentageAt(index: number): number {
    const total = this.participantsByDomaine.reduce((sum, item) => sum + item.count, 0);
    const value = this.participantsByDomaine[index]?.count || 0;
    return total ? Math.round((value / total) * 100) : 0;
  }

  growthClass(value: number): 'positive' | 'negative' | 'neutral' {
    if (value > 0) {
      return 'positive';
    }

    if (value < 0) {
      return 'negative';
    }

    return 'neutral';
  }

  growthIcon(value: number): 'arrow_upward' | 'arrow_downward' | 'trending_flat' {
    if (value > 0) {
      return 'arrow_upward';
    }

    if (value < 0) {
      return 'arrow_downward';
    }

    return 'trending_flat';
  }

  growthAbs(value: number): number {
    return Math.abs(value);
  }

  private computeYearOverYearGrowth(values: number[]): number {
    if (values.length < 2) {
      return 0;
    }

    const previous = Number(values[values.length - 2] ?? 0);
    const current = Number(values[values.length - 1] ?? 0);

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  selectSection(section: 'formations' | 'participants' | 'budget' | 'formateurs'): void {
    this.selectedSection = this.selectedSection === section ? null : section;
  }

  openVoirToutPopup(target: 'formationsByFormateurList' | 'formateursTable'): void {
    this.activeVoirToutPopup = target;
  }

  closeVoirToutPopup(): void {
    this.activeVoirToutPopup = null;
  }
}
