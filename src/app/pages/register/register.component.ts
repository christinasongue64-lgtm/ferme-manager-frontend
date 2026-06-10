import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-brand">
          <span class="login-icon">🐄</span>
          <h2>Créer un compte</h2>
          <p class="text-muted">Ferme Manager — Nouvel utilisateur</p>
        </div>

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
                [class.is-invalid]="submitted && f['username'].errors">
              <div class="invalid-feedback">Requis.</div>
            </div>
            <div class="col-12">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" formControlName="email">
            </div>
            <div class="col-12">
              <label class="form-label">Téléphone</label>
              <input type="text" class="form-control" formControlName="phone">
            </div>
            <div class="col-12">
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
            <div class="col-12">
              <label class="form-label">Mot de passe *</label>
              <div class="input-group">
                <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                  formControlName="password"
                  [class.is-invalid]="submitted && f['password'].errors">
                <button type="button" class="btn btn-outline-secondary"
                  (click)="showPwd = !showPwd">
                  <i class="bi" [class.bi-eye]="!showPwd" [class.bi-eye-slash]="showPwd"></i>
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
              <div class="text-danger small mt-1" *ngIf="form.errors?.['mismatch'] && submitted">
                Les mots de passe ne correspondent pas.
              </div>
            </div>
          </div>

          <!-- Erreurs serveur -->
          <div class="alert alert-danger mt-3" *ngIf="serverErrors">
            <div *ngFor="let err of serverErrorList">{{ err }}</div>
          </div>

          <!-- Succès -->
          <div class="alert alert-success mt-3" *ngIf="success">
            ✅ Compte créé avec succès !
            <a routerLink="/login" class="alert-link ms-2">Se connecter</a>
          </div>

          <button type="submit" class="btn btn-success w-100 mt-3" [disabled]="loading">
            <span class="spinner-border spinner-border-sm me-2" *ngIf="loading"></span>
            <span *ngIf="!loading">Créer le compte</span>
            <span *ngIf="loading">Création en cours…</span>
          </button>

          <div class="text-center mt-3">
            <a routerLink="/login" class="text-muted small">
              Déjà un compte ? Se connecter
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a2e1a 0%, #2d5a27 100%);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .login-card {
      background: #fff; border-radius: 16px; padding: 40px;
      width: 100%; max-width: 500px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-brand { text-align: center; margin-bottom: 28px; }
    .login-icon { font-size: 2.5rem; }
    .login-brand h2 { font-weight: 700; color: #1a2e1a; margin-top: 8px; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  success = false;
  showPwd = false;
  serverErrors: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: [''],
      phone: [''],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', Validators.required],
    }, { validators: this.passwordMatch });
  }

  passwordMatch(group: FormGroup) {
    const p1 = group.get('password')?.value;
    const p2 = group.get('password2')?.value;
    return p1 === p2 ? null : { mismatch: true };
  }

  get f() { return this.form.controls; }

  get serverErrorList(): string[] {
    if (!this.serverErrors) return [];
    return Object.entries(this.serverErrors).map(([k, v]) => `${k} : ${v}`);
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverErrors = null;
    if (this.form.invalid) return;

    this.loading = true;
    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.loading = false;
        this.serverErrors = err.error;
      }
    });
  }
}