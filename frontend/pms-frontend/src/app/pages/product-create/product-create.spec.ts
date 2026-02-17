import { TestBed } from '@angular/core/testing';
import { ProductCreateComponent } from './product-create';
import { ProductService } from '../../core/product.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductCreateComponent', () => {
  let apiMock: any;
  let authMock: any;
  let routerMock: any;

  beforeEach(async () => {
    apiMock = {
      create: vi.fn(),
    };

    authMock = {
      logout: vi.fn(),
    };

    routerMock = {
      navigateByUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductCreateComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: apiMock },
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductCreateComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render basic UI elements (title and buttons)', () => {
    const fixture = TestBed.createComponent(ProductCreateComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Create Product');
    expect(el.textContent).toContain('Back');
    expect(el.textContent).toContain('Cancel');
    expect(el.textContent).toContain('Save');
  });

  it('form should be invalid initially (required + minlength)', () => {
    const fixture = TestBed.createComponent(ProductCreateComponent);
    const component = fixture.componentInstance;

    // name required + minlength(2)
    component.form.setValue({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
    });

    expect(component.form.invalid).toBe(true);
  });

  it('should not call create when form invalid and should mark controls as touched', () => {
    const fixture = TestBed.createComponent(ProductCreateComponent);
    const component = fixture.componentInstance;

    // form invalid because name is empty
    component.form.setValue({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
    });

    expect(component.form.invalid).toBe(true);

    component.save();

    expect(apiMock.create).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('should call api.create and navigate to /products on success', () => {
    const fixture = TestBed.createComponent(ProductCreateComponent);
    const component = fixture.componentInstance;

    apiMock.create.mockReturnValue(of({}));

    component.form.setValue({
      name: 'Product 1',
      description: 'desc',
      price: 10,
      quantity: 5,
    });

    component.save();

    expect(apiMock.create).toHaveBeenCalledTimes(1);

    const args = apiMock.create.mock.calls[0][0];
    expect(args).toEqual({
      name: 'Product 1',
      description: 'desc',
      price: 10,
      quantity: 5,
    });

    expect(component.loading).toBe(false);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products');
  });

  it('should logout and redirect to /login on unauthorized error', () => {
    const fixture = TestBed.createComponent(ProductCreateComponent);
    const component = fixture.componentInstance;

    // Force error callback synchronously
    apiMock.create.mockReturnValue({
      subscribe: ({ error }: any) => {
        error({ message: '401 Unauthorized' });
        return { unsubscribe() {} };
      },
    });

    component.form.setValue({
      name: 'Product 1',
      description: '',
      price: 10,
      quantity: 5,
    });

    component.save();

    expect(authMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(component.loading).toBe(false);
  });

  it('cancel should navigate back to /products', () => {
    const fixture = TestBed.createComponent(ProductCreateComponent);
    const component = fixture.componentInstance;

    component.cancel();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products');
  });
});
