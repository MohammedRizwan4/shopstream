import { err, ok, type Result } from '../shared/result.js';
import type { Clock } from '../shared/clock.js';
import type { UserRepo } from '../users/repo.js';
import type { ProductRepo } from '../catalog/repo.js';
import type { Product } from '../catalog/product.js';
import { InMemoryWishlistRepo, type WishlistEntry } from './repo.js';

export class WishlistService {
  private readonly repo = new InMemoryWishlistRepo();

  constructor(
    private readonly users: UserRepo,
    private readonly products: ProductRepo,
    private readonly clock: Clock,
  ) {}

  save(userId: string, productId: string): Result<WishlistEntry> {
    if (!this.users.byId(userId)) return err('wishlist/unknown-user', userId);
    const product = this.products.byId(productId);
    if (!product || !product.active) return err('wishlist/unknown-product', productId);
    const entry: WishlistEntry = { userId, productId, addedAt: this.clock.now() };
    this.repo.add(entry);
    return ok(entry);
  }

  drop(userId: string, productId: string): void {
    this.repo.remove(userId, productId);
  }

  productsFor(userId: string): Product[] {
    const out: Product[] = [];
    for (const entry of this.repo.forUser(userId)) {
      const product = this.products.byId(entry.productId);
      if (product?.active) out.push(product);
    }
    return out;
  }
}
