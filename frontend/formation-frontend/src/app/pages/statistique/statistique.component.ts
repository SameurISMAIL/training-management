import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

  selectedGlobalYears: string[] = [];
  availableGlobalYears: string[] = [];
  isGlobalYearListOpen = false;
  private globalDataByYear: Record<string, GlobalYearData> = {};

  // Raw formations by domaine array (used to build pie and "Autres" lists)
  formationsByDomaine: StatCountItem[] = [];

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
  // Slider maximums (adjusted based on selected years)
  formationsSliderMax = 200;
  costSliderMax = 20000;
  trainersSliderMax = 100;

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
      datalabels: {
        color: '#fff',
        anchor: 'center',
        align: 'center',
        font: { weight: 600, size: 12 },
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
  };

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

  // Editable percentage tracking
  editingPercentage: string | null = null;
  editingPercentageValue: number = 0;

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

  get selectedGlobalYear(): string {
    return this.getSelectedYears()[0] ?? '';
  }

  get selectedGlobalYearsLabel(): string {
    const selectedYears = this.getSelectedYears();

    if (selectedYears.length === 0) {
      return 'Toutes les années';
    }

    if (selectedYears.length === this.availableGlobalYears.length) {
      return 'Toutes les années';
    }

    if (selectedYears.length === 1) {
      return selectedYears[0];
    }

    return selectedYears.join(', ');
  }

  isGlobalYearSelected(year: string): boolean {
    return this.getSelectedYears().includes(year);
  }

  isAllGlobalYearsSelected(): boolean {
    return this.availableGlobalYears.length > 0 && this.getSelectedYears().length === this.availableGlobalYears.length;
  }

  toggleGlobalYearList(): void {
    this.isGlobalYearListOpen = !this.isGlobalYearListOpen;
  }

  closeGlobalYearList(): void {
    this.isGlobalYearListOpen = false;
  }

  toggleGlobalYearSelection(year: string): void {
    const currentSelection = new Set(this.getSelectedYears());

    if (currentSelection.has(year)) {
      currentSelection.delete(year);
    } else {
      currentSelection.add(year);
    }

    this.selectedGlobalYears = Array.from(currentSelection);
    this.onGlobalYearsChange();
  }

  toggleAllGlobalYears(): void {
    this.selectedGlobalYears = this.isAllGlobalYearsSelected() ? [] : [...this.availableGlobalYears];
    this.onGlobalYearsChange();
  }

  private getSelectedYears(): string[] {
    if (this.selectedGlobalYears.length > 0) {
      return [...this.selectedGlobalYears].sort((left, right) => parseInt(right, 10) - parseInt(left, 10));
    }

    return [...this.availableGlobalYears];
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

        // Default to all available years and apply the aggregated filter
        this.selectedGlobalYears = [...this.availableGlobalYears];
        this.onGlobalYearsChange();
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
    this.onGlobalYearsChange();
  }

  onGlobalYearsChange(): void {
    const selectedYears = this.getSelectedYears();

    if (selectedYears.length === 0) {
      this.selectedGlobalYears = [...this.availableGlobalYears];
      return this.onGlobalYearsChange();
    
        // Cancel any ongoing percentage edit when filter changes
        if (this.editingPercentage !== null) {
          this.cancelPercentageEdit();
        }
    }

    const aggregated = selectedYears.reduce(
      (accumulator: { formations: number; participants: number; formateurs: number; budget: number }, year: string) => {
        const yearData = this.globalDataByYear[year];
        if (!yearData) {
          return accumulator;
        }

        accumulator.formations += yearData.formations || 0;
        accumulator.participants += yearData.participants || 0;
        accumulator.formateurs += yearData.formateurs || 0;
        accumulator.budget += yearData.budget || 0;
        return accumulator;
      },
      { formations: 0, participants: 0, formateurs: 0, budget: 0 }
    );

    this.totalFormations = aggregated.formations;
    this.totalParticipants = aggregated.participants;
    this.totalFormateurs = aggregated.formateurs;
    this.totalBudget = aggregated.budget;

    const primaryYear = selectedYears[0];
    const yearIndex = this.availableGlobalYears.indexOf(primaryYear);
    if (yearIndex >= 0 && yearIndex < this.availableGlobalYears.length - 1) {
      const previousYear = this.availableGlobalYears[yearIndex + 1];
      const currentYearData = this.globalDataByYear[primaryYear];
      const previousYearData = this.globalDataByYear[previousYear];

      if (currentYearData && previousYearData) {
        this.formationsGrowthPct = this.calculateGrowth(previousYearData.formations || 0, currentYearData.formations || 0);
        this.participantsGrowthPct = this.calculateGrowth(previousYearData.participants || 0, currentYearData.participants || 0);
        this.formateursGrowthPct = this.calculateGrowth(previousYearData.formateurs || 0, currentYearData.formateurs || 0);
        this.budgetGrowthPct = this.calculateGrowth(previousYearData.budget || 0, currentYearData.budget || 0);
      }
    } else {
      this.formationsGrowthPct = 0;
      this.participantsGrowthPct = 0;
      this.formateursGrowthPct = 0;
      this.budgetGrowthPct = 0;
    }

    this.formationsByYearData = {
      labels: selectedYears,
      datasets: [{
      data: selectedYears.map((year: string) => this.formationsByAnnee.find((item) => item.label === year)?.count ?? 0),
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

    this.participantsByYearData = {
      labels: selectedYears,
      datasets: [{ data: selectedYears.map((year: string) => this.participantsByAnnee.find((item) => item.label === year)?.count ?? 0), label: 'Participants par annee', backgroundColor: '#34d399' }]
    };

    this.budgetByYearData = {
      labels: selectedYears,
      datasets: [{ data: selectedYears.map((year: string) => this.budgetByAnnee.find((item) => item.label === year)?.budget ?? 0), label: 'Budget par annee', backgroundColor: '#fb923c' }]
    };

    this.updateSimulationBaseline();
    this.refreshYearScopedData(selectedYears);
  }

  /**
   * Refresh year-scoped data for the domain / formation / formateur / budget sections.
   * Calls the service with the selected year and updates the relevant charts/lists.
   */
  private refreshYearScopedData(years: string[]): void {
    const selectedYears = years.length > 0 ? years : [...this.availableGlobalYears];
    if (selectedYears.length === 0) {
      return;
    }

    forkJoin(
      selectedYears.map((year: string) =>
        forkJoin({
          formationsByDomaine: this.statistiqueService.getFormationsByDomaine(year).pipe(catchError(() => of([] as StatCountItem[]))),
          participantsByDomaine: this.statistiqueService.getParticipantsByDomaine(year).pipe(catchError(() => of([] as StatCountItem[]))),
          formationsByStructure: this.statistiqueService.getFormationsByStructure(year).pipe(catchError(() => of([] as StatCountItem[]))),
          formationsByFormateur: this.statistiqueService.getFormationsByFormateur(year).pipe(catchError(() => of([] as StatCountItem[]))),
          budgetByDomaine: this.statistiqueService.getBudgetByDomaine(year).pipe(catchError(() => of([] as StatBudgetItem[]))),
          budgetByFormation: this.statistiqueService.getBudgetByFormation(year).pipe(catchError(() => of([] as StatBudgetItem[]))),
          participantsByStructure: this.statistiqueService.getParticipantsByStructure(year).pipe(catchError(() => of([] as StatCountItem[]))),
          topFormations: this.statistiqueService.getTopFormations(year).pipe(catchError(() => of([] as StatCountItem[]))),
          averageParticipantsPerFormation: this.statistiqueService.getAverageParticipantsPerFormation(year).pipe(catchError(() => of(0))),
          mostActiveParticipants: this.statistiqueService.getMostActiveParticipants(year).pipe(catchError(() => of([] as StatCountItem[]))),
          formateursRepartition: this.statistiqueService.getFormateursRepartition(year).pipe(catchError(() => of([] as FormateurTypeItem[]))),
          topFormationsInternes: this.statistiqueService.getTopFormationsInternes(year).pipe(catchError(() => of([] as StatCountItem[]))),
          topFormationsExternes: this.statistiqueService.getTopFormationsExternes(year).pipe(catchError(() => of([] as StatCountItem[]))),
          topFormateursInternes: this.statistiqueService.getTopFormateursInternes(year).pipe(catchError(() => of([] as StatCountItem[]))),
          topFormateursExternes: this.statistiqueService.getTopFormateursExternes(year).pipe(catchError(() => of([] as StatCountItem[])))
        }).pipe(map((result) => ({ year, ...result })))
      )
    ).subscribe({
      next: (results) => {
        const formationsByDomaine = this.mergeCountItems(results.map((result) => result.formationsByDomaine));
        const participantsByDomaine = this.mergeCountItems(results.map((result) => result.participantsByDomaine));
        const formationsByStructure = this.mergeCountItems(results.map((result) => result.formationsByStructure));
        const formationsByFormateur = this.mergeCountItems(results.map((result) => result.formationsByFormateur));
        const budgetByDomaine = this.mergeBudgetItems(results.map((result) => result.budgetByDomaine));
        const budgetByFormation = this.mergeBudgetItems(results.map((result) => result.budgetByFormation));
        const participantsByStructure = this.mergeCountItems(results.map((result) => result.participantsByStructure));
        const topFormations = this.mergeCountItems(results.map((result) => result.topFormations));
        const mostActiveParticipants = this.mergeCountItems(results.map((result) => result.mostActiveParticipants));
        const topFormationsInternes = this.mergeCountItems(results.map((result) => result.topFormationsInternes));
        const topFormationsExternes = this.mergeCountItems(results.map((result) => result.topFormationsExternes));
        const topFormateursInternes = this.mergeCountItems(results.map((result) => result.topFormateursInternes));
        const topFormateursExternes = this.mergeCountItems(results.map((result) => result.topFormateursExternes));
        const formateursRepartition = this.mergeCountItems(results.map((result) =>
          result.formateursRepartition.map((item) => ({ label: this.formatTypeLabel(item.type), count: item.count }))
        ));

        this.participantsByDomaine = participantsByDomaine;
        this.formationsByDomaine = formationsByDomaine;
        this.formationsByStructure = formationsByStructure;
        this.formationsByFormateur = formationsByFormateur;
        this.budgetByDomaine = budgetByDomaine;
        this.budgetByFormation = budgetByFormation;
        this.topFormations = topFormations;
        this.mostActiveParticipants = mostActiveParticipants;
        this.topFormationsInternes = topFormationsInternes;
        this.topFormationsExternes = topFormationsExternes;
        this.topFormateursInternes = topFormateursInternes;
        this.topFormateursExternes = topFormateursExternes;
        this.averageParticipantsPerFormation = this.totalFormations > 0 ? Number((this.totalParticipants / this.totalFormations).toFixed(2)) : 0;

        this.formateursTypeData = {
          labels: formateursRepartition.map((item) => item.label),
          datasets: [{ data: formateursRepartition.map((item) => item.count), backgroundColor: ['#10b981', '#f97316', '#64748b'] }]
        };

        this.participantsByStructureData = {
          labels: participantsByStructure.map((item) => item.label),
          datasets: [{ data: participantsByStructure.map((item) => item.count), label: 'Participants par structure', backgroundColor: '#06b6d4' }]
        };

        const maxStructureCount = participantsByStructure.reduce((max, item) => Math.max(max, item.count), 0);
        this.byStructureChartData = participantsByStructure.map((item) => ({
          label: item.label,
          count: item.count,
          percentage: maxStructureCount ? (item.count / maxStructureCount) * 100 : 0
        }));

        this.updateFormationsByDomaineChart();
        this.setParticipantsByDomaineChart();

        this.formationsByYearData = {
          labels: selectedYears,
          datasets: [{
            data: selectedYears.map((year) => this.formationsByAnnee.find((item) => item.label === year)?.count ?? 0),
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

        this.participantsByYearData = {
          labels: selectedYears,
          datasets: [{ data: selectedYears.map((year) => this.participantsByAnnee.find((item) => item.label === year)?.count ?? 0), label: 'Participants par annee', backgroundColor: '#34d399' }]
        };

        this.budgetByYearData = {
          labels: selectedYears,
          datasets: [{ data: selectedYears.map((year) => this.budgetByAnnee.find((item) => item.label === year)?.budget ?? 0), label: 'Budget par annee', backgroundColor: '#fb923c' }]
        };
      },
      error: () => {
        // keep existing charts if the refresh fails
      }
    });
  }

  private mergeCountItems(collections: StatCountItem[][]): StatCountItem[] {
    const aggregated = new Map<string, number>();

    collections.forEach((items) => {
      items.forEach((item) => {
        aggregated.set(item.label, (aggregated.get(item.label) ?? 0) + item.count);
      });
    });

    return Array.from(aggregated.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count);
  }

  private mergeBudgetItems(collections: StatBudgetItem[][]): StatBudgetItem[] {
    const aggregated = new Map<string, number>();

    collections.forEach((items) => {
      items.forEach((item) => {
        aggregated.set(item.label, (aggregated.get(item.label) ?? 0) + item.budget);
      });
    });

    return Array.from(aggregated.entries())
      .map(([label, budget]) => ({ label, budget }))
      .sort((left, right) => right.budget - left.budget);
  }

  private mergeTopFormateurs(collections: Record<string, Array<{ formateur: string; count: number }>>[]): Record<string, Array<{ formateur: string; count: number }>> {
    const aggregatedByYear: Record<string, Map<string, number>> = {};

    collections.forEach((collection) => {
      Object.entries(collection).forEach(([year, items]) => {
        if (!aggregatedByYear[year]) {
          aggregatedByYear[year] = new Map<string, number>();
        }

        items.forEach((item) => {
          aggregatedByYear[year].set(item.formateur, (aggregatedByYear[year].get(item.formateur) ?? 0) + item.count);
        });
      });
    });

    return Object.fromEntries(
      Object.entries(aggregatedByYear).map(([year, formateurs]) => [
        year,
        Array.from(formateurs.entries())
          .map(([formateur, count]) => ({ formateur, count }))
          .sort((left, right) => right.count - left.count)
          .slice(0, 10)
      ])
    );
  }

  private updateFormationsByDomaineChart(): void {
    const sortedDomaine = [...this.formationsByDomaine].sort((a, b) => b.count - a.count);
    const top5Domaines = sortedDomaine.slice(0, 5);
    const autresDomaines = sortedDomaine.slice(5);
    const autresTotal = autresDomaines.reduce((sum, item) => sum + item.count, 0);

    this.formationsByDomaineAutresDetails = [...autresDomaines].sort((a, b) => a.count - b.count);
    this.formationsByDomaineAutresTotal = autresTotal;
    this.formationsByDomaineTopWithAutres = autresTotal > 0 ? [...top5Domaines, { label: 'Autres', count: autresTotal }] : [...top5Domaines];

    this.formationsByDomaineData = {
      labels: this.formationsByDomaineTopWithAutres.map((item) => item.label),
      datasets: [{ data: this.formationsByDomaineTopWithAutres.map((item) => item.count), backgroundColor: ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#06b6d4', '#94a3b8'] }]
    };
  }

  private updateSimulationBaseline(): void {
    this.simulationBaseline$.next({
      totalFormations: this.totalFormations,
      totalParticipants: this.totalParticipants,
      totalFormateurs: this.totalFormateurs,
      totalStructures: 0,
      budgetTotal: this.totalBudget
    });
    // Reset simulation form controls to their default values when filter changes
    this.resetSimulationForm();
  }

  private resetSimulationForm(): void {
    console.log('Resetting simulation form controls to default values');
    
    const averageParticipantsPerFormation = this.totalFormations > 0 ? this.totalParticipants / this.totalFormations : 0;
    const costPerFormation = this.totalFormations > 0 ? this.totalBudget / this.totalFormations : 0;

    // Set form controls to baseline absolute values (not percentages)
    this.simulationForm.reset({
      formations: this.totalFormations,
      averageParticipantsPerFormation: averageParticipantsPerFormation,
      costPerFormation: costPerFormation,
      trainers: this.totalFormateurs
    });

    // Adjust slider maximums so UI can represent values comfortably
    this.formationsSliderMax = Math.max(200, Math.ceil(this.totalFormations * 2));
    this.costSliderMax = Math.max(20000, Math.ceil(costPerFormation * 2));
    this.trainersSliderMax = Math.max(100, Math.ceil(this.totalFormateurs * 2));

    console.log('Simulation form reset with values:', {
      formations: this.totalFormations,
      averageParticipantsPerFormation: averageParticipantsPerFormation,
      costPerFormation: costPerFormation,
      trainers: this.totalFormateurs
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
    const selectedYears = this.getSelectedYears();
    const aggregated = new Map<string, number>();

    selectedYears.forEach((year) => {
      const yearFormateurs = this.topFormateursByAnnee[year] ?? [];
      yearFormateurs.forEach((item) => {
        aggregated.set(item.formateur, (aggregated.get(item.formateur) ?? 0) + item.count);
      });
    });

    return Array.from(aggregated.entries())
      .map(([formateur, count]) => ({ formateur, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 10);
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

  // Percentage editing methods
  togglePercentageEdit(metric: string, currentValue: number): void {
    console.log(`Toggle percentage edit for ${metric}, current value: ${currentValue}, currently editing: ${this.editingPercentage}`);
    
    // Si on est déjà en train d'éditer ce métric, on ferme l'édition
    if (this.editingPercentage === metric) {
      console.log(`Already editing ${metric}, cancelling...`);
      this.cancelPercentageEdit();
      return;
    }
    
    // Si on est en train d'éditer un autre métric, on le sauvegarde d'abord
    if (this.editingPercentage !== null) {
      console.log(`Was editing ${this.editingPercentage}, saving first...`);
      this.savePercentageEdit(this.editingPercentage);
    }
    
    // Maintenant on commence à éditer ce métric
    this.editingPercentage = metric;
    this.editingPercentageValue = currentValue;
    console.log(`Starting edit for ${metric}, value: ${this.editingPercentageValue}`);
    
    // Force focus après le rendu Angular
    setTimeout(() => {
      const input = document.querySelector(`input.percent-input[data-metric="${metric}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
        console.log(`Input focused and selected for ${metric}`);
      }
    }, 0);
  }

  savePercentageEdit(metric: string): void {
    if (this.editingPercentage !== metric) {
      console.log(`Not editing ${metric}, skipping save`);
      return;
    }

    const value = this.editingPercentageValue;
    console.log(`Saving percentage edit for ${metric}: ${value}`);
    
    // Map user-edited percentage (deltaPercent) into absolute form control values
    const pct = Number(value) || 0;
    switch (metric) {
      case 'formations': {
        const target = Math.round(this.totalFormations * (1 + pct / 100));
        const control = this.simulationForm.get('formations');
        console.log('Before setValue formations:', control?.value);
        control?.setValue(Math.max(0, target));
        console.log('After setValue formations:', control?.value);
        break;
      }
      case 'participants': {
        // user edits participants delta% -> update averageParticipantsPerFormation accordingly
        const simulatedParticipants = Math.round(this.totalParticipants * (1 + pct / 100));
        const avg = this.totalFormations > 0 ? Math.round(simulatedParticipants / this.totalFormations) : 0;
        const control = this.simulationForm.get('averageParticipantsPerFormation');
        console.log('Before setValue participants(avg):', control?.value);
        control?.setValue(Math.max(0, avg));
        console.log('After setValue participants(avg):', control?.value);
        break;
      }
      case 'budget': {
        // user edits budget delta% -> update costPerFormation accordingly
        const simulatedBudget = Math.round(this.totalBudget * (1 + pct / 100));
        const costPerFormation = this.totalFormations > 0 ? Math.round(simulatedBudget / this.totalFormations) : 0;
        const control = this.simulationForm.get('costPerFormation');
        console.log('Before setValue costPerFormation:', control?.value);
        control?.setValue(Math.max(0, costPerFormation));
        console.log('After setValue costPerFormation:', control?.value);
        break;
      }
      case 'formateurs': {
        const target = Math.round(this.totalFormateurs * (1 + pct / 100));
        const control = this.simulationForm.get('trainers');
        console.log('Before setValue trainers:', control?.value);
        control?.setValue(Math.max(0, target));
        console.log('After setValue trainers:', control?.value);
        break;
      }
    }

    this.editingPercentage = null;
    console.log('Form value after edit:', this.simulationForm.getRawValue());
  }

  cancelPercentageEdit(): void {
    console.log(`Cancelling percentage edit for ${this.editingPercentage}`);
    this.editingPercentage = null;
    this.editingPercentageValue = 0;
  }

  isEditingPercentage(metric: string): boolean {
    return this.editingPercentage === metric;
  }
}
