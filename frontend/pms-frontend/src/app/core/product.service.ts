import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private apollo: Apollo) {}

  getProducts() {
    return this.apollo.query({
      query: gql`
        query {
          products {
            id
            name
            price
            quantity
          }
        }
      `,
    });
  }
}
