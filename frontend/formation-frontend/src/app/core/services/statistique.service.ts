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

  getGlobalStats(year?: string): Observable<GlobalStats> {
    const url = `${this.apiUrl}/global${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Record<string, unknown>>(url).pipe(
      map((item) => ({
        totalFormations: Number(item['totalFormations'] ?? 0),
        totalParticipants: Number(item['totalParticipants'] ?? 0),
        totalFormateurs: Number(item['totalFormateurs'] ?? 0),
        totalStructures: Number(item['totalStructures'] ?? 0),
        budgetTotal: Number(item['budgetTotal'] ?? 0)
      }))
    );
  }

  getFormationsByDomaine(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/domaine/formations${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['domaine'] ?? 'Non defini'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getParticipantsByDomaine(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/domaine/participants${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['domaine'] ?? 'Non defini'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getParticipantsByStructure(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/structure/participants${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['structure'] ?? 'Non definie'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByStructure(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/structure/formations${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['structure'] ?? 'Non definie'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByAnnee(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/annee/formations${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getParticipantsByAnnee(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/annee/participants${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormateursByAnnee(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/annee/formateurs${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getBudgetByAnnee(year?: string): Observable<StatBudgetItem[]> {
    const url = `${this.apiUrl}/annee/budget${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['annee'] ?? ''),
        budget: Number(item['budget'] ?? 0)
      })))
    );
  }

  getFormateursRepartition(year?: string): Observable<FormateurTypeItem[]> {
    const url = `${this.apiUrl}/formateurs/repartition${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        type: String(item['type'] ?? 'inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByFormateur(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/formateurs/formations${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formateur'] ?? 'Inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getFormationsByMois(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/mensuel/formations${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['mois'] ?? ''),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getBudgetByDomaine(year?: string): Observable<StatBudgetItem[]> {
    const url = `${this.apiUrl}/finances/domaine${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['domaine'] ?? 'Non defini'),
        budget: Number(item['budget'] ?? 0)
      })))
    );
  }

  getBudgetByFormation(year?: string): Observable<StatBudgetItem[]> {
    const url = `${this.apiUrl}/finances/formation${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formation'] ?? 'Sans titre'),
        budget: Number(item['budget'] ?? 0)
      })))
    );
  }

  getTopFormations(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/avancees/top-formations${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formation'] ?? 'Sans titre'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getAverageParticipantsPerFormation(year?: string): Observable<number> {
    const url = `${this.apiUrl}/avancees/moyenne-participants${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Record<string, unknown>>(url).pipe(
      map((item) => Number(item['average'] ?? 0))
    );
  }

  getMostActiveParticipants(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/avancees/participants-actifs${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['participant'] ?? 'Inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getTopFormateursByAnnee(year?: string): Observable<Record<string, Array<{ formateur: string; count: number }>>> {
    const url = `${this.apiUrl}/avancees/top-formateurs${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Record<string, Array<Record<string, unknown>>>>(url).pipe(
      map((response) => {
        const result: Record<string, Array<{ formateur: string; count: number }>> = {};
        for (const [key, items] of Object.entries(response)) {
          result[key] = items.map((item) => ({
            formateur: String(item['formateur'] ?? 'Inconnu'),
            count: Number(item['count'] ?? 0)
          }));
        }
        return result;
      })
    );
  }

  getTopFormationsInternes(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/formations/interne${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formation'] ?? 'Sans titre'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getTopFormationsExternes(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/formations/externe${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formation'] ?? 'Sans titre'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getTopFormateursInternes(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/formateurs/top-internes${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formateur'] ?? 'Inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getTopFormateursExternes(year?: string): Observable<StatCountItem[]> {
    const url = `${this.apiUrl}/formateurs/top-externes${year ? `?annee=${encodeURIComponent(year)}` : ''}`;
    return this.http.get<Array<Record<string, unknown>>>(url).pipe(
      map((items) => items.map((item) => ({
        label: String(item['formateur'] ?? 'Inconnu'),
        count: Number(item['count'] ?? 0)
      })))
    );
  }

  getBudgetTotal(year?: string): Observable<number> {
    return this.getGlobalStats(year).pipe(
      map((response) => Number(response.budgetTotal ?? 0))
    );
  }
}
