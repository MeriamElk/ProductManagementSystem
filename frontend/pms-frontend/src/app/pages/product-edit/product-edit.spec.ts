import { TestBed } from '@angular/core/testing';
import { ProductEditComponent } from './product-edit';
import { ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductEditComponent', () => {
  let apiMock: any;
  let authMock: any;
  let routerMock: any;

  const routeMock = {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'id' ? '1' : null),
      },
    },
  };

  beforeEach(async () => {
    apiMock = {
      getProductById: vi.fn(),
      update: vi.fn(),
    };

    authMock = {
      logout: vi.fn(),
    };

    routerMock = {
      navigateByUrl: vi.fn(),
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductEditComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: apiMock },
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductEditComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load product on init and patch form', () => {
    apiMock.getProductById.mockReturnValue(
      of({ id: 1, name: 'P1', description: 'd', price: 10, quantity: 5 })
    );

    const fixture = TestBed.createComponent(ProductEditComponent);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(apiMock.getProductById).toHaveBeenCalledWith(1);
    expect(component.loading).toBe(false);

    expect(component.form.getRawValue()).toEqual({
      name: 'P1',
      description: 'd',
      price: 10,
      quantity: 5,
    });
  });

  it('should set notFound if id is missing', () => {
    // override route id => 0
    const badRouteMock = {
      snapshot: { paramMap: { get: () => null } },
    };

    TestBed.resetTestingModule();

    return TestBed.configureTestingModule({
      imports: [ProductEditComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: apiMock },
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: badRouteMock },
      ],
    })
      .compileComponents()
      .then(() => {
        const fixture = TestBed.createComponent(ProductEditComponent);
        const component = fixture.componentInstance;

        component.ngOnInit();

        expect(component.notFound).toBe(true);
      });
  });

  it('should not call update when form invalid and should mark touched', () => {
    apiMock.getProductById.mockReturnValue(
      of({ id: 1, name: 'P1', description: '', price: 10, quantity: 5 })
    );

    const fixture = TestBed.createComponent(ProductEditComponent);
    const component = fixture.componentInstance;

    component.ngOnInit();

    // invalid: name empty
    component.form.patchValue({ name: '' });
    expect(component.form.invalid).toBe(true);

    component.save();

    expect(apiMock.update).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('should call update and navigate to /products on success', () => {
    apiMock.getProductById.mockReturnValue(
      of({ id: 1, name: 'P1', description: null, price: 10, quantity: 5 })
    );
    apiMock.update.mockReturnValue(of({}));

    const fixture = TestBed.createComponent(ProductEditComponent);
    const component = fixture.componentInstance;

    component.ngOnInit();

    component.form.setValue({
      name: 'P1-upd',
      description: 'x',
      price: 12,
      quantity: 7,
    });

    component.save();

    expect(apiMock.update).toHaveBeenCalledTimes(1);
    const call = apiMock.update.mock.calls[0];
    expect(call[0]).toBe(1);
    expect(call[1]).toEqual({
      name: 'P1-upd',
      description: 'x',
      price: 12,
      quantity: 7,
    });

    expect(component.loading).toBe(false);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products');
  });

  it('should logout and redirect to /login on unauthorized error (load)', () => {
    apiMock.getProductById.mockReturnValue({
      subscribe: ({ error }: any) => {
        error({ message: '401 Unauthorized' });
        return { unsubscribe() {} };
      },
    });

    const fixture = TestBed.createComponent(ProductEditComponent);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(authMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('cancel should navigate to /products', () => {
    const fixture = TestBed.createComponent(ProductEditComponent);
    const component = fixture.componentInstance;

    component.cancel();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products');
  });
});
