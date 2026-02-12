import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { getToken } from './core/auth-token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const http = httpLink.create({
        uri: environment.graphqlUrl,
      });

      const authLink = new ApolloLink((operation, forward) => {
        const token = getToken();

        operation.setContext(({ headers = {} }: any) => ({
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }));

        return forward ? forward(operation) : null;
      });

      return {
        link: ApolloLink.from([authLink, http]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
