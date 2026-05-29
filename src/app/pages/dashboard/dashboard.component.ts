import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/api.services';
import { DashboardStats } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header mb-4">
      <h1 class="page-title">Tableau de bord</h1>
      <p class="text-muted">Vue d'ensemble de votre ferme</p>
    </div>

    <!-- Spinner -->
    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-success" style="width:3rem;height:3rem"></div>
      <p class="mt-3 text-muted">Chargement des statistiques…</p>
    </div>

    <ng-container *ngIf="!loading && stats">
      <!-- Alert row -->
      <div class="row g-3 mb-4" *ngIf="stats.low_stock_count > 0 || stats.upcoming_vaccines > 0">
        <div class="col-12">
          <div class="alert alert-warning d-flex align-items-center gap-3 mb-0">
            <i class="bi bi-exclamation-triangle-fill fs-4"></i>
            <div>
              <strong>Alertes actives :</strong>
              <span *ngIf="stats.low_stock_count > 0"> {{ stats.low_stock_count }} produit(s) en stock bas.</span>
              <span *ngIf="stats.upcoming_vaccines > 0"> {{ stats.upcoming_vaccines }} vaccin(s) à venir dans 7 jours.</span>
              <a routerLink="/stock" class="ms-2 alert-link">Voir les stocks →</a>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card kpi-green">
            <div class="kpi-icon"><i class="bi bi-heart-pulse"></i></div>
            <div class="kpi-value">{{ stats.total_animals }}</div>
            <div class="kpi-label">Animaux vivants</div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card kpi-blue">
            <div class="kpi-icon"><i class="bi bi-cart3"></i></div>
            <div class="kpi-value">{{ stats.monthly_sales_count }}</div>
            <div class="kpi-label">Ventes ce mois</div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card kpi-orange">
            <div class="kpi-icon"><i class="bi bi-currency-exchange"></i></div>
            <div class="kpi-value">{{ stats.monthly_revenue | number:'1.0-0' }}</div>
            <div class="kpi-label">Revenus (FCFA)</div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card" [class.kpi-green]="stats.monthly_profit >= 0" [class.kpi-red]="stats.monthly_profit < 0">
            <div class="kpi-icon"><i class="bi bi-graph-up-arrow"></i></div>
            <div class="kpi-value">{{ stats.monthly_profit | number:'1.0-0' }}</div>
            <div class="kpi-label">Bénéfice (FCFA)</div>
          </div>
        </div>
      </div>

      <!-- Animals breakdown -->
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-pie-chart me-2"></i>Animaux par type
            </div>
            <div class="card-body">
              <div *ngFor="let item of stats.animals_by_type" class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-capitalize">{{ typeLabel(item.animal_type) }}</span>
                  <span class="fw-semibold">{{ item.count }}</span>
                </div>
                <div class="progress" style="height:8px">
                  <div class="progress-bar bg-success" [style.width.%]="(item.count / stats!.total_animals) * 100"></div>
                </div>
              </div>
              <p class="text-muted small mb-0" *ngIf="!stats.animals_by_type.length">Aucun animal enregistré.</p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-cash-stack me-2"></i>Résumé financier du mois
            </div>
            <div class="card-body">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td>Revenus des ventes</td>
                    <td class="text-end text-success fw-semibold">{{ stats.monthly_revenue | number:'1.0-0' }} FCFA</td>
                  </tr>
                  <tr>
                    <td>Total des dépenses</td>
                    <td class="text-end text-danger fw-semibold">{{ stats.monthly_expense_total | number:'1.0-0' }} FCFA</td>
                  </tr>
                  <tr class="table-active">
                    <td class="fw-bold">Bénéfice net</td>
                    <td class="text-end fw-bold" [class.text-success]="stats.monthly_profit >= 0" [class.text-danger]="stats.monthly_profit < 0">
                      {{ stats.monthly_profit | number:'1.0-0' }} FCFA
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="row g-2 mt-2">
                <div class="col-6"><a routerLink="/sales" class="btn btn-sm btn-outline-success w-100">Voir ventes</a></div>
                <div class="col-6"><a routerLink="/finance" class="btn btn-sm btn-outline-danger w-100">Voir dépenses</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <div class="alert alert-danger mt-4" *ngIf="error">
      <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
      <button class="btn btn-sm btn-outline-danger ms-3" (click)="load()">Réessayer</button>
    </div>
  `,
  styles: [`
    .page-title { font-size: 1.6rem; font-weight: 700; color: #1a2e1a; margin: 0; }
    .kpi-card {
      border-radius: 12px; padding: 20px; color: #fff;
      display: flex; flex-direction: column; gap: 4px; height: 100%;
    }
    .kpi-green { background: linear-gradient(135deg, #2d5a27, #4caf50); }
    .kpi-blue { background: linear-gradient(135deg, #1565c0, #42a5f5); }
    .kpi-orange { background: linear-gradient(135deg, #e65100, #ffa726); }
    .kpi-red { background: linear-gradient(135deg, #b71c1c, #ef5350); }
    .kpi-icon { font-size: 1.8rem; opacity: 0.8; }
    .kpi-value { font-size: 1.8rem; font-weight: 700; }
    .kpi-label { font-size: 0.8rem; opacity: 0.85; }
    .card { border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border-radius: 12px; }
    .card-header { background: #fff; border-bottom: 1px solid #eee; padding: 14px 20px; border-radius: 12px 12px 0 0 !important; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.getStats().subscribe({
      next: data => { this.stats = data; this.loading = false; },
      error: () => { this.error = 'Impossible de charger les statistiques.'; this.loading = false; }
    });
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      volaille: '🐔 Volaille', porc: '🐷 Porc', bovin: '🐄 Bovin',
      ovin: '🐑 Ovin', caprin: '🐐 Caprin', autre: 'Autre'
    };
    return labels[type] || type;
  }
}
