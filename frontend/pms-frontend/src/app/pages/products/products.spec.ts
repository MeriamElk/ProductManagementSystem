import { TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products';
import { ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';

import { TranslateModule } from '@ngx-translate/core';

describe('ProductsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductsComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: ProductService,
          useValue: {
            products: () => ({
              subscribe: () => {},
            }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            logout: () => {},
            isLoggedIn: () => true,
            currentUser: null,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
