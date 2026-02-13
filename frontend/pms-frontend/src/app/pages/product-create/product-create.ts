import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  templateUrl: './product-create.html',
  styleUrls: ['./product-create.css'],
})
export class ProductCreateComponent {
  private fb = inject(FormBuilder);
  private api = inject(ProductService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const v = this.form.getRawValue();
    this.api
      .create({
        name: v.name.trim(),
        description: v.description?.trim() || null,
        price: Number(v.price),
        quantity: Number(v.quantity),
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.open('Product created successfully', 'Close', { duration: 2000 });
          this.router.navigateByUrl('/products');
        },
        error: (err: any) => {
          this.loading = false;

          const msg = (err?.message || '').toLowerCase();
          if (msg.includes('401') || msg.includes('unauthorized')) {
            this.auth.logout();
            this.router.navigateByUrl('/login');
            return;
          }

          this.snack.open('Create product failed', 'Close', { duration: 2500 });
        },
      });
  }

  cancel(): void {
    this.router.navigateByUrl('/products');
  }
}
