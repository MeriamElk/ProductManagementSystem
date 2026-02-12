import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
  <div class="min-h-screen flex items-center justify-center p-4">
    <mat-card class="w-full max-w-md">
      <mat-card-title class="mb-4">Login</mat-card-title>

      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" autocomplete="username" />
          <mat-error *ngIf="form.controls.username.touched && form.controls.username.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="current-password" />
          <mat-error *ngIf="form.controls.password.touched && form.controls.password.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <button mat-raised-button color="primary" [disabled]="form.invalid || loading">
          <span *ngIf="!loading">Login</span>
          <mat-progress-spinner *ngIf="loading" mode="indeterminate" diameter="18"></mat-progress-spinner>
        </button>
      </form>
    </mat-card>
  </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = false;

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

        // Apollo: "NetworkError" si serveur down, sinon GraphQL errors dans message
        const msg = (err?.message || '').toLowerCase();

        if (msg.includes('invalid credentials') || msg.includes('401')) {
          this.snack.open('Invalid credentials', 'Close', { duration: 2500 });
          return;
        }

        if (msg.includes('network') || msg.includes('failed to fetch')) {
          this.snack.open('Server unreachable', 'Close', { duration: 2500 });
          return;
        }

        this.snack.open('Login failed', 'Close', { duration: 2500 });
      }
    });
  }
}
