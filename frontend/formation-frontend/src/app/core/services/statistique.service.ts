import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface StatCountItem {
  label: string;
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

  getFormationsByDomaine(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/by-domaine`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['domaine'] ?? 'Non defini'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getParticipantsByStructure(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/by-structure`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['structure'] ?? 'Non definie'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByAnnee(): Observable<StatCountItem[]> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/by-annee`).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getBudgetTotal(): Observable<number> {
    return this.http.get<BudgetTotalResponse>(`${this.apiUrl}/budget-total`).pipe(
      map((response) => Number(response.budgetTotal ?? 0))
    );
  }
}
