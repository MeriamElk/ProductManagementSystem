import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { getToken } from './core/auth-token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

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

      return {
        link: authLink.concat(http),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
