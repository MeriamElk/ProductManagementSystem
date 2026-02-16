import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';

describe('LoginComponent', () => {
  let authMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authMock = { login: vi.fn() };
    routerMock = { navigateByUrl: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        NoopAnimationsModule, 
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('form should be invalid initially', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('should disable button if form invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('should call auth.login and navigate on success', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    authMock.login.mockReturnValue(of(true));

    component.form.setValue({ username: 'user1', password: 'password123' });
    component.submit();

    expect(authMock.login).toHaveBeenCalledWith('user1', 'password123');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products');
  });

  it('should show snackbar on invalid credentials error', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    const snack = TestBed.inject(MatSnackBar);
    const openSpy = vi.spyOn(snack, 'open');

    authMock.login.mockReturnValue(
        new Observable((subscriber) => {
            subscriber.error({ message: '401 Invalid credentials' });
        })
    );

    component.form.setValue({ username: 'user1', password: 'wrong' });
    component.submit();

    expect(authMock.login).toHaveBeenCalledWith('user1', 'wrong');

    expect(openSpy).toHaveBeenCalledWith(
        'Invalid credentials',
        'Close',
        { duration: 2500 }
    );
  });

});
