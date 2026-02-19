import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of, firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { setToken, clearToken } from './auth-token';

function base64Url(input: string): string {
  const base64 =
    // @ts-expect-error – mocking private method for test
    typeof Buffer !== 'undefined'
      ? // @ts-expect-error – mocking private method for test
        Buffer.from(input, 'utf-8').toString('base64')
      : btoa(input);

  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeFakeJwt(expSecondsFromNow: number): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      userId: 1,
      username: 'user1',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
    })
  );
  const signature = 'signature';
  return `${header}.${payload}.${signature}`;
}

describe('AuthService', () => {
  let service: AuthService;

  const apolloMock = {
    mutate: vi.fn(),
    client: {
      resetStore: vi.fn(),
    },
  };

  beforeEach(() => {
    apolloMock.mutate.mockReset();
    apolloMock.client.resetStore.mockReset();

    clearToken();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Apollo, useValue: apolloMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should store token on login success', async () => {
    apolloMock.mutate.mockReturnValue(
      of({
        data: {
          login: {
            token: makeFakeJwt(60),
            user: { id: '1', username: 'user1', role: 'USER' },
          },
        },
      })
    );

    const result = await firstValueFrom(service.login('user1', 'password123'));

    expect(result).toBe(true);

    expect(service.isLoggedIn()).toBe(true); 
  });

  it('should clear token on logout', async () => {
    setToken(makeFakeJwt(60));

    apolloMock.client.resetStore.mockReturnValue(Promise.resolve());

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(apolloMock.client.resetStore).toHaveBeenCalled();
  });

  it('should return true for isLoggedIn if token exists', () => {
    setToken(makeFakeJwt(60));
    expect(service.isLoggedIn()).toBe(true);

    clearToken();
    expect(service.isLoggedIn()).toBe(false);
  });
});
