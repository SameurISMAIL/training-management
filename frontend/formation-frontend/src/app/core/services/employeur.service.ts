import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Employeur } from '../models/employeur.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeurService {
  private apiUrl = 'http://localhost:8080/api/employeurs';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Employeur[]> {
    return this.http.get<Employeur[]>(`${this.apiUrl}/`);
  }
}
