import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({
      AUTH: {
        LOGIN_TITLE: 'Login',
        USERNAME: 'Username',
        PASSWORD: 'Password',
        LOGIN: 'Login',
      },
      COMMON: {
        SUBMIT: 'Submit',
      },
    });
  }
}

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
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
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
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('form should be invalid initially', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('should disable button if form invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();

    // Angular Material peut gérer l'état via aria-disabled
    const ariaDisabled = button!.getAttribute('aria-disabled');
    const isDisabled = ariaDisabled === 'true' || button!.disabled === true;

    expect(isDisabled).toBe(true);
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

  it('should handle login error correctly', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    authMock.login.mockReturnValue({
      subscribe: ({ error }: any) => {
        error({ message: '401 Invalid credentials' });
        return { unsubscribe() {} };
      },
    });

    component.form.setValue({
      username: 'user1',
      password: 'wrong',
    });

    component.submit();

    expect(authMock.login).toHaveBeenCalledWith('user1', 'wrong');
    expect(component.loading).toBe(false);
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });
});
