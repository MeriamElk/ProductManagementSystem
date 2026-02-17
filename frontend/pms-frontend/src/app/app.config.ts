import { ApplicationConfig, APP_INITIALIZER, NgZone, inject, importProvidersFrom } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, HttpClient, HttpHeaders } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { MatSnackBar } from '@angular/material/snack-bar';

import { ThemeService } from './core/theme.service';
import { LanguageService } from './core/language.service';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { getToken, clearToken, hasValidToken } from './core/auth-token';

type TranslationObject = Record<string, any>;

export function translateLoaderFactory(http: HttpClient): TranslateLoader {
  return {
    getTranslation: (lang: string): Observable<TranslationObject> => {
      const v = Date.now();
      return http.get<TranslationObject>(`assets/i18n/${lang}.json?v=${v}`);
    },
  };
}

export function initThemeFactory() {
  return () => inject(ThemeService).init();
}

export function initLangFactory() {
  return () => inject(LanguageService).init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),

    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: translateLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),

    { provide: APP_INITIALIZER, useFactory: initThemeFactory, multi: true },
    { provide: APP_INITIALIZER, useFactory: initLangFactory, multi: true },

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const router = inject(Router);
      const snack = inject(MatSnackBar);
      const zone = inject(NgZone);

      const http = httpLink.create({ uri: environment.graphqlUrl });

      const authLink = setContext(() => {
        const token = getToken();

        if (token && !hasValidToken()) {
          zone.run(() => {
            clearToken();
            router.navigateByUrl('/login');
          });

          return { headers: new HttpHeaders() };
        }

        return {
          headers: token
            ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
            : new HttpHeaders(),
      };
    });

    const errorLink = onError(({ graphQLErrors, networkError }: any) => {
      const gqlText = (graphQLErrors ?? [])
        .map((e: any) => (e?.message ?? ''))
        .join(' ')
        .toLowerCase();

      const netMsg = (networkError?.message ?? '').toLowerCase();
      const status = Number(networkError?.status ?? networkError?.statusCode ?? 0);

      const isAuthError =
        status === 401 ||
        gqlText.includes('unauthorized') ||
        gqlText.includes('401') ||
        gqlText.includes('jwt') ||
        gqlText.includes('signature') ||
        netMsg.includes('401') ||
        netMsg.includes('unauthorized');

      if (isAuthError) {
        zone.run(() => {
          clearToken();
          router.navigateByUrl('/login');
        });
        return;
      }

      const isForbidden =
        status === 403 ||
        gqlText.includes('forbidden') ||
        gqlText.includes('access denied') ||
        netMsg.includes('403');

      if (isForbidden) {
        zone.run(() => snack.open('Access denied', 'Close', { duration: 2500 }));
        return;
      }

      const isNetworkDown =
        !!networkError &&
        (netMsg.includes('failed to fetch') ||
          netMsg.includes('network') ||
          netMsg.includes('connection') ||
          netMsg.includes('econnrefused'));

      if (isNetworkDown) {
        zone.run(() => snack.open('Server unreachable', 'Close', { duration: 2500 }));
        return;
      }
    });

    return {
      link: errorLink.concat(authLink.concat(http)),
      cache: new InMemoryCache(),
    };
  }),

  ],
};
