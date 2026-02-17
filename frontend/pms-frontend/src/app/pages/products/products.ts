import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { finalize } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';

import { Product, ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslateModule,
    MatIconModule,
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  private productsApi = inject(ProductService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = false;
  deleting = false;

  dataSource = new MatTableDataSource<Product>([]);
  columns = ['name', 'price', 'quantity', 'actions'];

  get count(): number {
    return this.dataSource.data.length;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;

    this.productsApi
      .getProductsOnce()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (products) => {
          this.dataSource.data = products;
        },
        error: (err: any) => {
          if (this.isUnauthorized(err)) {
            this.auth.logout();
            this.router.navigateByUrl('/login');
            return;
          }
          this.snack.open('Failed to load products', 'Close', { duration: 2500 });
        },
      });
  }

  goCreate(): void {
    this.router.navigateByUrl('/products/new');
  }

  goEdit(id: number): void {
    this.router.navigate(['/products', id, 'edit']);
  }

  async confirmDelete(p: Product): Promise<void> {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, { data: { name: p.name } });
    const confirmed = await import('rxjs').then(({ firstValueFrom }) => firstValueFrom(ref.afterClosed()));
    if (!confirmed) return;

    this.deleting = true;

    this.productsApi
      .delete(p.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          this.snack.open('Product deleted', 'Close', { duration: 2000 });
          this.loadProducts();
        },
        error: () => {
          this.snack.open('Delete failed', 'Close', { duration: 2500 });
        },
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private isUnauthorized(err: any): boolean {
    const msg = (err?.message || '').toLowerCase();
    return msg.includes('401') || msg.includes('unauthorized');
  }
}
