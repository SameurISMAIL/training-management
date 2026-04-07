import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Formateur } from '../models/formateur.model';

@Injectable({
  providedIn: 'root'
})
export class FormateurService {
  private apiUrl = 'http://localhost:8080/api/formateurs';

  constructor(private readonly http: HttpClient) { }

  getAll(): Observable<Formateur[]> {
    return this.http.get<Formateur[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<Formateur> {
    return this.http.get<Formateur>(`${this.apiUrl}/${id}`);
  }

  create(formateur: Formateur): Observable<Formateur> {
    return this.http.post<Formateur>(`${this.apiUrl}/`, formateur);
  }

  update(id: number, formateur: Formateur): Observable<Formateur> {
    return this.http.put<Formateur>(`${this.apiUrl}/${id}`, formateur);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllFormateurs(): Observable<Formateur[]> {
    return this.getAll();
  }

  deleteFormateur(id: number): Observable<void> {
    return this.delete(id);
  }
}
