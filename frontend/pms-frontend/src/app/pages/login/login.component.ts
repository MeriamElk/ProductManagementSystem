import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatButtonModule }          from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule }            from '@angular/material/icon';

import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      background: #f0f2f8;
    }

    /* Left decorative panel */
    .login-left {
      flex: 1;
      display: none;
      background: linear-gradient(160deg, #3730a3 0%, #4f46e5 45%, #7c3aed 100%);
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 24px;
      padding: 48px;
      color: #fff;
    }

    @media (min-width: 900px) {
      .login-left { display: flex; }
    }

    .login-left-brand {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -.04em;
    }

    .login-left-tagline {
      font-size: 1.05rem;
      opacity: .75;
      text-align: center;
      max-width: 280px;
      line-height: 1.6;
    }

    .login-left-dots {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .login-left-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,.35);
    }
    .login-left-dots span:first-child {
      background: #fff;
      width: 24px;
      border-radius: 4px;
    }

    /* Right form panel */
    .login-right {
      width: 100%;
      max-width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      background: #fff;
    }

    @media (min-width: 900px) {
      .login-right { min-height: 100vh; }
    }

    .login-box {
      width: 100%;
      max-width: 360px;
    }

    .login-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 4px 14px rgba(79,70,229,.35);
    }

    .login-badge mat-icon {
      color: #fff;
      font-size: 1.3rem;
      width: 1.3rem;
      height: 1.3rem;
    }

    .login-heading {
      font-size: 1.7rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -.03em;
      margin: 0 0 6px;
    }

    .login-subheading {
      font-size: .9rem;
      color: #64748b;
      margin: 0 0 32px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .login-form mat-form-field {
      width: 100%;
    }

    .login-btn {
      height: 46px !important;
      font-size: .95rem !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      margin-top: 8px;
      background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
      box-shadow: 0 4px 14px rgba(79,70,229,.30) !important;
      transition: box-shadow .2s, opacity .2s !important;
    }

    .login-btn:not(:disabled):hover {
      box-shadow: 0 6px 20px rgba(79,70,229,.40) !important;
      opacity: .95 !important;
    }

    .login-btn:disabled {
      background: #e2e8f0 !important;
      box-shadow: none !important;
      color: #94a3b8 !important;
    }

    .login-btn .btn-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #fff;
    }

    .login-btn:disabled .btn-inner {
      color: #94a3b8;
    }

    .login-footer {
      margin-top: 28px;
      text-align: center;
      font-size: .78rem;
      color: #94a3b8;
    }
  `],
  template: `
  <div class="login-page">

    <!-- Left decorative panel (visible ≥ 900px) -->
    <div class="login-left">
      <div style="font-size:3.5rem">📦</div>
      <div class="login-left-brand">PMS</div>
      <p class="login-left-tagline">
        Manage your products efficiently with our intuitive platform.
      </p>
      <div class="login-left-dots">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="login-right">
      <div class="login-box">

        <div class="login-badge">
          <mat-icon>inventory_2</mat-icon>
        </div>

        <h1 class="login-heading">Sign in</h1>
        <p class="login-subheading">Enter your credentials to access PMS</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">

          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <mat-icon matPrefix style="opacity:.45;margin-right:6px;font-size:1.1rem">person_outline</mat-icon>
            <input matInput formControlName="username" autocomplete="username" />
            <mat-error *ngIf="form.controls.username.touched && form.controls.username.hasError('required')">
              Username is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix style="opacity:.45;margin-right:6px;font-size:1.1rem">lock_outline</mat-icon>
            <input matInput [type]="showPwd ? 'text' : 'password'"
                   formControlName="password" autocomplete="current-password" />
            <button mat-icon-button matSuffix type="button"
                    (click)="showPwd = !showPwd" tabindex="-1">
              <mat-icon style="font-size:1.1rem;opacity:.5">
                {{ showPwd ? 'visibility_off' : 'visibility' }}
              </mat-icon>
            </button>
            <mat-error *ngIf="form.controls.password.touched && form.controls.password.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>

          <button mat-raised-button type="submit" class="login-btn"
                  [disabled]="form.invalid || loading"
                  style="width:100%">
            <span class="btn-inner">
              <ng-container *ngIf="!loading">
                <mat-icon style="font-size:1.1rem;width:1.1rem;height:1.1rem">login</mat-icon>
                Sign in
              </ng-container>
              <ng-container *ngIf="loading">
                <mat-progress-spinner mode="indeterminate" diameter="18" strokeWidth="3"
                  style="display:inline-block"></mat-progress-spinner>
                Signing in…
              </ng-container>
            </span>
          </button>

        </form>

        <div class="login-footer">
          Product Management System &copy; 2026
        </div>

      </div>
    </div>

  </div>
  `,
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading = false;
  showPwd = false;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const { username, password } = this.form.getRawValue();

    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/products');
      },
      error: (err) => {
        this.loading = false;
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('invalid credentials') || msg.includes('401')) {
          this.snack.open('Invalid username or password', 'Close', { duration: 3000 });
          return;
        }
        if (msg.includes('network') || msg.includes('failed to fetch')) {
          this.snack.open('Server unreachable — check your connection', 'Close', { duration: 3000 });
          return;
        }
        this.snack.open('Login failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}