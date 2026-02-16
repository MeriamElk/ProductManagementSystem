import { ApplicationConfig, APP_INITIALIZER, inject, importProvidersFrom } from '@angular/core';
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

import { getToken, clearToken } from './core/auth-token';
import { ThemeService } from './core/theme.service';
import { LanguageService } from './core/language.service';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

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

      const http = httpLink.create({ uri: environment.graphqlUrl });

      const authLink = setContext(() => {
        const token = getToken();
        return {
          headers: token
            ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
            : new HttpHeaders(),
        };
      });

      const errorLink = onError(({ graphQLErrors, networkError }: any) => {
        const msg =
          (graphQLErrors?.map((e: any) => e.message).join(' ') ?? '') +
          ' ' +
          (networkError?.message ?? '');

        const low = msg.toLowerCase();

        if (
          low.includes('401') ||
          low.includes('unauthorized') ||
          low.includes('signature has expired')
        ) {
          clearToken();
          router.navigateByUrl('/login');
        }
      });

      return {
        link: errorLink.concat(authLink.concat(http)),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
