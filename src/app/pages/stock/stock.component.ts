import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from '../../services/api.services';
import { StockItem, StockMovement } from '../../models/models';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <h1 class="page-title">📦 Gestion des Stocks</h1>
        <p class="text-muted mb-0">{{ items.length }} produit(s) en stock</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-warning" *ngIf="selectedItem" (click)="openMovementModal()">
          <i class="bi bi-arrow-left-right me-1"></i>Mouvement
        </button>
        <button class="btn btn-success" (click)="openModal()">
          <i class="bi bi-plus-lg me-1"></i>Ajouter un produit
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="🔍 Rechercher…" (input)="onSearch($event)">
          </div>
          <div class="col-md-3">
            <select class="form-select" (change)="onFilterCategory($event)">
              <option value="">Toutes catégories</option>
              <option *ngFor="let c of categories" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="lowStock" (change)="onFilterLow($event)">
              <label class="form-check-label text-warning fw-semibold" for="lowStock">
                ⚠️ Stock bas uniquement
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-success"></div>
    </div>

    <!-- Items grid -->
    <div class="row g-3" *ngIf="!loading">
      <div class="col-md-6 col-lg-4" *ngFor="let item of items">
        <div class="stock-card" [class.low-stock]="item.is_low" (click)="selectItem(item)"
          [class.selected]="selectedItem?.id === item.id">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1 fw-bold">{{ item.name }}</h6>
              <span class="badge" [class]="categoryClass(item.category)">{{ item.category_display }}</span>
            </div>
            <div class="text-end">
              <div class="stock-qty" [class.text-danger]="item.is_low" [class.text-success]="!item.is_low">
                {{ item.quantity }} {{ item.unit }}
              </div>
              <small class="text-muted">min: {{ item.min_quantity }}</small>
            </div>
          </div>
          <div class="mt-2 d-flex justify-content-between align-items-center">
            <small class="text-muted">{{ item.supplier || 'Sans fournisseur' }}</small>
            <div>
              <button class="btn btn-sm btn-outline-primary me-1" (click)="$event.stopPropagation(); openModal(item)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" (click)="$event.stopPropagation(); deleteItem(item)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="alert alert-warning py-1 px-2 mt-2 mb-0 small" *ngIf="item.is_low">
            ⚠️ Stock en dessous du seuil d'alerte !
          </div>
        </div>
      </div>
      <div class="col-12 text-center text-muted py-4" *ngIf="items.length === 0">
        Aucun produit en stock.
      </div>
    </div>

    <!-- Movements panel -->
    <div class="card mt-4" *ngIf="selectedItem">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-clock-history me-2"></i>Mouvements — {{ selectedItem.name }}</span>
        <button class="btn btn-sm btn-outline-secondary" (click)="selectedItem = null">Fermer</button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead><tr><th>Type</th><th>Qté</th><th>Date</th><th>Motif</th></tr></thead>
            <tbody>
              <tr *ngFor="let m of movements">
                <td>
                  <span class="badge" [class.bg-success]="m.movement_type === 'in'" [class.bg-danger]="m.movement_type === 'out'">
                    {{ m.movement_type === 'in' ? '↑ Entrée' : '↓ Sortie' }}
                  </span>
                </td>
                <td>{{ m.quantity }}</td>
                <td>{{ m.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ m.reason || '—' }}</td>
              </tr>
              <tr *ngIf="movements.length === 0">
                <td colspan="4" class="text-muted text-center">Aucun mouvement enregistré.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-sm btn-outline-primary mt-2" (click)="openMovementModal()">
          <i class="bi bi-plus-lg me-1"></i>Enregistrer un mouvement
        </button>
      </div>
    </div>

    <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>

    <!-- Stock item modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-panel" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5>{{ editMode ? 'Modifier le produit' : 'Ajouter un produit' }}</h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label">Nom du produit *</label>
                <input type="text" class="form-control" formControlName="name" [class.is-invalid]="submitted && f['name'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Catégorie *</label>
                <select class="form-select" formControlName="category" [class.is-invalid]="submitted && f['category'].errors">
                  <option value="">--</option>
                  <option *ngFor="let c of categories" [value]="c.value">{{ c.label }}</option>
                </select>
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Quantité *</label>
                <input type="number" step="0.01" class="form-control" formControlName="quantity"
                  [class.is-invalid]="submitted && f['quantity'].errors">
                <div class="invalid-feedback">Requis, ≥ 0.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Unité *</label>
                <input type="text" class="form-control" formControlName="unit" placeholder="kg, L, pièces…"
                  [class.is-invalid]="submitted && f['unit'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Seuil d'alerte</label>
                <input type="number" step="0.01" class="form-control" formControlName="min_quantity" min="0">
              </div>
              <div class="col-md-6">
                <label class="form-label">Prix unitaire (FCFA)</label>
                <input type="number" class="form-control" formControlName="unit_price" min="0">
              </div>
              <div class="col-md-6">
                <label class="form-label">Fournisseur</label>
                <input type="text" class="form-control" formControlName="supplier">
              </div>
              <div class="col-md-6">
                <label class="form-label">Date d'expiration</label>
                <input type="date" class="form-control" formControlName="expiry_date">
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

    <!-- Movement modal -->
    <div class="modal-overlay" *ngIf="showMovementModal" (click)="closeMovementModal()">
      <div class="modal-panel" style="max-width:420px" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5>Mouvement de stock — {{ selectedItem?.name }}</h5>
          <button class="btn-close-custom" (click)="closeMovementModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="movementForm" (ngSubmit)="onMovementSubmit()">
            <div class="mb-3">
              <label class="form-label">Type *</label>
              <select class="form-select" formControlName="movement_type">
                <option value="in">↑ Entrée (réapprovisionnement)</option>
                <option value="out">↓ Sortie (consommation)</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Quantité *</label>
              <input type="number" step="0.01" class="form-control" formControlName="quantity"
                [class.is-invalid]="movementSubmitted && mf['quantity'].errors" min="0.01">
              <div class="invalid-feedback">Doit être > 0.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Date *</label>
              <input type="date" class="form-control" formControlName="date">
            </div>
            <div class="mb-3">
              <label class="form-label">Motif</label>
              <input type="text" class="form-control" formControlName="reason">
            </div>
            <div class="alert alert-danger" *ngIf="movementError">{{ movementError }}</div>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" (click)="closeMovementModal()">Annuler</button>
              <button type="submit" class="btn btn-success" [disabled]="saving">
                <span class="spinner-border spinner-border-sm me-1" *ngIf="saving"></span>Enregistrer
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
    .card-header { background: #fff; border-bottom: 1px solid #eee; padding: 14px 20px; border-radius: 12px 12px 0 0 !important; }
    .stock-card {
      background: #fff; border-radius: 12px; padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07); cursor: pointer;
      border: 2px solid transparent; transition: all 0.2s;
    }
    .stock-card:hover { border-color: #4caf50; }
    .stock-card.selected { border-color: #4caf50; background: #f0fff0; }
    .stock-card.low-stock { border-color: #ffc107; }
    .stock-qty { font-size: 1.2rem; font-weight: 700; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 20px; }
    .modal-panel { background: #fff; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-header-custom h5 { margin: 0; font-weight: 700; }
    .modal-body-custom { padding: 24px; overflow-y: auto; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #666; }
  `]
})
export class StockComponent implements OnInit {
  items: StockItem[] = [];
  movements: StockMovement[] = [];
  selectedItem: StockItem | null = null;
  loading = false; saving = false;
  showModal = false; showMovementModal = false;
  editMode = false; submitted = false; movementSubmitted = false;
  error = ''; movementError = ''; serverErrors: any = null;
  editId: number | null = null;
  form!: FormGroup; movementForm!: FormGroup;
  filters: any = {};

  categories = [
    { value: 'aliment', label: '🌽 Aliment' },
    { value: 'medicament', label: '💊 Médicament' },
    { value: 'equipement', label: '🔧 Équipement' },
    { value: 'autre', label: 'Autre' },
  ];

  constructor(private fb: FormBuilder, private stockService: StockService) {}

  ngOnInit(): void { this.buildForm(); this.buildMovementForm(); this.load(); }

  buildForm(item?: StockItem): void {
    this.form = this.fb.group({
      name: [item?.name || '', Validators.required],
      category: [item?.category || '', Validators.required],
      quantity: [item?.quantity ?? 0, [Validators.required, Validators.min(0)]],
      unit: [item?.unit || '', Validators.required],
      min_quantity: [item?.min_quantity ?? 0, Validators.min(0)],
      unit_price: [item?.unit_price ?? 0, Validators.min(0)],
      supplier: [item?.supplier || ''],
      expiry_date: [item?.expiry_date || ''],
      notes: [item?.notes || ''],
    });
  }

  buildMovementForm(): void {
    this.movementForm = this.fb.group({
      movement_type: ['in'],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      reason: [''],
    });
  }

  get f() { return this.form.controls; }
  get mf() { return this.movementForm.controls; }

  load(): void {
    this.loading = true;
    this.stockService.getItems(this.filters).subscribe({
      next: data => { this.items = data; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  selectItem(item: StockItem): void {
    this.selectedItem = item;
    this.stockService.getMovements(item.id).subscribe(data => this.movements = data);
  }

  onSearch(e: Event): void { this.filters.search = (e.target as HTMLInputElement).value; this.load(); }
  onFilterCategory(e: Event): void { this.filters.category = (e.target as HTMLSelectElement).value; this.load(); }
  onFilterLow(e: Event): void { this.filters.low_stock = (e.target as HTMLInputElement).checked; this.load(); }

  openModal(item?: StockItem): void {
    this.editMode = !!item; this.editId = item?.id || null;
    this.submitted = false; this.serverErrors = null;
    this.buildForm(item); this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  openMovementModal(): void { this.buildMovementForm(); this.movementError = ''; this.showMovementModal = true; }
  closeMovementModal(): void { this.showMovementModal = false; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true; this.serverErrors = null;

    const obs = this.editMode && this.editId
      ? this.stockService.updateItem(this.editId, this.form.value)
      : this.stockService.createItem(this.form.value);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: err => { this.saving = false; this.serverErrors = err.error; }
    });
  }

  onMovementSubmit(): void {
    this.movementSubmitted = true;
    if (this.movementForm.invalid || !this.selectedItem) return;
    this.saving = true; this.movementError = '';

    const data = { ...this.movementForm.value, item: this.selectedItem.id };
    this.stockService.createMovement(data).subscribe({
      next: () => {
        this.saving = false; this.closeMovementModal();
        this.load();
        if (this.selectedItem) this.selectItem(this.selectedItem);
      },
      error: err => {
        this.saving = false;
        this.movementError = err.error?.quantity?.[0] || err.error?.non_field_errors?.[0] || 'Erreur.';
      }
    });
  }

  deleteItem(item: StockItem): void {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;
    this.stockService.deleteItem(item.id!).subscribe({
      next: () => { this.load(); if (this.selectedItem?.id === item.id) this.selectedItem = null; }
    });
  }

  get serverErrorList(): string[] {
    if (!this.serverErrors) return [];
    return Object.entries(this.serverErrors).map(([k, v]) => `${k}: ${v}`);
  }

  categoryClass(cat: string): string {
    const m: Record<string, string> = { aliment: 'bg-warning text-dark', medicament: 'bg-danger', equipement: 'bg-primary', autre: 'bg-secondary' };
    return m[cat] || 'bg-secondary';
  }
}
