import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { map } from 'rxjs/operators';

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
};

export type ProductInput = {
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
};

const PRODUCTS_QUERY = gql`
  query Products {
    products { id name description price quantity }
  }
`;

const PRODUCT_BY_ID = gql`
  query ProductById($id: Int!) {
    productById(id: $id) { id name description price quantity }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) { id name description price quantity }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: Int!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) { id name description price quantity }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private apollo: Apollo) {}

  // one-shot (stable)
  getProductsOnce() {
    return this.apollo.query<{ products: Product[] }>({
      query: PRODUCTS_QUERY,
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    }).pipe(
      map(r => r.data?.products ?? [])
    );
  }

  // watch (optionnel pour plus tard)
  watchProducts() {
    return this.apollo.watchQuery<{ products: Product[] }>({
      query: PRODUCTS_QUERY,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    }).valueChanges;
  }

  getProductById(id: number) {
    return this.apollo.query<{ productById: Product }>({
      query: PRODUCT_BY_ID,
      variables: { id },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).pipe(
      map(r => {
        const p = r.data?.productById;
        if (!p) throw new Error('Product not found');
        return p;
      })
    );
  }

  create(input: ProductInput) {
    return this.apollo.mutate<{ createProduct: Product }>({
      mutation: CREATE_PRODUCT,
      variables: { input },
      errorPolicy: 'all',
    }).pipe(
      map(r => {
        const p = r.data?.createProduct;
        if (!p) throw new Error('Create failed');
        return p;
      })
    );
  }

  update(id: number, input: ProductInput) {
    return this.apollo.mutate<{ updateProduct: Product }>({
      mutation: UPDATE_PRODUCT,
      variables: { id, input },
      errorPolicy: 'all',
    }).pipe(
      map(r => {
        const p = r.data?.updateProduct;
        if (!p) throw new Error('Update failed');
        return p;
      })
    );
  }

  delete(id: number) {
    return this.apollo.mutate<{ deleteProduct: boolean }>({
      mutation: DELETE_PRODUCT,
      variables: { id },
      errorPolicy: 'all',
    }).pipe(map(r => !!r.data?.deleteProduct));
  }
}
