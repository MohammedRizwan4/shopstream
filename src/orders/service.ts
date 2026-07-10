import type { Result } from '../shared/result.js';
import type { Clock } from '../shared/clock.js';
import type { UserRepo } from '../users/repo.js';
import type { Cart } from '../cart/cart.js';
import type { Order, OrderStatus } from './model.js';
import type { OrderRepo } from './repo.js';
import { OrderPlacement } from './placement.js';
import { OrderTransitions } from './transitions.js';
import { OrderQueries } from './queries.js';

/**
 * Facade kept for existing callers; the behaviour now lives in
 * placement / transitions / queries.
 */
export class OrderService {
  private readonly placement: OrderPlacement;
  private readonly transitions: OrderTransitions;
  readonly queries: OrderQueries;

  constructor(repo: OrderRepo, users: UserRepo, clock: Clock) {
    this.placement = new OrderPlacement(repo, users, clock);
    this.transitions = new OrderTransitions(repo);
    this.queries = new OrderQueries(repo);
  }

  placeFromCart(cart: Cart, promoCode?: string): Result<Order> {
    return this.placement.place(cart, promoCode);
  }

  transition(orderId: string, to: OrderStatus): Result<Order> {
    return this.transitions.to(orderId, to);
  }
}
