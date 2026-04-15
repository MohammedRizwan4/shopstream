import { err, ok, type Result } from '../shared/result.js';
import { nextId } from '../shared/ids.js';
import type { UserRepo } from '../users/repo.js';
import type { ProductRepo } from '../catalog/repo.js';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
}

export class ReviewService {
  private readonly reviews: Review[] = [];

  constructor(
    private readonly users: UserRepo,
    private readonly products: ProductRepo,
  ) {}

  submit(userId: string, productId: string, rating: number, body: string): Result<Review> {
    if (!this.users.byId(userId)) return err('review/unknown-user', userId);
    if (!this.products.byId(productId)) return err('review/unknown-product', productId);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return err('review/bad-rating', `rating must be 1-5, got ${rating}`);
    }
    const review: Review = {
      id: nextId('rev'),
      productId,
      userId,
      rating: rating as Review['rating'],
      body: body.slice(0, 2000),
    };
    this.reviews.push(review);
    return ok(review);
  }

  averageFor(productId: string): number | null {
    const relevant = this.reviews.filter((r) => r.productId === productId);
    if (relevant.length === 0) return null;
    return relevant.reduce((sum, r) => sum + r.rating, 0) / relevant.length;
  }
}
