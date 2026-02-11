import { Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from './core/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('pms-frontend');

  constructor(private productService: ProductService) {}

  testApi() {
    this.productService.getProducts().subscribe({
      next: (result) => {
        console.log('✅ API RESPONSE:', result);
        alert('✅ Check console (F12) : API RESPONSE');
      },
      error: (err) => {
        console.error('❌ API ERROR:', err);
        alert('❌ API ERROR (F12 console)');
      },
    });
  }
}
