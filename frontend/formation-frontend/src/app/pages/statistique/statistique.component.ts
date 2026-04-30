import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BehaviorSubject, catchError, combineLatest, forkJoin, Observable, of, startWith } from 'rxjs';
import { filter, map } from 'rxjs';

import { FormateurTypeItem, GlobalStats, StatBudgetItem, StatCountItem, StatistiqueService } from '../../core/services/statistique.service';
import { WhatIfSimulationInputs, WhatIfSimulationResult, WhatIfSimulationService } from '../../core/services/what-if-simulation.service';

interface GlobalYearData {
  formations?: number;
  participants?: number;
  formateurs?: number;
  budget?: number;
}

Chart.register(...registerables);
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-statistique',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSliderModule, MatProgressSpinnerModule, MatButtonModule, BaseChartDirective],
  templateUrl: './statistique.component.html',
  styleUrl: './statistique.component.css'
})
export class StatistiqueComponent implements OnInit {
  selectedSection: 'formations' | 'participants' | 'budget' | 'formateurs' | null = null;
  activeVoirToutPopup: 'formationsByFormateurList' | 'formateursTable' | null = null;
  loading = true;
  errorMessage = '';
  private pendingScrollTarget: 'formations' | 'participants' | 'budget' | 'formateurs' | null = null;
  private showGlobalView = true;

  totalFormations = 0;
  totalParticipants = 0;
  totalFormateurs = 0;
  totalBudget = 0;

  formationsGrowthPct = 0;
  participantsGrowthPct = 0;
  formateursGrowthPct = 0;
  budgetGrowthPct = 0;

  simulationForm: FormGroup;
  simulationResult$: Observable<WhatIfSimulationResult>;
  private simulationBaseline$ = new BehaviorSubject<GlobalStats>({
    totalFormations: 0,
    totalParticipants: 0,
    totalFormateurs: 0,
    totalStructures: 0,
    budgetTotal: 0
  });
  private simulationDefaultsApplied = false;

  selectedGlobalYear: string = '';
  availableGlobalYears: string[] = [];
  private globalDataByYear: Record<string, GlobalYearData> = {};

  // Raw data arrays for year comparisons
  private formationsByAnnee: StatCountItem[] = [];
  participantsByAnnee: StatCountItem[] = [];
  budgetByAnnee: StatBudgetItem[] = [];
  private formateursByAnnee: StatCountItem[] = [];
  participantsByDomaine: StatCountItem[] = [];
  participantsByDomaineTopWithAutres: StatCountItem[] = [];
  participantsByDomaineAutresDetails: StatCountItem[] = [];
  participantsByDomaineAutresTotal = 0;
  formationsByStructure: StatCountItem[] = [];
  formationsByFormateur: StatCountItem[] = [];
  budgetByDomaine: StatBudgetItem[] = [];
  budgetByFormation: StatBudgetItem[] = [];
  topFormations: StatCountItem[] = [];
  formationsByDomaineTopWithAutres: StatCountItem[] = [];
  formationsByDomaineAutresDetails: StatCountItem[] = [];
  formationsByDomaineAutresTotal = 0;
  mostActiveParticipants: StatCountItem[] = [];
  topFormateursByAnnee: Record<string, Array<{ formateur: string; count: number }>> = {};
  selectedYearForFormateurs: string = '';
  availableYearsForFormateurs: string[] = [];
  topFormationsInternes: StatCountItem[] = [];
  topFormationsExternes: StatCountItem[] = [];
  topFormateursInternes: StatCountItem[] = [];
  topFormateursExternes: StatCountItem[] = [];
  averageParticipantsPerFormation = 0;
  byStructureChartData: Array<{ label: string; count: number; percentage: number }> = [];

  formationsByYearData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Formations par année',
      fill: true,
      tension: 0.35,
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.18)',
      pointRadius: 5,
      pointHoverRadius: 6,
      pointBackgroundColor: '#4f46e5'
    }]
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
    plugins: { 
      legend: { display: false },
      // datalabels plugin will show values centered inside bars
      datalabels: {
        color: '#fff',
        anchor: 'center',
        align: 'center',
        font: { weight: '600', size: 12 },
        formatter: (value: any) => {
          if (value === null || value === undefined) return '';
          return typeof value === 'number' ? value.toString() : String(value);
        }
      }
    },
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
  } as any;

  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' }, datalabels: { display: false } }
  };

  pieCompactOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, datalabels: { display: false } }
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' }, datalabels: { display: false } }
  };

  doughnutCompactOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' }, datalabels: { display: false } }
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

  formationsByYearLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    elements: {
      line: {
        borderWidth: 4
      },
      point: {
        borderWidth: 2,
        borderColor: '#4f46e5'
      }
    },
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

  constructor(
    private readonly fb: FormBuilder,
    private readonly statistiqueService: StatistiqueService,
    private readonly whatIfSimulationService: WhatIfSimulationService,
    private readonly router: Router
  ) {
    this.simulationForm = this.fb.group({
      formations: [0],
      averageParticipantsPerFormation: [0],
      costPerFormation: [0],
      trainers: [0]
    });

    this.simulationResult$ = combineLatest([
      this.simulationForm.valueChanges.pipe(startWith(this.simulationForm.getRawValue())),
      this.simulationBaseline$.asObservable()
    ]).pipe(
      map(([formValue, baseline]) => this.whatIfSimulationService.simulate(baseline, {
        formations: Number(formValue.formations ?? 0),
        averageParticipantsPerFormation: Number(formValue.averageParticipantsPerFormation ?? 0),
        costPerFormation: Number(formValue.costPerFormation ?? 0),
        trainers: Number(formValue.trainers ?? 0)
      } as WhatIfSimulationInputs))
    );
  }

  ngOnInit(): void {
    this.syncSectionFromUrl(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.syncSectionFromUrl(event.urlAfterRedirects);
      });

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
      mostActiveParticipants: this.statistiqueService.getMostActiveParticipants(),
      topFormateursByAnnee: this.statistiqueService.getTopFormateursByAnnee(),
      topFormationsInternes: this.statistiqueService.getTopFormationsInternes(),
      topFormationsExternes: this.statistiqueService.getTopFormationsExternes(),
      topFormateursInternes: this.statistiqueService.getTopFormateursInternes(),
      topFormateursExternes: this.statistiqueService.getTopFormateursExternes()
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
        this.formationsByAnnee = result.byAnnee;
        this.formateursByAnnee = result.formateursByAnnee;
        this.participantsByDomaine = result.participantsByDomaine;
        this.formationsByStructure = result.formationsByStructure;
        this.formationsByFormateur = result.formationsByFormateur;
        this.budgetByDomaine = result.budgetByDomaine;
        this.budgetByFormation = result.budgetByFormation;
        this.averageParticipantsPerFormation = result.averageParticipantsPerFormation;
        this.mostActiveParticipants = result.mostActiveParticipants;
        this.topFormateursByAnnee = result.topFormateursByAnnee;
        this.availableYearsForFormateurs = Object.keys(result.topFormateursByAnnee).sort((a, b) => parseInt(b) - parseInt(a));
        this.selectedYearForFormateurs = '';
        this.topFormations = result.topFormations;
        this.topFormationsInternes = result.topFormationsInternes;
        this.topFormationsExternes = result.topFormationsExternes;
        this.topFormateursInternes = result.topFormateursInternes;
        this.topFormateursExternes = result.topFormateursExternes;

        this.setParticipantsByDomaineChart();
        this.scrollToSelectedSection();

        this.participantsByYearData = {
          labels: this.participantsByAnnee.map((item) => item.label),
          datasets: [{ data: this.participantsByAnnee.map((item) => item.count), label: 'Participants par annee', backgroundColor: '#34d399' }]
        };

        this.budgetByYearData = {
          labels: this.budgetByAnnee.map((item) => item.label),
          datasets: [{ data: this.budgetByAnnee.map((item) => item.budget), label: 'Budget par annee', backgroundColor: '#fb923c' }]
        };

        this.formationsGrowthPct = this.computeYearOverYearGrowth(result.byAnnee.map((item) => item.count));
        this.participantsGrowthPct = this.computeYearOverYearGrowth(result.participantsByAnnee.map((item) => item.count));
        this.budgetGrowthPct = this.computeYearOverYearGrowth(result.budgetByAnnee.map((item) => item.budget));
        this.formateursGrowthPct = this.computeYearOverYearGrowth(result.formateursByAnnee.map((item) => item.count));

        // Build data by year for global year selector
        this.buildGlobalDataByYear(result.byAnnee, result.participantsByAnnee, result.budgetByAnnee, result.formateursByAnnee);
        const yearsSet = new Set<string>();
        result.byAnnee.forEach(item => yearsSet.add(item.label));
        result.participantsByAnnee.forEach(item => yearsSet.add(item.label));
        result.budgetByAnnee.forEach(item => yearsSet.add(item.label));
        result.formateursByAnnee.forEach(item => yearsSet.add(item.label));
        this.availableGlobalYears = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));

        // Set selected year to current year and apply it
        const currentYear = new Date().getFullYear().toString();
        this.selectedGlobalYear = this.availableGlobalYears.includes(currentYear) ? currentYear : this.availableGlobalYears[0];
        this.onGlobalYearChange();
        this.applyWhatIfDefaultsOnce();

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
    const sortedDomaine = [...byDomaine].sort((a, b) => b.count - a.count);
    const top5Domaines = sortedDomaine.slice(0, 5);
    const autresDomaines = sortedDomaine.slice(5);
    const autresTotal = autresDomaines.reduce((sum, item) => sum + item.count, 0);

    this.formationsByDomaineAutresDetails = [...autresDomaines].sort((a, b) => a.count - b.count);
    this.formationsByDomaineAutresTotal = autresTotal;
    this.formationsByDomaineTopWithAutres =
      autresTotal > 0
        ? [...top5Domaines, { label: 'Autres', count: autresTotal }]
        : [...top5Domaines];

    this.formationsByYearData = {
      labels: byAnnee.map((item) => item.label),
      datasets: [{
        data: byAnnee.map((item) => item.count),
        label: 'Formations par année',
        fill: true,
        tension: 0.35,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.18)',
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4f46e5'
      }]
    };

    this.formationsByDomaineData = {
      labels: this.formationsByDomaineTopWithAutres.map((item) => item.label),
      datasets: [{ data: this.formationsByDomaineTopWithAutres.map((item) => item.count), backgroundColor: ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#06b6d4', '#94a3b8'] }]
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

  private setParticipantsByDomaineChart(): void {
    const sortedDomaine = [...this.participantsByDomaine].sort((a, b) => b.count - a.count);
    const top5Domaines = sortedDomaine.slice(0, 5);
    const autresDomaines = sortedDomaine.slice(5);
    const autresTotal = autresDomaines.reduce((sum, item) => sum + item.count, 0);

    this.participantsByDomaineAutresDetails = [...autresDomaines].sort((a, b) => a.count - b.count);

    this.participantsByDomaineTopWithAutres =
      autresTotal > 0
        ? [...top5Domaines, { label: 'Autres', count: autresTotal }]
        : [...top5Domaines];
    this.participantsByDomaineAutresTotal = autresTotal;

    this.participantsByDomaineDataChart = {
      labels: this.participantsByDomaineTopWithAutres.map((item) => item.label),
      datasets: [{ data: this.participantsByDomaineTopWithAutres.map((item) => item.count), backgroundColor: ['#4f46e5', '#34d399', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e6'] }]
    };
  }

  private buildGlobalDataByYear(
    byAnnee: StatCountItem[],
    participantsByAnnee: StatCountItem[],
    budgetByAnnee: StatBudgetItem[],
    formateursByAnnee: StatCountItem[]
  ): void {
    const dataMap: Record<string, GlobalYearData> = {};

    // Build map from formations by year
    byAnnee.forEach(item => {
      if (!dataMap[item.label]) dataMap[item.label] = {};
      dataMap[item.label].formations = item.count;
    });

    // Add participants by year
    participantsByAnnee.forEach(item => {
      if (!dataMap[item.label]) dataMap[item.label] = {};
      dataMap[item.label].participants = item.count;
    });

    // Add budget by year
    budgetByAnnee.forEach(item => {
      if (!dataMap[item.label]) dataMap[item.label] = {};
      dataMap[item.label].budget = item.budget;
    });

    // Add formateurs by year
    formateursByAnnee.forEach(item => {
      if (!dataMap[item.label]) dataMap[item.label] = {};
      dataMap[item.label].formateurs = item.count;
    });

    this.globalDataByYear = dataMap;
  }

  onGlobalYearChange(): void {
    // Always show data for specific selected year
    const yearData = this.globalDataByYear[this.selectedGlobalYear];
    if (yearData) {
      this.totalFormations = yearData.formations || 0;
      this.totalParticipants = yearData.participants || 0;
      this.totalFormateurs = yearData.formateurs || 0;
      this.totalBudget = yearData.budget || 0;
      
      // Calculate growth vs previous year (chronologically before)
      // Years are sorted descending, so previous year is at index + 1
      const yearIndex = this.availableGlobalYears.indexOf(this.selectedGlobalYear);
      if (yearIndex >= 0 && yearIndex < this.availableGlobalYears.length - 1) {
        const previousYear = this.availableGlobalYears[yearIndex + 1];
        const previousYearData = this.globalDataByYear[previousYear];
        
        if (previousYearData) {
          this.formationsGrowthPct = this.calculateGrowth(previousYearData.formations || 0, yearData.formations || 0);
          this.participantsGrowthPct = this.calculateGrowth(previousYearData.participants || 0, yearData.participants || 0);
          this.formateursGrowthPct = this.calculateGrowth(previousYearData.formateurs || 0, yearData.formateurs || 0);
          this.budgetGrowthPct = this.calculateGrowth(previousYearData.budget || 0, yearData.budget || 0);
        }
      } else {
        // No previous year - no growth to compare
        this.formationsGrowthPct = 0;
        this.participantsGrowthPct = 0;
        this.formateursGrowthPct = 0;
        this.budgetGrowthPct = 0;
      }
    }

    this.updateSimulationBaseline();
  }

  private updateSimulationBaseline(): void {
    this.simulationBaseline$.next({
      totalFormations: this.totalFormations,
      totalParticipants: this.totalParticipants,
      totalFormateurs: this.totalFormateurs,
      totalStructures: 0,
      budgetTotal: this.totalBudget
    });
  }

  private applyWhatIfDefaultsOnce(): void {
    if (this.simulationDefaultsApplied) {
      return;
    }

    const averageParticipantsPerFormation = this.totalFormations > 0 ? this.totalParticipants / this.totalFormations : 0;
    const costPerFormation = this.totalFormations > 0 ? this.totalBudget / this.totalFormations : 0;

    this.simulationForm.patchValue({
      formations: this.totalFormations,
      averageParticipantsPerFormation,
      costPerFormation,
      trainers: this.totalFormateurs
    });

    this.simulationDefaultsApplied = true;
  }

  private calculateGrowth(previousValue: number, currentValue: number): number {
    if (previousValue === 0) {
      return currentValue > 0 ? 100 : 0;
    }
    return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
  }

  private getTotalFormations(): number {
    return Object.values(this.globalDataByYear).reduce((sum, data) => sum + (data.formations ?? 0), 0);
  }

  private getTotalParticipants(): number {
    return Object.values(this.globalDataByYear).reduce((sum, data) => sum + (data.participants ?? 0), 0);
  }

  private getTotalFormateurs(): number {
    return Object.values(this.globalDataByYear).reduce((sum, data) => sum + (data.formateurs ?? 0), 0);
  }

  private getTotalBudget(): number {
    return Object.values(this.globalDataByYear).reduce((sum, data) => sum + (data.budget ?? 0), 0);
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

  formationDomainColorAt(index: number): string {
    const colors = this.formationsByDomaineData.datasets[0]?.backgroundColor;

    if (Array.isArray(colors) && colors.length > 0) {
      return String(colors[index % colors.length]);
    }

    return '#94a3b8';
  }

  participantsDomainColorAt(index: number): string {
    const colors = this.participantsByDomaineDataChart.datasets[0]?.backgroundColor;

    if (Array.isArray(colors) && colors.length > 0) {
      return String(colors[index % colors.length]);
    }

    return '#94a3b8';
  }

  formationDomainPercentageAt(index: number): number {
    const total = this.formationsByDomaineData.datasets[0]?.data.reduce((sum, value) => sum + Number(value), 0) || 0;
    const value = Number(this.formationsByDomaineData.datasets[0]?.data[index] || 0);
    return total ? Math.round((value / total) * 100) : 0;
  }

  getAutresItemPercentage(count: number): number {
    const total = this.formationsByDomaineData.datasets[0]?.data.reduce((sum, value) => sum + Number(value), 0) || 0;
    return total ? Math.round((count / total) * 100) : 0;
  }

  getAutresParticipantPercentage(count: number): number {
    const total = this.participantsByDomaineTopWithAutres.reduce((sum, item) => sum + item.count, 0);
    return total ? Math.round((count / total) * 100) : 0;
  }

  participantsDomainPercentageAt(index: number): number {
    const total = this.participantsByDomaineTopWithAutres.reduce((sum, item) => sum + item.count, 0);
    const value = this.participantsByDomaineTopWithAutres[index]?.count || 0;
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

  getSelectedYearFormateurs(): Array<{ formateur: string; count: number }> {
    if (!this.selectedYearForFormateurs) {
      const aggregated = new Map<string, number>();

      Object.values(this.topFormateursByAnnee).forEach((yearFormateurs) => {
        yearFormateurs.forEach((item) => {
          aggregated.set(item.formateur, (aggregated.get(item.formateur) ?? 0) + item.count);
        });
      });

      return Array.from(aggregated.entries())
        .map(([formateur, count]) => ({ formateur, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 10);
    }

    if (!this.topFormateursByAnnee[this.selectedYearForFormateurs]) {
      return [];
    }

    return this.topFormateursByAnnee[this.selectedYearForFormateurs];
  }

  getMaxFormateurCount(): number {
    const formateurs = this.getSelectedYearFormateurs();
    if (formateurs.length === 0) return 0;
    return Math.max(...formateurs.map(f => f.count));
  }

  get topFormateursInternMax(): number {
    if (this.topFormateursInternes.length === 0) return 0;
    return Math.max(...this.topFormateursInternes.map(f => f.count));
  }

  get topFormateursExternMax(): number {
    if (this.topFormateursExternes.length === 0) return 0;
    return Math.max(...this.topFormateursExternes.map(f => f.count));
  }

  selectSection(section: 'formations' | 'participants' | 'budget' | 'formateurs'): void {
    this.showGlobalView = false;
    this.selectedSection = this.selectedSection === section ? null : section;
    this.pendingScrollTarget = this.selectedSection;
    this.scrollToSelectedSection();
  }

  showSection(section: 'formations' | 'participants' | 'budget' | 'formateurs'): boolean {
    return !this.showGlobalView && this.selectedSection === section;
  }

  private normalizeSection(section: string | null): 'formations' | 'participants' | 'budget' | 'formateurs' | null {
    if (section === 'formations' || section === 'participants' || section === 'budget' || section === 'formateurs') {
      return section;
    }

    return null;
  }

  private syncSectionFromUrl(url: string): void {
    this.selectedSection = this.sectionFromUrl(url);
    this.pendingScrollTarget = this.selectedSection;
    this.showGlobalView = this.selectedSection === null;

    if (!this.loading) {
      this.scrollToSelectedSection();
    }
  }

  private sectionFromUrl(url: string): 'formations' | 'participants' | 'budget' | 'formateurs' | null {
    if (url.includes('/statistiques/formations')) {
      return 'formations';
    }

    if (url.includes('/statistiques/participants')) {
      return 'participants';
    }

    if (url.includes('/statistiques/budget')) {
      return 'budget';
    }

    if (url.includes('/statistiques/formateurs')) {
      return 'formateurs';
    }

    return null;
  }

  private scrollToSelectedSection(): void {
    if (this.loading) {
      return;
    }

    window.setTimeout(() => {
      if (this.pendingScrollTarget) {
        document.getElementById(this.pendingScrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (this.showGlobalView) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  }

  openVoirToutPopup(target: 'formationsByFormateurList' | 'formateursTable'): void {
    this.activeVoirToutPopup = target;
  }

  closeVoirToutPopup(): void {
    this.activeVoirToutPopup = null;
  }
}
