import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HealthService } from '../../services/api.services';
import { AnimalService } from '../../services/animal.service';
import { HealthRecord, Animal } from '../../models/models';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <h1 class="page-title">🩺 Suivi Sanitaire</h1>
        <p class="text-muted mb-0">{{ records.length }} enregistrement(s)</p>
      </div>
      <button class="btn btn-success" (click)="openModal()">
        <i class="bi bi-plus-lg me-1"></i>Ajouter un soin
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body py-3">
        <div class="row g-2">
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="🔍 Rechercher…" (input)="onSearch($event)">
          </div>
          <div class="col-md-3">
            <select class="form-select" (change)="onFilterType($event)">
              <option value="">Tous les types</option>
              <option *ngFor="let t of recordTypes" [value]="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" (change)="onFilterAnimal($event)">
              <option value="">Tous les animaux</option>
              <option *ngFor="let a of animals" [value]="a.id">{{ a.identifier }} {{ a.name ? '— '+a.name : '' }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-success"></div>
      <p class="mt-2 text-muted">Chargement…</p>
    </div>

    <div class="card" *ngIf="!loading">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Animal</th>
              <th>Type</th>
              <th>Date</th>
              <th>Description</th>
              <th>Médicament</th>
              <th>Coût</th>
              <th>Rappel</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of records">
              <td><code>{{ r.animal_name }}</code></td>
              <td><span class="badge bg-info text-dark">{{ r.record_type_display }}</span></td>
              <td>{{ r.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ r.description }}</td>
              <td>{{ r.medication || '—' }}</td>
              <td>{{ r.cost | number:'1.0-0' }} FCFA</td>
              <td>
                <span *ngIf="r.next_date" [class]="isUpcoming(r.next_date) ? 'text-warning fw-bold' : ''">
                  {{ r.next_date | date:'dd/MM/yyyy' }}
                  <i class="bi bi-bell-fill" *ngIf="isUpcoming(r.next_date)"></i>
                </span>
                <span *ngIf="!r.next_date">—</span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="openModal(r)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="delete(r)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="records.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Aucun enregistrement sanitaire.</td>
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
          <h5>{{ editMode ? 'Modifier le soin' : 'Enregistrer un soin' }}</h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Animal *</label>
                <select class="form-select" formControlName="animal" [class.is-invalid]="submitted && f['animal'].errors">
                  <option value="">-- Choisir --</option>
                  <option *ngFor="let a of animals" [value]="a.id">{{ a.identifier }} — {{ a.animal_type_display }}</option>
                </select>
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Type *</label>
                <select class="form-select" formControlName="record_type" [class.is-invalid]="submitted && f['record_type'].errors">
                  <option value="">-- Choisir --</option>
                  <option *ngFor="let t of recordTypes" [value]="t.value">{{ t.label }}</option>
                </select>
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Date du soin *</label>
                <input type="date" class="form-control" formControlName="date"
                  [class.is-invalid]="submitted && f['date'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Coût (FCFA)</label>
                <input type="number" class="form-control" formControlName="cost" min="0">
              </div>
              <div class="col-12">
                <label class="form-label">Description *</label>
                <input type="text" class="form-control" formControlName="description"
                  [class.is-invalid]="submitted && f['description'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Médicament</label>
                <input type="text" class="form-control" formControlName="medication">
              </div>
              <div class="col-md-6">
                <label class="form-label">Dose</label>
                <input type="text" class="form-control" formControlName="dose">
              </div>
              <div class="col-md-6">
                <label class="form-label">Vétérinaire</label>
                <input type="text" class="form-control" formControlName="veterinarian">
              </div>
              <div class="col-md-6">
                <label class="form-label">Date de rappel</label>
                <input type="date" class="form-control" formControlName="next_date"
                  [class.is-invalid]="form.errors?.['next_date']">
                <div class="text-danger small" *ngIf="form.errors?.['next_date']">{{ form.errors?.['next_date'] }}</div>
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
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #666; }
  `]
})
export class HealthComponent implements OnInit {
  records: HealthRecord[] = [];
  animals: Animal[] = [];
  loading = false; saving = false; showModal = false; editMode = false; submitted = false;
  error = ''; serverErrors: any = null; editId: number | null = null;
  form!: FormGroup;
  filters: any = {};

  recordTypes = [
    { value: 'vaccination', label: '💉 Vaccination' },
    { value: 'treatment', label: '💊 Traitement' },
    { value: 'checkup', label: '🔍 Contrôle' },
    { value: 'surgery', label: '🔪 Chirurgie' },
    { value: 'other', label: 'Autre' },
  ];

  constructor(
    private fb: FormBuilder,
    private healthService: HealthService,
    private animalService: AnimalService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.load();
    this.loadAnimals();
  }

  buildForm(r?: HealthRecord): void {
    this.form = this.fb.group({
      animal: [r?.animal || '', Validators.required],
      record_type: [r?.record_type || '', Validators.required],
      date: [r?.date || new Date().toISOString().split('T')[0], Validators.required],
      description: [r?.description || '', Validators.required],
      medication: [r?.medication || ''],
      dose: [r?.dose || ''],
      veterinarian: [r?.veterinarian || ''],
      cost: [r?.cost || 0, [Validators.min(0)]],
      next_date: [r?.next_date || ''],
      notes: [r?.notes || ''],
    });
  }

  get f() { return this.form.controls; }

  load(): void {
    this.loading = true;
    this.healthService.getAll(this.filters).subscribe({
      next: data => { this.records = data; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  loadAnimals(): void {
    this.animalService.getAll({}).subscribe(data => this.animals = data);
  }

  onSearch(e: Event): void { this.filters.search = (e.target as HTMLInputElement).value; this.load(); }
  onFilterType(e: Event): void { this.filters.type = (e.target as HTMLSelectElement).value; this.load(); }
  onFilterAnimal(e: Event): void { this.filters.animal = (e.target as HTMLSelectElement).value; this.load(); }

  openModal(r?: HealthRecord): void {
    this.editMode = !!r; this.editId = r?.id || null;
    this.submitted = false; this.serverErrors = null;
    this.buildForm(r); this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true; this.serverErrors = null;

    const data = this.form.value;
    const obs = this.editMode && this.editId
      ? this.healthService.update(this.editId, data)
      : this.healthService.create(data);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: err => { this.saving = false; this.serverErrors = err.error; }
    });
  }

  delete(r: HealthRecord): void {
    if (!confirm('Supprimer cet enregistrement ?')) return;
    this.healthService.delete(r.id!).subscribe({ next: () => this.load() });
  }

  isUpcoming(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }

  get serverErrorList(): string[] {
    if (!this.serverErrors) return [];
    return Object.entries(this.serverErrors).map(([k, v]) => `${k}: ${v}`);
  }
}
