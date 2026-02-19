import { Component, inject, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

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
    MatIconModule,
    TranslateModule,
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

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  deleting = false;

  dataSource = new MatTableDataSource<Product>([]);
  columns = ['name', 'price', 'quantity', 'actions'];

  get count(): number {
    return this.dataSource.data.length;
  }

  ngOnInit(): void {
    this.zone.run(() => {
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.zone.run(() => {
      this.loading = true;
      this.cdr.detectChanges();
    });

    this.productsApi.getProductsOnce().subscribe({
      next: (products) => {
        this.zone.run(() => {
          this.dataSource.data = products;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: unknown) => {
        this.zone.run(() => {
          this.loading = false;

          if (this.isUnauthorized(err)) {
            this.auth.logout();
            this.router.navigateByUrl('/login');
            this.cdr.detectChanges();
            return;
          }

          this.snack.open('Failed to load products', 'Close', { duration: 2500 });
          this.cdr.detectChanges();
        });
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

    this.zone.run(() => {
      this.deleting = true;
      this.cdr.detectChanges();
    });

    this.productsApi.delete(p.id).subscribe({
      next: (ok: boolean) => {
        this.zone.run(() => {
          this.deleting = false;

          if (!ok) {
            this.snack.open('You are not allowed to delete products', 'Close', { duration: 2500 });
            this.cdr.detectChanges();
            return;
          }

          this.snack.open('Product deleted', 'Close', { duration: 2000 });
          this.cdr.detectChanges();
          this.loadProducts();
        });
      },
      error: (err: unknown) => {
        this.zone.run(() => {
          this.deleting = false;

          if (this.isUnauthorized(err)) {
            this.auth.logout();
            this.router.navigateByUrl('/login');
            this.cdr.detectChanges();
            return;
          }

          this.snack.open('Delete failed', 'Close', { duration: 2500 });
          this.cdr.detectChanges();
        });
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private isUnauthorized(err: unknown): boolean {
    const msg = this.errorMessage(err);
    return msg.includes('401') || msg.includes('unauthorized');
  }

  private errorMessage(err: unknown): string {
    if (!err) return '';
    if (typeof err === 'string') return err.toLowerCase();

    const anyErr = err as any;
    const msg =
      (anyErr?.message ?? '') +
      ' ' +
      (anyErr?.networkError?.message ?? '') +
      ' ' +
      (anyErr?.error?.message ?? '');

    return String(msg).toLowerCase();
  }
}
