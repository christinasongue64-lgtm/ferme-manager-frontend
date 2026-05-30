import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnimalService } from '../../services/animal.service';
import { Animal } from '../../models/models';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <h1 class="page-title">🐄 Gestion des Animaux</h1>
        <p class="text-muted mb-0">{{ animals.length }} animal(aux) enregistré(s)</p>
      </div>
      <button class="btn btn-success" (click)="openModal()">
        <i class="bi bi-plus-lg me-1"></i>Ajouter un animal
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body py-3">
        <div class="row g-2">
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="🔍 Rechercher (ID, nom, race…)"
              (input)="onSearch($event)">
          </div>
          <div class="col-md-3">
            <select class="form-select" (change)="onFilterType($event)">
              <option value="">Tous les types</option>
              <option *ngFor="let t of animalTypes" [value]="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" (change)="onFilterStatus($event)">
              <option value="">Tous les statuts</option>
              <option value="Vivant">Vivant</option>
              <option value="Vendu">Vendu</option>
              <option value="Decede">Décédé</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Spinner -->
    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-success"></div>
      <p class="mt-2 text-muted">Chargement…</p>
    </div>

    <!-- Table -->
    <div class="card" *ngIf="!loading">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Identifiant</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Race</th>
              <th>Sexe</th>
              <th>Entrée</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of animals">
              <td><code>{{ a.identifier }}</code></td>
              <td>{{ a.name || '—' }}</td>
              <td>{{ a.animal_type_display }}</td>
              <td>{{ a.breed || '—' }}</td>
              <td>{{ a.sex_display }}</td>
              <td>{{ a.entry_date | date:'dd/MM/yyyy' }}</td>
              <td>
                <span class="badge" [class]="statusClass(a.status)">{{ a.status_display }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="openModal(a)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteAnimal(a)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="animals.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Aucun animal trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Error -->
    <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-panel" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5>{{ editMode ? 'Modifier l\'animal' : 'Ajouter un animal' }}</h5>
          <button class="btn-close-custom" (click)="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="animalForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nom (optionnel)</label>
                <input type="text" class="form-control" formControlName="name" placeholder="Ex: Bélier1">
              </div>
              <div class="col-md-6">
                <label class="form-label">Type *</label>
                <select class="form-select" formControlName="animal_type" [class.is-invalid]="submitted && f['animal_type'].errors">
                  <option value="">-- Choisir --</option>
                  <option *ngFor="let t of animalTypes" [value]="t.value">{{ t.label }}</option>
                </select>
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Race</label>
                <input type="text" class="form-control" formControlName="breed">
              </div>
              <div class="col-md-6">
                <label class="form-label">Sexe *</label>
                <select class="form-select" formControlName="sex">
                  <option value="male">Mâle</option>
                  <option value="femelle">Femelle</option>
                  <option value="inconnu">Inconnu</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Date d'entrée *</label>
                <input type="date" class="form-control" formControlName="entry_date"
                  [class.is-invalid]="submitted && f['entry_date'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Mode d'entrée</label>
                <select class="form-select" formControlName="entry_type">
                  <option value="achat">Achat</option>
                  <option value="naissance">Naissance</option>
                  <option value="don">Don</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Date de naissance</label>
                <input type="date" class="form-control" formControlName="birth_date">
              </div>
              <div class="col-md-6">
                <label class="form-label">Poids (kg)</label>
                <input type="number" step="0.1" class="form-control" formControlName="weight">
              </div>
              <div class="col-md-6" *ngIf="editMode">
                <label class="form-label">Statut</label>
                <select class="form-select" formControlName="status">
                  <option value="Vivant">Vivant</option>
                  <option value="Vendu">Vendu</option>
                  <option value="Decede">Décédé</option>
                  <option value="Transfere">Transféré</option>  
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">Notes</label>
                <textarea class="form-control" rows="2" formControlName="notes"></textarea>
              </div>
            </div>

            <!-- Server errors -->
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
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 20px;
    }
    .modal-panel {
      background: #fff; border-radius: 16px; width: 100%; max-width: 640px;
      max-height: 90vh; display: flex; flex-direction: column;
    }
    .modal-header-custom {
      padding: 20px 24px; border-bottom: 1px solid #eee;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header-custom h5 { margin: 0; font-weight: 700; }
    .modal-body-custom { padding: 24px; overflow-y: auto; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #666; }
  `]
})
export class AnimalsComponent implements OnInit {
  animals: Animal[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editMode = false;
  submitted = false;
  error = '';
  serverErrors: any = null;
  editId: number | null = null;
  animalForm!: FormGroup;

  animalTypes = [
    { value: 'volaille', label: '🐔 Volaille' },
    { value: 'porc', label: '🐷 Porc' },
    { value: 'bovin', label: '🐄 Bovin' },
    { value: 'ovin', label: '🐑 Ovin' },
    { value: 'caprin', label: '🐐 Caprin' },
    { value: 'autre', label: 'Autre' },
  ];

  filters: any = {};

  constructor(private fb: FormBuilder, private animalService: AnimalService) {}

  ngOnInit(): void {
    this.buildForm();
    this.load();
  }

  buildForm(a?: Animal): void {
    this.animalForm = this.fb.group({
      name: [a?.name || ''],
      animal_type: [a?.animal_type || '', Validators.required],
      breed: [a?.breed || ''],
      sex: [a?.sex || 'inconnu'],
      birth_date: [a?.birth_date || ''],
      entry_date: [a?.entry_date || new Date().toISOString().split('T')[0], Validators.required],
      entry_type: [a?.entry_type || 'achat'],
      status: [a?.status || 'Vivant'],
      weight: [a?.weight || ''],
      notes: [a?.notes || ''],
    });
  }

  get f() { return this.animalForm.controls; }

  load(): void {
    this.loading = true;
    this.animalService.getAll(this.filters).subscribe({
      next: data => { this.animals = data; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  onSearch(e: Event): void {
    this.filters.search = (e.target as HTMLInputElement).value;
    this.load();
  }

  onFilterType(e: Event): void {
    this.filters.type = (e.target as HTMLSelectElement).value;
    this.load();
  }

  onFilterStatus(e: Event): void {
    this.filters.status = (e.target as HTMLSelectElement).value;
    this.load();
  }

  openModal(a?: Animal): void {
    this.editMode = !!a;
    this.editId = a?.id || null;
    this.submitted = false;
    this.serverErrors = null;
    this.buildForm(a);
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    this.submitted = true;
    if (this.animalForm.invalid) return;
    this.saving = true;
    this.serverErrors = null;

    const data = this.animalForm.value;
    const obs = this.editMode && this.editId
      ? this.animalService.update(this.editId, data)
      : this.animalService.create(data);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: err => {
        this.saving = false;
        this.serverErrors = err.error;
      }
    });
  }

  deleteAnimal(a: Animal): void {
    if (!confirm(`Supprimer l'animal ${a.identifier} ?`)) return;
    this.animalService.delete(a.id!).subscribe({
      next: () => this.load(),
      error: () => this.error = 'Erreur lors de la suppression.'
    });
  }

  get serverErrorList(): string[] {
    if (!this.serverErrors) return [];
    return Object.entries(this.serverErrors).map(([k, v]) => `${k}: ${v}`);
  }

  statusClass(status: string): string {
    const m: Record<string, string> = {
      Vivant: 'bg-success', Vendu: 'bg-info', Decede: 'bg-secondary', Transfere: 'bg-warning text-dark'
    };
    return m[status] || 'bg-secondary';
  }
}
