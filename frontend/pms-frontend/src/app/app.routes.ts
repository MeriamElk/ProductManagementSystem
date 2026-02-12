import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products').then(m => m.ProductsComponent),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./pages/product-create/product-create').then(m => m.ProductCreateComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./pages/product-edit/product-edit').then(m => m.ProductEditComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'products' },
];
