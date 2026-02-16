import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of, firstValueFrom } from 'rxjs';

import { ProductService, ProductInput } from './product.service';

describe('ProductService (GraphQL)', () => {
  let service: ProductService;

  const apolloMock = {
    query: vi.fn(),
    watchQuery: vi.fn(),
    mutate: vi.fn(),
  };

  beforeEach(() => {
    apolloMock.query.mockReset();
    apolloMock.watchQuery.mockReset();
    apolloMock.mutate.mockReset();

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: Apollo, useValue: apolloMock },
      ],
    });

    service = TestBed.inject(ProductService);
  });

  it('should call products query (getProductsOnce)', async () => {
    apolloMock.query.mockReturnValue(
      of({
        data: {
          products: [{ id: 1, name: 'P1', description: null, price: 10, quantity: 5 }],
        },
      })
    );

    const result = await firstValueFrom(service.getProductsOnce());

    expect(apolloMock.query).toHaveBeenCalledTimes(1);

    const args = apolloMock.query.mock.calls[0][0];
    expect(args.fetchPolicy).toBe('network-only');
    expect(args.errorPolicy).toBe('all');
    expect(args.query).toBeTruthy();

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('P1');
  });

  // ✅ Bonus (pas obligatoire pour US-13.3, mais utile)
  it('should call products watchQuery (watchProducts)', async () => {
    apolloMock.watchQuery.mockReturnValue({
      valueChanges: of({
        data: {
          products: [{ id: 1, name: 'P1', description: null, price: 10, quantity: 5 }],
        },
      }),
    });

    const result = await firstValueFrom(service.watchProducts());

    expect(apolloMock.watchQuery).toHaveBeenCalledTimes(1);

    const args = apolloMock.watchQuery.mock.calls[0][0];
    expect(args.fetchPolicy).toBe('cache-and-network');
    expect(args.errorPolicy).toBe('all');
    expect(args.query).toBeTruthy();

    const data = (result as any).data;
    expect(data.products[0].id).toBe(1);
  });

  it('should call create mutation', async () => {
    apolloMock.mutate.mockReturnValue(
      of({
        data: {
          createProduct: { id: 1, name: 'P1', description: null, price: 10, quantity: 5 },
        },
      })
    );

    const input: ProductInput = { name: 'P1', description: null, price: 10, quantity: 5 };
    const created = await firstValueFrom(service.create(input));

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);

    const args = apolloMock.mutate.mock.calls[0][0];
    expect(args.mutation).toBeTruthy();
    expect(args.errorPolicy).toBe('all');
    expect(args.variables).toEqual({ input });

    expect(created.id).toBe(1);
    expect(created.name).toBe('P1');
  });

  it('should call update mutation', async () => {
    apolloMock.mutate.mockReturnValue(
      of({
        data: {
          updateProduct: { id: 1, name: 'P1-upd', description: 'x', price: 12, quantity: 7 },
        },
      })
    );

    const id = 1;
    const input: ProductInput = { name: 'P1-upd', description: 'x', price: 12, quantity: 7 };

    const updated = await firstValueFrom(service.update(id, input));

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);

    const args = apolloMock.mutate.mock.calls[0][0];
    expect(args.mutation).toBeTruthy();
    expect(args.errorPolicy).toBe('all');
    expect(args.variables).toEqual({ id, input });

    expect(updated.name).toBe('P1-upd');
    expect(updated.price).toBe(12);
  });

  it('should call delete mutation', async () => {
    apolloMock.mutate.mockReturnValue(
      of({
        data: {
          deleteProduct: true,
        },
      })
    );

    const id = 1;
    const ok = await firstValueFrom(service.delete(id));

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);

    const args = apolloMock.mutate.mock.calls[0][0];
    expect(args.mutation).toBeTruthy();
    expect(args.errorPolicy).toBe('all');
    expect(args.variables).toEqual({ id });

    expect(ok).toBe(true);
  });
});
