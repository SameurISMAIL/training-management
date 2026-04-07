import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Structure } from '../models/structure.model';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private apiUrl = 'http://localhost:8080/api/structures';

  constructor(private readonly http: HttpClient) { }

  getAll(): Observable<Structure[]> {
    return this.http.get<Structure[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<Structure> {
    return this.http.get<Structure>(`${this.apiUrl}/${id}`);
  }

  create(structure: Structure): Observable<Structure> {
    return this.http.post<Structure>(`${this.apiUrl}/`, structure);
  }

  update(id: number, structure: Structure): Observable<Structure> {
    return this.http.put<Structure>(`${this.apiUrl}/${id}`, structure);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
