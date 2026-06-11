import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header mb-4 d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <h1 class="page-title">👥 Gestion des Utilisateurs</h1>
        <p class="text-muted mb-0">{{ users.length }} utilisateur(s) enregistré(s)</p>
      </div>
      <button class="btn btn-success" (click)="openModal()">
        <i class="bi bi-person-plus me-1"></i>Ajouter un utilisateur
      </button>
    </div>

    <!-- Accès refusé -->
    <div class="alert alert-danger" *ngIf="!isAdmin">
      <i class="bi bi-shield-lock me-2"></i>
      Accès réservé aux administrateurs.
    </div>

    <ng-container *ngIf="isAdmin">

      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-success"></div>
        <p class="mt-2 text-muted">Chargement…</p>
      </div>

      <div class="card" *ngIf="!loading">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="user-avatar-sm">{{ initials(u) }}</div>
                    <div>
                      <div class="fw-semibold">{{ u.first_name }} {{ u.last_name }}</div>
                      <small class="text-muted">{{ u.username }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ u.email || '—' }}</td>
                <td>{{ u.phone || '—' }}</td>
                <td>
                  <span class="badge" [class]="roleClass(u.role)">
                    {{ roleLabel(u.role) }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"
                    (click)="openModal(u)"
                    [disabled]="u.id === currentUser?.id">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger"
                    (click)="deleteUser(u)"
                    [disabled]="u.id === currentUser?.id">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  Aucun utilisateur.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>

    </ng-container>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-panel" (click)="$event.stopPropagation()">
        <div class="modal-header-custom">
          <h5>{{ editMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h5>
          <button class="btn-close-custom" (click)="closeModal()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body-custom">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Prénom *</label>
                <input type="text" class="form-control" formControlName="first_name"
                  [class.is-invalid]="submitted && f['first_name'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Nom *</label>
                <input type="text" class="form-control" formControlName="last_name"
                  [class.is-invalid]="submitted && f['last_name'].errors">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-12">
                <label class="form-label">Nom d'utilisateur *</label>
                <input type="text" class="form-control" formControlName="username"
                  [class.is-invalid]="submitted && f['username'].errors"
                  [readonly]="editMode">
                <div class="invalid-feedback">Requis.</div>
              </div>
              <div class="col-12">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email">
              </div>
              <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input type="text" class="form-control" formControlName="phone">
              </div>
              <div class="col-md-6">
                <label class="form-label">Rôle *</label>
                <select class="form-select" formControlName="role"
                  [class.is-invalid]="submitted && f['role'].errors">
                  <option value="">-- Choisir --</option>
                  <option value="employee">Employé</option>
                  <option value="manager">Gestionnaire</option>
                  <option value="admin">Administrateur</option>
                </select>
                <div class="invalid-feedback">Requis.</div>
              </div>

              <ng-container *ngIf="!editMode">
                <div class="col-12">
                  <label class="form-label">Mot de passe *</label>
                  <div class="input-group">
                    <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                      formControlName="password"
                      [class.is-invalid]="submitted && f['password'].errors">
                    <button type="button" class="btn btn-outline-secondary"
                      (click)="showPwd = !showPwd">
                      <i class="bi" [class.bi-eye]="!showPwd"
                        [class.bi-eye-slash]="showPwd"></i>
                    </button>
                    <div class="invalid-feedback">Minimum 6 caractères.</div>
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Confirmer le mot de passe *</label>
                  <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                    formControlName="password2"
                    [class.is-invalid]="submitted && f['password2'].errors">
                  <div class="invalid-feedback">Requis.</div>
                  <div class="text-danger small mt-1"
                    *ngIf="form.errors?.['mismatch'] && submitted">
                    Les mots de passe ne correspondent pas.
                  </div>
                </div>
              </ng-container>
            </div>

            <div class="alert alert-danger mt-3" *ngIf="serverErrors">
              <div *ngFor="let err of serverErrorList">{{ err }}</div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-success" [disabled]="saving">
                <span class="spinner-border spinner-border-sm me-1" *ngIf="saving"></span>
                {{ editMode ? 'Enregistrer' : 'Créer' }}
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
    .user-avatar-sm {
      width: 36px; height: 36px; border-radius: 50%;
      background: #2d5a27; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
    }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 20px; }
    .modal-panel { background: #fff; border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; }
    .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-header-custom h5 { margin: 0; font-weight: 700; }
    .modal-body-custom { padding: 24px; overflow-y: auto; }
    .btn-close-custom { background: none; border: none; font-size: 1.1rem; cursor: pointer; }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false; saving = false; showModal = false;
  editMode = false; submitted = false; showPwd = false;
  error = ''; serverErrors: any = null; editId: number | null = null;
  form!: FormGroup;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.buildForm();
    this.load();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  buildForm(u?: User): void {
    this.form = this.fb.group({
      first_name: [u?.first_name || '', Validators.required],
      last_name: [u?.last_name || '', Validators.required],
      username: [u?.username || '', Validators.required],
      email: [u?.email || ''],
      phone: [u?.phone || ''],
      role: [u?.role || '', Validators.required],
      password: ['', this.editMode ? [] : [Validators.required, Validators.minLength(6)]],
      password2: ['', this.editMode ? [] : Validators.required],
    }, { validators: this.editMode ? null : this.passwordMatch });
  }

  passwordMatch(group: FormGroup) {
    const p1 = group.get('password')?.value;
    const p2 = group.get('password2')?.value;
    return p1 === p2 ? null : { mismatch: true };
  }

  get f() { return this.form.controls; }

  load(): void {
    this.loading = true;
    this.http.get<User[]>(`${environment.apiUrl}/auth/users/`).subscribe({
      next: data => { this.users = data; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  openModal(u?: User): void {
    this.editMode = !!u;
    this.editId = u?.id || null;
    this.submitted = false;
    this.serverErrors = null;
    this.showPwd = false;
    this.buildForm(u);
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;
    this.serverErrors = null;

    console.log("erreur server ")

    if (this.editMode && this.editId) {
      const { password, password2, ...data } = this.form.value;
      this.http.patch<User>(
        `${environment.apiUrl}/auth/users/${this.editId}/`, data
      ).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.load(); },
        error: err => { this.saving = false; this.serverErrors = err.error; }
      });
    } else {
      this.authService.register(this.form.value).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.load(); },
        error: err => { this.saving = false; this.serverErrors = err.error; }
      });
    }
  }

  deleteUser(u: User): void {
    if (!confirm(`Supprimer l'utilisateur "${u.username}" ?`)) return;
    this.http.delete(`${environment.apiUrl}/auth/users/${u.id}/`).subscribe({
      next: () => this.load(),
      error: () => this.error = 'Erreur lors de la suppression.'
    });
  }

  initials(u: User): string {
    return ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase()
      || u.username[0].toUpperCase();
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      manager: 'Gestionnaire',
      employee: 'Employé'
    };
    return labels[role] || role;
  }

  roleClass(role: string): string {
    const classes: Record<string, string> = {
      admin: 'bg-danger',
      manager: 'bg-warning text-dark',
      employee: 'bg-success'
    };
    return classes[role] || 'bg-secondary';
  }

  get serverErrorList(): string[] {
    if (!this.serverErrors) return [];
    return Object.entries(this.serverErrors).map(([k, v]) => `${k} : ${v}`);
  }
}