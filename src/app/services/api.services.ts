import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HealthRecord, StockItem, StockMovement, Sale, Expense, DashboardStats } from '../models/models';

// ===== HEALTH SERVICE =====
@Injectable({ providedIn: 'root' })
export class HealthService {
  private url = `${environment.apiUrl}/health/`;
  constructor(private http: HttpClient) {}

  getAll(filters?: any): Observable<HealthRecord[]> {
    let params = new HttpParams();
    if (filters?.animal) params = params.set('animal', filters.animal);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<HealthRecord[]>(this.url, { params });
  }

  getById(id: number): Observable<HealthRecord> {
    return this.http.get<HealthRecord>(`${this.url}${id}/`);
  }

  create(data: HealthRecord): Observable<HealthRecord> {
    return this.http.post<HealthRecord>(this.url, data);
  }

  update(id: number, data: Partial<HealthRecord>): Observable<HealthRecord> {
    return this.http.patch<HealthRecord>(`${this.url}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}

// ===== STOCK SERVICE =====
@Injectable({ providedIn: 'root' })
export class StockService {
  private url = `${environment.apiUrl}/stock/`;
  constructor(private http: HttpClient) {}

  getItems(filters?: any): Observable<StockItem[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.low_stock) params = params.set('low_stock', 'true');
    return this.http.get<StockItem[]>(`${this.url}items/`, { params });
  }

  getItem(id: number): Observable<StockItem> {
    return this.http.get<StockItem>(`${this.url}items/${id}/`);
  }

  createItem(data: StockItem): Observable<StockItem> {
    return this.http.post<StockItem>(`${this.url}items/`, data);
  }

  updateItem(id: number, data: Partial<StockItem>): Observable<StockItem> {
    return this.http.patch<StockItem>(`${this.url}items/${id}/`, data);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}items/${id}/`);
  }

  getMovements(itemId?: number): Observable<StockMovement[]> {
    let params = new HttpParams();
    if (itemId) params = params.set('item', itemId.toString());
    return this.http.get<StockMovement[]>(`${this.url}movements/`, { params });
  }

  createMovement(data: StockMovement): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.url}movements/`, data);
  }
}

// ===== SALES SERVICE =====
@Injectable({ providedIn: 'root' })
export class SaleService {
  private url = `${environment.apiUrl}/sales/`;
  constructor(private http: HttpClient) {}

  getAll(filters?: any): Observable<Sale[]> {
    let params = new HttpParams();
    if (filters?.month) params = params.set('month', filters.month);
    if (filters?.year) params = params.set('year', filters.year);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Sale[]>(this.url, { params });
  }

  getById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.url}${id}/`);
  }

  create(data: Sale): Observable<Sale> {
    return this.http.post<Sale>(this.url, data);
  }

  update(id: number, data: Partial<Sale>): Observable<Sale> {
    return this.http.patch<Sale>(`${this.url}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}

// ===== FINANCE SERVICE =====
@Injectable({ providedIn: 'root' })
export class FinanceService {
  private url = `${environment.apiUrl}/finance/`;
  constructor(private http: HttpClient) {}

  getAll(filters?: any): Observable<Expense[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.month) params = params.set('month', filters.month);
    if (filters?.year) params = params.set('year', filters.year);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Expense[]>(this.url, { params });
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.url}${id}/`);
  }

  create(data: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.url, data);
  }

  update(id: number, data: Partial<Expense>): Observable<Expense> {
    return this.http.patch<Expense>(`${this.url}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}

// ===== DASHBOARD SERVICE =====
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats/`);
  }
}
