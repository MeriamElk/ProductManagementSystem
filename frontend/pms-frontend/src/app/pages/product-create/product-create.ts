import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-create.html',
})
export class ProductCreateComponent {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  saving = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const v = this.form.getRawValue();

    this.productService.create({
      name: v.name!,
      description: v.description || null,
      price: Number(v.price),
      quantity: Number(v.quantity),
    }).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Product created successfully', 'Close', { duration: 2000 });
        this.router.navigateByUrl('/products');
      },
      error: (err: any) => {
        this.saving = false;
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

  cancel() {
    this.router.navigateByUrl('/products');
  }
}
