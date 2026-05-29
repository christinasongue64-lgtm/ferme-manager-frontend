import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Animal } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private url = `${environment.apiUrl}/animals/`;

  constructor(private http: HttpClient) {}

  getAll(filters?: any): Observable<Animal[]> {
    let params = new HttpParams();
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Animal[]>(this.url, { params });
  }

  getById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.url}${id}/`);
  }

  create(data: Animal): Observable<Animal> {
    return this.http.post<Animal>(this.url, data);
  }

  update(id: number, data: Partial<Animal>): Observable<Animal> {
    return this.http.patch<Animal>(`${this.url}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}
