import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'animals',
    loadComponent: () => import('./pages/animals/animals.component').then(m => m.AnimalsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'health',
    loadComponent: () => import('./pages/health/health.component').then(m => m.HealthComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'stock',
    loadComponent: () => import('./pages/stock/stock.component').then(m => m.StockComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'sales',
    loadComponent: () => import('./pages/sales/sales.component').then(m => m.SalesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'finance',
    loadComponent: () => import('./pages/finance/finance.component').then(m => m.FinanceComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
