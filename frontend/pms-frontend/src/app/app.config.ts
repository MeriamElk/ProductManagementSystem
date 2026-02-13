import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { getToken, clearToken } from './core/auth-token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const router = inject(Router);

      const http = httpLink.create({
        uri: environment.graphqlUrl,
      });

      const authLink = setContext((_, context: any) => {
        const token = getToken();
        return {
          headers: {
            ...(context?.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
      });

      const errorLink = onError((err: any) => {
        const msg = JSON.stringify(err).toLowerCase();

        if (
          msg.includes('401') ||
          msg.includes('unauthorized') ||
          msg.includes('signature has expired')
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
