import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { take } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Product, ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog';

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

  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  loading = false;
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
    this.cdr.detectChanges();

    this.productsApi
      .getProductsOnce()
      .pipe(take(1))
      .subscribe({
        next: (products) => {
          // ✅ Force Angular to update UI
          this.zone.run(() => {
            console.log('✅ PRODUCTS:', products);
            this.dataSource.data = products ?? [];
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err: any) => {
          this.zone.run(() => {
            console.error('❌ PRODUCTS ERROR:', err);
            this.loading = false;
            this.cdr.detectChanges();

            if (this.isUnauthorized(err)) {
              this.auth.logout();
              this.router.navigateByUrl('/login');
              return;
            }

            this.snack.open('Failed to load products', 'Close', { duration: 2500 });
          });
        },
      });

    // Safety: si pour une raison X ça reste bloqué
    setTimeout(() => {
      if (this.loading) {
        console.warn('⏳ Still loading after 3s -> forcing stop');
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 3000);
  }

  goCreate(): void {
    this.router.navigateByUrl('/products/new');
  }

  goEdit(id: number): void {
    this.router.navigate(['/products', id, 'edit']);
  }

  async confirmDelete(p: Product): Promise<void> {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { name: p.name },
    });

    const confirmed = await import('rxjs').then(({ firstValueFrom }) =>
      firstValueFrom(ref.afterClosed())
    );
    if (!confirmed) return;

    this.productsApi.delete(p.id).subscribe({
      next: () => {
        this.snack.open('Product deleted', 'Close', { duration: 2000 });
        this.loadProducts();
      },
      error: (err: any) => {
        console.error('❌ DELETE ERROR:', err);

        if (this.isForbidden(err)) {
          this.snack.open('You are not allowed to delete products', 'Close', { duration: 2500 });
          return;
        }
        if (this.isUnauthorized(err)) {
          this.auth.logout();
          this.router.navigateByUrl('/login');
          return;
        }
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

  private isForbidden(err: any): boolean {
    const msg = (err?.message || '').toLowerCase();
    return msg.includes('403') || msg.includes('forbidden');
  }
}
