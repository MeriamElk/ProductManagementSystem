import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ProductService } from './core/product.service';
import { AuthService } from './core/auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: ProductService,
          useValue: {
            products: () => ({ subscribe: () => {} }),
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

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
