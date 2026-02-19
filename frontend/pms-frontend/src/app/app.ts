import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from './core/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('pms-frontend');

  constructor(private productService: ProductService) {}

  testApi() {
    this.productService.getProductsOnce().subscribe({
      next: (products) => {
        console.log('PRODUCTS:', products);
        alert('Check console (F12) : PRODUCTS');
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        alert('API ERROR (F12 console)');
      },
    });
  }
}
