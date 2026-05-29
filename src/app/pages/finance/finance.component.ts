import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinanceService } from '../../services/api.services';
import { Expense } from '../../models/models';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <h1 class="page-title">💰 Gestion des Dépenses</h1>
        <p class="text-muted mb-0">{{ expenses.length }} dépense(s) — Total : <strong class="text-danger">{{ totalExpenses | number:'1.0-0' }} FCFA</strong></p>
      </div>
      <button class="btn btn-success" (click)="openModal()">
        <i class="bi bi-plus-lg me-1"></i>Ajouter une dépense
      </button>
    </div>

    <!-- Category summary cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-4 col-lg-2" *ngFor="let cat of categorySummary">
        <div class="cat-card">
          <div class="cat-icon">{{ cat.icon }}</div>
          <div class="cat-amount">{{ cat.amount | number:'1.0-0' }}</div>
          <div class="cat-label">{{ cat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body py-3">
        <div class="row g-2">
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="🔍 Rechercher…" (input)="onSearch($event)">
          </div>
          <div class="col-md-3">
            <select class="form-select" (change)="onFilterCat($event)">
              <option value="">Toutes catégories</option>
              <option *ngFor="let c of categories" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" (change)="onFilterMonth($event)">
              <option value="">Tous mois</option>
              <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <input type="number" class="form-control" placeholder="Année" (input)="onFilterYear($event)" [value]="currentYear">
          </div>
        </div>
      </div>
    </div>

    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-success"></div>
    </div>

    <div class="card" *ngIf="!loading">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Fournisseur</th>
              <th>Montant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of expenses">
              <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td><span class="badge" [class]="catClass(e.category)">{{ e.category_display }}</span></td>
              <td>{{ e.description }}</td>
              <td>{{ e.supplier || '—' }}</td>
              <td class="fw-semibold text-danger">{{ e.amount | number:'1.0-0' }} FCFA</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="openModal(e)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" (click)="delete(e)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="expenses.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Aucune dépense enregistrée.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-panel" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5>{{ editMode ? 'Modifier la dépense' : 'Ajouter une dépense' }}</h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Catégorie *</label>
                <select class="form-select" formControlName="category" [class.is-invalid]="submitted && f['category'].errors">
                  <option value="">-- Choisir --</option>
                  <option *ngFor="let c of categories" [value]="c.value">{{ c.label }}</option>
                </select>
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Date *</label>
                <input type="date" class="form-control" formControlName="date"
                  [class.is-invalid]="submitted && f['date'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-12">
                <label class="form-label">Description *</label>
                <input type="text" class="form-control" formControlName="description"
                  [class.is-invalid]="submitted && f['description'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Montant (FCFA) *</label>
                <input type="number" class="form-control" formControlName="amount" min="1"
                  [class.is-invalid]="submitted && f['amount'].errors">
                <div class="invalid-feedback">Doit être > 0.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Fournisseur / Payé à</label>
                <input type="text" class="form-control" formControlName="supplier">
              </div>
              <div class="col-12">
                <label class="form-label">Notes</label>
                <textarea class="form-control" rows="2" formControlName="notes"></textarea>
              </div>
            </div>
            <div class="alert alert-danger mt-3" *ngIf="serverErrors">
              <div *ngFor="let err of serverErrorList">{{ err }}</div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn btn-success" [disabled]="saving">
                <span class="spinner-border spinner-border-sm me-1" *ngIf="saving"></span>
                {{ editMode ? 'Enregistrer' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 1.6rem; font-weight: 700; color: #1a2e1a; }
    .card { border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border-radius: 12px; }
    .card-body { padding: 16px 20px; }
    .cat-card { background:#fff; border-radius:10px; padding:14px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,.07); }
    .cat-icon { font-size:1.5rem; }
    .cat-amount { font-size:1rem; font-weight:700; color:#c62828; }
    .cat-label { font-size:0.7rem; color:#777; margin-top:2px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 20px; }
    .modal-panel { background: #fff; border-radius: 16px; width: 100%; max-width: 580px; max-height: 90vh; display: flex; flex-direction: column; }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-header-custom h5 { margin: 0; font-weight: 700; }
    .modal-body-custom { padding: 24px; overflow-y: auto; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; cursor: pointer; }
  `]
})
export class FinanceComponent implements OnInit {
  expenses: Expense[] = [];
  loading = false; saving = false; showModal = false; editMode = false; submitted = false;
  error = ''; serverErrors: any = null; editId: number | null = null;
  form!: FormGroup;
  filters: any = { year: new Date().getFullYear() };
  currentYear = new Date().getFullYear();

  categories = [
    { value: 'alimentation', label: '🌽 Alimentation' },
    { value: 'veterinaire', label: '🩺 Vétérinaire' },
    { value: 'equipement', label: '🔧 Équipement' },
    { value: 'salaire', label: '👷 Salaire' },
    { value: 'transport', label: '🚛 Transport' },
    { value: 'autre', label: '📦 Autre' },
  ];

  months = [
    { value: '1', label: 'Janvier' }, { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' }, { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' }, { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' }, { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' }, { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
  ];

  constructor(private fb: FormBuilder, private financeService: FinanceService) {}

  ngOnInit(): void { this.buildForm(); this.load(); }

  buildForm(e?: Expense): void {
    this.form = this.fb.group({
      category: [e?.category || '', Validators.required],
      description: [e?.description || '', Validators.required],
      amount: [e?.amount || '', [Validators.required, Validators.min(1)]],
      date: [e?.date || new Date().toISOString().split('T')[0], Validators.required],
      supplier: [e?.supplier || ''],
      notes: [e?.notes || ''],
    });
  }

  get f() { return this.form.controls; }

  load(): void {
    this.loading = true;
    this.financeService.getAll(this.filters).subscribe({
      next: data => { this.expenses = data; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  get totalExpenses(): number {
    return this.expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  }

  get categorySummary() {
    const icons: Record<string, string> = {
      alimentation: '🌽', veterinaire: '🩺', equipement: '🔧',
      salaire: '👷', transport: '🚛', autre: '📦'
    };
    const labels: Record<string, string> = {
      alimentation: 'Alimentation', veterinaire: 'Vétérinaire', equipement: 'Équipement',
      salaire: 'Salaire', transport: 'Transport', autre: 'Autre'
    };
    const sums: Record<string, number> = {};
    this.expenses.forEach(e => {
      sums[e.category] = (sums[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(sums).map(([cat, amount]) => ({
      icon: icons[cat] || '📦', label: labels[cat] || cat, amount
    }));
  }

  onSearch(e: Event): void { this.filters.search = (e.target as HTMLInputElement).value; this.load(); }
  onFilterCat(e: Event): void { this.filters.category = (e.target as HTMLSelectElement).value; this.load(); }
  onFilterMonth(e: Event): void { this.filters.month = (e.target as HTMLSelectElement).value; this.load(); }
  onFilterYear(e: Event): void { this.filters.year = (e.target as HTMLInputElement).value; this.load(); }

  openModal(e?: Expense): void {
    this.editMode = !!e; this.editId = e?.id || null;
    this.submitted = false; this.serverErrors = null;
    this.buildForm(e); this.showModal = true;
  }
  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;
    const obs = this.editMode && this.editId
      ? this.financeService.update(this.editId, this.form.value)
      : this.financeService.create(this.form.value);
    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: err => { this.saving = false; this.serverErrors = err.error; }
    });
  }

  delete(e: Expense): void {
    if (!confirm('Supprimer cette dépense ?')) return;
    this.financeService.delete(e.id!).subscribe({ next: () => this.load() });
  }

  catClass(cat: string): string {
    const m: Record<string, string> = {
      alimentation: 'bg-warning text-dark', veterinaire: 'bg-danger',
      equipement: 'bg-primary', salaire: 'bg-success',
      transport: 'bg-info text-dark', autre: 'bg-secondary'
    };
    return m[cat] || 'bg-secondary';
  }

  get serverErrorList(): string[] {
    if (!this.serverErrors) return [];
    return Object.entries(this.serverErrors).map(([k, v]) => `${k}: ${v}`);
  }
}
