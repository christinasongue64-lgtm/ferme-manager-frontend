import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-brand">
          <span class="login-icon">🐄</span>
          <h2>Ferme Manager</h2>
          <p class="text-muted">Système de gestion d'élevage</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Nom d'utilisateur</label>
            <input type="text" class="form-control" formControlName="username"
              [class.is-invalid]="submitted && f['username'].errors" placeholder="votre_identifiant">
            <div class="invalid-feedback" *ngIf="submitted && f['username'].errors?.['required']">
              Le nom d'utilisateur est requis.
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Mot de passe</label>
            <div class="input-group">
              <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                formControlName="password" [class.is-invalid]="submitted && f['password'].errors"
                placeholder="••••••••">
              <button type="button" class="btn btn-outline-secondary" (click)="showPwd = !showPwd">
                <i class="bi" [class.bi-eye]="!showPwd" [class.bi-eye-slash]="showPwd"></i>
              </button>
              <div class="invalid-feedback" *ngIf="submitted && f['password'].errors?.['required']">
                Le mot de passe est requis.
              </div>
            </div>
          </div>

          <div class="alert alert-danger" *ngIf="error">
            <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
          </div>

          <button type="submit" class="btn btn-success w-100" [disabled]="loading">
            <span class="spinner-border spinner-border-sm me-2" *ngIf="loading"></span>
            <span *ngIf="!loading">Se connecter</span>
            <span *ngIf="loading">Connexion en cours…</span>
          </button>
        </form>

        <div class="mt-3 text-center text-muted small">
          Institut Universitaire Saint Jean — 2025-2026
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; background: linear-gradient(135deg, #1a2e1a 0%, #2d5a27 100%);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .login-card {
      background: #fff; border-radius: 16px; padding: 40px;
      width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-brand { text-align: center; margin-bottom: 32px; }
    .login-icon { font-size: 3rem; }
    .login-brand h2 { font-weight: 700; color: #1a2e1a; margin-top: 8px; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPwd = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: err => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Identifiants incorrects. Veuillez réessayer.';
        } else {
          this.error = 'Erreur de connexion. Vérifiez votre réseau.';
        }
      }
    });
  }
}
