import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { map } from 'rxjs/operators';
import { setToken, clearToken, getToken } from './auth-token';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user { id username role }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apollo = inject(Apollo);

  isLoggedIn(): boolean {
    return !!getToken();
  }

  login(username: string, password: string) {
    return this.apollo.mutate<{ login: { token: string } }>({
      mutation: LOGIN_MUTATION,
      variables: { username, password },
      fetchPolicy: 'no-cache',
    }).pipe(
      map(res => {
        const token = res.data?.login?.token;
        if (!token) throw new Error('No token returned');
        setToken(token);
        return true;
      })
    );
  }

  logout(): void {
    clearToken();
    // clean cache (optionnel mais recommandé)
    this.apollo.client.resetStore().catch(() => {});
  }
}
