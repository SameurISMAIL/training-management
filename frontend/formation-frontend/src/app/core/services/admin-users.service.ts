import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../models/user.model';

export interface CreateUserRequest {
  login: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private apiUrl = 'http://localhost:8080/api/admin/utilisateurs';

  constructor(private readonly http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
