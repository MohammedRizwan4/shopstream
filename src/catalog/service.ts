import { err, ok, type Result } from '../shared/result.js';
import { nextId } from '../shared/ids.js';
import type { Money } from '../shared/money.js';
import type { Product } from './product.js';
import type { ProductRepo } from './repo.js';

export interface NewProduct {
  sku: string;
  name: string;
  description?: string;
  basePrice: Money;
  taxCategory?: Product['taxCategory'];
  tags?: string[];
}

export class CatalogService {
  constructor(private readonly repo: ProductRepo) {}

  addProduct(input: NewProduct): Result<Product> {
    if (!/^[A-Z0-9-]{4,}$/.test(input.sku)) {
      return err('catalog/bad-sku', `sku must be uppercase alphanumeric: ${input.sku}`);
    }
    if (this.repo.bySku(input.sku)) return err('catalog/duplicate-sku', input.sku);
    const product: Product = {
      id: nextId('prd'),
      sku: input.sku,
      name: input.name.trim(),
      description: input.description ?? '',
      basePrice: input.basePrice,
      taxCategory: input.taxCategory ?? 'standard',
      tags: input.tags ?? [],
      active: true,
    };
    this.repo.save(product);
    return ok(product);
  }

  retire(id: string): Result<Product> {
    const product = this.repo.byId(id);
    if (!product) return err('catalog/not-found', id);
    const retired = { ...product, active: false };
    this.repo.save(retired);
    return ok(retired);
  }
}
