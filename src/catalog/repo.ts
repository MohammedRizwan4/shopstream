import type { Product, ProductId } from './product.js';

export interface ProductRepo {
  byId(id: ProductId): Product | undefined;
  bySku(sku: string): Product | undefined;
  allActive(): readonly Product[];
  save(product: Product): void;
}

export class InMemoryProductRepo implements ProductRepo {
  private readonly products = new Map<ProductId, Product>();

  byId(id: ProductId): Product | undefined {
    return this.products.get(id);
  }

  bySku(sku: string): Product | undefined {
    for (const p of this.products.values()) if (p.sku === sku) return p;
    return undefined;
  }

  allActive(): readonly Product[] {
    return [...this.products.values()].filter((p) => p.active);
  }

  save(product: Product): void {
    this.products.set(product.id, product);
  }
}
