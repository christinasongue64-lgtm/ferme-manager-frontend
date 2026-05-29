import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { User } from './models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-wrapper" *ngIf="isLoggedIn; else loginLayout">
      <!-- Sidebar -->
      <nav class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-brand">
          <span class="brand-icon">🐄</span>
          <span class="brand-text" *ngIf="!sidebarCollapsed">Ferme Manager</span>
        </div>

        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              <i class="bi bi-speedometer2"></i>
              <span *ngIf="!sidebarCollapsed">Tableau de bord</span>
            </a>
          </li>
          <li>
            <a routerLink="/animals" routerLinkActive="active" class="nav-link">
              <i class="bi bi-heart-pulse"></i>
              <span *ngIf="!sidebarCollapsed">Animaux</span>
            </a>
          </li>
          <li>
            <a routerLink="/health" routerLinkActive="active" class="nav-link">
              <i class="bi bi-clipboard2-pulse"></i>
              <span *ngIf="!sidebarCollapsed">Suivi Sanitaire</span>
            </a>
          </li>
          <li>
            <a routerLink="/stock" routerLinkActive="active" class="nav-link">
              <i class="bi bi-boxes"></i>
              <span *ngIf="!sidebarCollapsed">Stocks</span>
            </a>
          </li>
          <li>
            <a routerLink="/sales" routerLinkActive="active" class="nav-link">
              <i class="bi bi-cart3"></i>
              <span *ngIf="!sidebarCollapsed">Ventes</span>
            </a>
          </li>
          <li>
            <a routerLink="/finance" routerLinkActive="active" class="nav-link">
              <i class="bi bi-cash-coin"></i>
              <span *ngIf="!sidebarCollapsed">Finances</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <div class="user-info">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-details">
              <div class="user-name">{{ currentUser?.first_name || currentUser?.username }}</div>
              <div class="user-role">{{ roleLabel }}</div>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </nav>

      <!-- Main content -->
      <div class="main-content">
        <header class="top-bar">
          <button class="toggle-btn" (click)="toggleSidebar()">
            <i class="bi bi-list"></i>
          </button>
          <div class="top-bar-right">
            <span class="text-muted small">{{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</span>
          </div>
        </header>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>

    <ng-template #loginLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-wrapper { display: flex; height: 100vh; overflow: hidden; }

    .sidebar {
      width: 240px; min-width: 240px; background: #1a2e1a;
      color: #fff; display: flex; flex-direction: column;
      transition: width 0.3s; overflow: hidden;
    }
    .sidebar.collapsed { width: 64px; min-width: 64px; }

    .sidebar-brand {
      display: flex; align-items: center; gap: 10px;
      padding: 20px 16px; font-size: 1.1rem; font-weight: 700;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .brand-icon { font-size: 1.5rem; }

    .nav-menu { list-style: none; padding: 12px 8px; margin: 0; flex: 1; }
    .nav-link {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 8px;
      color: rgba(255,255,255,0.7); text-decoration: none;
      transition: all 0.2s; margin-bottom: 4px; white-space: nowrap;
    }
    .nav-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .nav-link.active { background: #4caf50; color: #fff; }
    .nav-link i { font-size: 1.1rem; min-width: 20px; text-align: center; }

    .sidebar-footer {
      padding: 16px; border-top: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; gap: 10px;
    }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #4caf50; display: flex; align-items: center;
      justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
    }
    .user-details { flex: 1; overflow: hidden; }
    .user-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 0.7rem; color: rgba(255,255,255,0.5); }
    .btn-logout {
      background: none; border: none; color: rgba(255,255,255,0.5);
      cursor: pointer; padding: 4px; font-size: 1.1rem;
      transition: color 0.2s;
    }
    .btn-logout:hover { color: #ff6b6b; }

    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #f4f6f4; }
    .top-bar {
      height: 56px; background: #fff; border-bottom: 1px solid #e0e0e0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; flex-shrink: 0;
    }
    .toggle-btn {
      background: none; border: none; font-size: 1.4rem;
      cursor: pointer; color: #444; padding: 4px 8px;
    }
    .content-area { flex: 1; overflow-y: auto; padding: 24px; }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  sidebarCollapsed = false;
  currentUser: User | null = null;
  today = new Date();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.currentUser;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  get userInitials(): string {
    if (!this.currentUser) return '?';
    const f = this.currentUser.first_name?.[0] || '';
    const l = this.currentUser.last_name?.[0] || '';
    return (f + l).toUpperCase() || this.currentUser.username[0].toUpperCase();
  }

  get roleLabel(): string {
    const roles: Record<string, string> = { admin: 'Administrateur', manager: 'Gestionnaire', employee: 'Employé' };
    return roles[this.currentUser?.role || ''] || '';
  }
}
