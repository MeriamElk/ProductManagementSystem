import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatIconModule,
  ],
  templateUrl: './product-edit.html',
  styleUrls: ['./product-edit.css'],
})
export class ProductEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private api = inject(ProductService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  loading = false;
  notFound = false;

  id = Number(this.route.snapshot.paramMap.get('id'));

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    if (!this.id) {
      this.notFound = true;
      return;
    }

    this.loading = true;

    this.api.getProductById(this.id).subscribe({
      next: (p) => {
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
        if (msg.includes('401') || msg.includes('unauthorized')) {
          this.auth.logout();
          this.router.navigateByUrl('/login');
          return;
        }

        this.notFound = true;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const v = this.form.getRawValue();
    this.api.update(this.id, {
      name: v.name.trim(),
      description: v.description?.trim() || null,
      price: Number(v.price),
      quantity: Number(v.quantity),
    }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Product updated successfully', 'Close', { duration: 2000 });
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

        this.snack.open('Update failed', 'Close', { duration: 2500 });
      },
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/products');
  }
}
