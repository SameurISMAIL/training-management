import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface StatCountItem {
  label: string;
  count: number;
}

export interface StatBudgetItem {
  label: string;
  budget: number;
}

export interface GlobalStats {
  totalFormations: number;
  totalParticipants: number;
  totalFormateurs: number;
  totalStructures: number;
  budgetTotal: number;
}

export interface FormateurTypeItem {
  type: string;
  count: number;
}

export interface BudgetTotalResponse {
  budgetTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private apiUrl = 'http://localhost:8080/api/statistiques';

  constructor(private readonly http: HttpClient) {}

  getGlobalStats(): Observable<GlobalStats> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/global`).pipe(
      map((item) => ({
        totalFormations: Number(item['totalFormations'] ?? 0),
        totalParticipants: Number(item['totalParticipants'] ?? 0),
        totalFormateurs: Number(item['totalFormateurs'] ?? 0),
        totalStructures: Number(item['totalStructures'] ?? 0),
        budgetTotal: Number(item['budgetTotal'] ?? 0)
      }))
    );
  }

  getFormationsByDomaine(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/domaine/formations`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['domaine'] ?? 'Non defini'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getParticipantsByDomaine(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/domaine/participants`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['domaine'] ?? 'Non defini'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getParticipantsByStructure(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/structure/participants`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['structure'] ?? 'Non definie'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByStructure(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/structure/formations`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['structure'] ?? 'Non definie'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByAnnee(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/annee/formations`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getParticipantsByAnnee(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/annee/participants`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormateursByAnnee(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/annee/formateurs`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getBudgetByAnnee(): Observable<StatBudgetItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/annee/budget`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        budget: Number(item['budget'] ?? 0)
      })))
    );
  }

  getFormateursRepartition(): Observable<FormateurTypeItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/formateurs/repartition`).pipe(
      map((items) => items.map((item) => ({
        type: String(item['type'] ?? 'inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByFormateur(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/formateurs/formations`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formateur'] ?? 'Inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByMois(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/mensuel/formations`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['mois'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getBudgetByDomaine(): Observable<StatBudgetItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/finances/domaine`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['domaine'] ?? 'Non defini'),
        budget: Number(item['budget'] ?? 0)
      })))
    );
  }

  getBudgetByFormation(): Observable<StatBudgetItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/finances/formation`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formation'] ?? 'Sans titre'),
        budget: Number(item['budget'] ?? 0)
      })))
    );
  }

  getTopFormations(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/avancees/top-formations`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formation'] ?? 'Sans titre'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getAverageParticipantsPerFormation(): Observable<number> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/avancees/moyenne-participants`).pipe(
      map((item) => Number(item['average'] ?? 0))
    );
  }

  getMostActiveParticipants(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/avancees/participants-actifs`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['participant'] ?? 'Inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getBudgetTotal(): Observable<number> {
    return this.getGlobalStats().pipe(
      map((response) => Number(response.budgetTotal ?? 0))
    );
  }
}
