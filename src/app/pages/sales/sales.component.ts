import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaleService } from '../../services/api.services';
import { AnimalService } from '../../services/animal.service';
import { Sale, Animal } from '../../models/models';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <h1 class="page-title">🛒 Gestion des Ventes</h1>
        <p class="text-muted mb-0">{{ sales.length }} vente(s) — Total : <strong class="text-success">{{ totalRevenue | number:'1.0-0' }} FCFA</strong></p>
      </div>
      <button class="btn btn-success" (click)="openModal()">
        <i class="bi bi-plus-lg me-1"></i>Enregistrer une vente
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body py-3">
        <div class="row g-2">
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="🔍 Client, description…" (input)="onSearch($event)">
          </div>
          <div class="col-md-3">
            <select class="form-select" (change)="onFilterMonth($event)">
              <option value="">Tous les mois</option>
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
              <th>Client</th>
              <th>Description</th>
              <th>Animal</th>
              <th>Qté</th>
              <th>Prix unit.</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sales">
              <td>{{ s.date | date:'dd/MM/yyyy' }}</td>
              <td>
                <div class="fw-semibold">{{ s.client_name }}</div>
                <small class="text-muted">{{ s.client_phone }}</small>
              </td>
              <td>{{ s.description }}</td>
              <td><code *ngIf="s.animal_identifier">{{ s.animal_identifier }}</code><span *ngIf="!s.animal_identifier">—</span></td>
              <td>{{ s.quantity }}</td>
              <td>{{ s.unit_price | number:'1.0-0' }}</td>
              <td class="fw-bold text-success">{{ s.total_price | number:'1.0-0' }} FCFA</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="openModal(s)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" (click)="delete(s)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="sales.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Aucune vente enregistrée.</td>
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
          <h5>{{ editMode ? 'Modifier la vente' : 'Enregistrer une vente' }}</h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Client *</label>
                <input type="text" class="form-control" formControlName="client_name"
                  [class.is-invalid]="submitted && f['client_name'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Téléphone client</label>
                <input type="text" class="form-control" formControlName="client_phone">
              </div>
              <div class="col-md-6">
                <label class="form-label">Date *</label>
                <input type="date" class="form-control" formControlName="date"
                  [class.is-invalid]="submitted && f['date'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Animal vendu (optionnel)</label>
                <select class="form-select" formControlName="animal">
                  <option value="">— Aucun —</option>
                  <option *ngFor="let a of animals" [value]="a.id">{{ a.identifier }} — {{ a.animal_type_display }}</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">Description *</label>
                <input type="text" class="form-control" formControlName="description"
                  [class.is-invalid]="submitted && f['description'].errors" placeholder="Ex: Vente de 5 poulets">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Quantité *</label>
                <input type="number" class="form-control" formControlName="quantity" min="1"
                  [class.is-invalid]="submitted && f['quantity'].errors">
                <div class="invalid-feedback">≥ 1.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Prix unitaire (FCFA) *</label>
                <input type="number" class="form-control" formControlName="unit_price" min="1"
                  [class.is-invalid]="submitted && f['unit_price'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Total estimé</label>
                <input type="text" class="form-control bg-light" readonly
                  [value]="(form.value.quantity * form.value.unit_price) | number:'1.0-0'">
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
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 20px; }
    .modal-panel { background: #fff; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-header-custom h5 { margin: 0; font-weight: 700; }
    .modal-body-custom { padding: 24px; overflow-y: auto; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; cursor: pointer; }
  `]
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  animals: Animal[] = [];
  loading = false; saving = false; showModal = false; editMode = false; submitted = false;
  error = ''; serverErrors: any = null; editId: number | null = null;
  form!: FormGroup;
  filters: any = { year: new Date().getFullYear() };
  currentYear = new Date().getFullYear();

  months = [
    { value: '1', label: 'Janvier' }, { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' }, { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' }, { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' }, { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' }, { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
  ];

  constructor(private fb: FormBuilder, private saleService: SaleService, private animalService: AnimalService) {}

  ngOnInit(): void { this.buildForm(); this.load(); this.loadAnimals(); }

  buildForm(s?: Sale): void {
    this.form = this.fb.group({
      client_name: [s?.client_name || '', Validators.required],
      client_phone: [s?.client_phone || ''],
      date: [s?.date || new Date().toISOString().split('T')[0], Validators.required],
      animal: [s?.animal || ''],
      description: [s?.description || '', Validators.required],
      quantity: [s?.quantity || 1, [Validators.required, Validators.min(1)]],
      unit_price: [s?.unit_price || '', [Validators.required, Validators.min(1)]],
      notes: [s?.notes || ''],
    });
  }

  get f() { return this.form.controls; }

  load(): void {
    this.loading = true;
    this.saleService.getAll(this.filters).subscribe({
      next: data => { this.sales = data; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  loadAnimals(): void {
    this.animalService.getAll({ status: 'alive' }).subscribe(data => this.animals = data);
  }

  get totalRevenue(): number {
    return this.sales.reduce((acc, s) => acc + (s.total_price || 0), 0);
  }

  onSearch(e: Event): void { this.filters.search = (e.target as HTMLInputElement).value; this.load(); }
  onFilterMonth(e: Event): void { this.filters.month = (e.target as HTMLSelectElement).value; this.load(); }
  onFilterYear(e: Event): void { this.filters.year = (e.target as HTMLInputElement).value; this.load(); }

  openModal(s?: Sale): void {
    this.editMode = !!s; this.editId = s?.id || null;
    this.submitted = false; this.serverErrors = null;
    this.buildForm(s); this.showModal = true;
  }
  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;
    const data = { ...this.form.value, animal: this.form.value.animal || null };
    const obs = this.editMode && this.editId
      ? this.saleService.update(this.editId, data)
      : this.saleService.create(data);
    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); this.loadAnimals(); },
      error: err => { this.saving = false; this.serverErrors = err.error; }
    });
  }

  delete(s: Sale): void {
    if (!confirm('Supprimer cette vente ?')) return;
    this.saleService.delete(s.id!).subscribe({ next: () => this.load() });
  }

  get serverErrorList(): string[] {
    if (!this.serverErrors) return [];
    return Object.entries(this.serverErrors).map(([k, v]) => `${k}: ${v}`);
  }
}
