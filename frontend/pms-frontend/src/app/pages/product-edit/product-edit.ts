import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  templateUrl: './product-edit.html',
})
export class ProductEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  id = Number(this.route.snapshot.paramMap.get('id'));
  loading = true;
  notFound = false;
  saving = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.productService.getProductById(this.id).subscribe({
      next: (p: any) => {
        this.loading = false;
        this.form.patchValue({
          name: p.name,
          description: p.description ?? '',
          price: p.price,
          quantity: p.quantity,
        });
      },
      error: (err: any) => {
        this.loading = false;
        const msg = (err?.message || '').toLowerCase();

        if (msg.includes('404') || msg.includes('not found')) {
          this.notFound = true;
          return;
        }
        if (msg.includes('401') || msg.includes('unauthorized')) {
          this.auth.logout();
          this.router.navigateByUrl('/login');
          return;
        }

        this.snack.open('Update failed', 'Close', { duration: 2500 });
      },
    });
  }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const v = this.form.getRawValue();

    this.productService.update(this.id, {
      name: v.name!,
      description: v.description || null,
      price: Number(v.price),
      quantity: Number(v.quantity),
    }).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Product updated successfully', 'Close', { duration: 2000 });
        this.router.navigateByUrl('/products');
      },
      error: (err) => {
        this.saving = false;
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('401') || msg.includes('unauthorized')) {
          this.auth.logout();
          this.router.navigateByUrl('/login');
          return;
        }
        this.snack.open('Update failed', 'Close', { duration: 2500 });
      },
    });
  }

  cancel() {
    this.router.navigateByUrl('/products');
  }
}
