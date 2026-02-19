import { TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products';
import { ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({
      PRODUCTS: {
        TITLE: 'Products',
        NEW: 'New',
        EMPTY: 'Empty',
        TABLE: {
          NAME: 'Name',
          PRICE: 'Price',
          QUANTITY: 'Quantity',
          ACTIONS: 'Actions',
        },
      },
      AUTH: { LOGOUT: 'Logout' },
      COMMON: { EDIT: 'Edit', DELETE: 'Delete' },
      LAYOUT: {
        MENU_PRODUCTS: 'Products',
        THEME: 'Theme',
        DARK: 'Dark',
        LIGHT: 'Light',
        LANGUAGE: 'Language',
      },
    });
  }
}

describe('ProductsComponent', () => {
  let apiMock: any;
  let authMock: any;
  let routerMock: any;

  beforeEach(async () => {
    apiMock = {
      getProductsOnce: vi.fn(),
      delete: vi.fn(),
    };

    authMock = {
      logout: vi.fn(),
    };

    routerMock = {
      navigateByUrl: vi.fn(),
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductsComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: apiMock },
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    apiMock.getProductsOnce.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load products on init', () => {
    apiMock.getProductsOnce.mockReturnValue(
      of([{ id: 1, name: 'P1', description: null, price: 10, quantity: 5 }])
    );

    const fixture = TestBed.createComponent(ProductsComponent);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(apiMock.getProductsOnce).toHaveBeenCalledTimes(1);
    expect(component.dataSource.data.length).toBe(1);
    expect(component.count).toBe(1);
    expect(component.dataSource.data[0].name).toBe('P1');
  });

  it('goCreate should navigate to /products/new', () => {
    apiMock.getProductsOnce.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ProductsComponent);
    const component = fixture.componentInstance;

    component.goCreate();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products/new');
  });

  it('goEdit should navigate to /products/:id/edit', () => {
    apiMock.getProductsOnce.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ProductsComponent);
    const component = fixture.componentInstance;

    component.goEdit(7);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products', 7, 'edit']);
  });

  it('logout should logout and redirect to /login', () => {
    apiMock.getProductsOnce.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ProductsComponent);
    const component = fixture.componentInstance;

    component.logout();

    expect(authMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should logout and redirect to /login on unauthorized while loading', () => {
    apiMock.getProductsOnce.mockReturnValue(
      throwError(() => ({ message: '401 Unauthorized' }))
    );

    const fixture = TestBed.createComponent(ProductsComponent);
    const component = fixture.componentInstance;

    component.loadProducts();

    expect(authMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
