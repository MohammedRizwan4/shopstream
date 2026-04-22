import { add, money, type Money } from '../shared/money.js';
import { err, ok, type Result } from '../shared/result.js';
import type { ProductRepo } from '../catalog/repo.js';
import type { UserRepo } from '../users/repo.js';
import { priceLine, type PricedLine } from '../pricing/calc.js';

export interface CartLine {
  productId: string;
  quantity: number;
}

export class Cart {
  private readonly lines = new Map<string, CartLine>();

  constructor(
    readonly userId: string,
    private readonly products: ProductRepo,
  ) {}

  addItem(productId: string, quantity = 1): Result<CartLine> {
    const product = this.products.byId(productId);
    if (!product || !product.active) return err('cart/unknown-product', productId);
    if (quantity < 1 || quantity > 99) return err('cart/bad-quantity', String(quantity));
    const existing = this.lines.get(productId);
    const line = { productId, quantity: (existing?.quantity ?? 0) + quantity };
    this.lines.set(productId, line);
    return ok(line);
  }

  priced(): PricedLine[] {
    const out: PricedLine[] = [];
    for (const line of this.lines.values()) {
      const product = this.products.byId(line.productId);
      if (product) out.push(priceLine(product, line.quantity));
    }
    return out;
  }

  subtotal(): Money {
    return this.priced().reduce((sum, l) => add(sum, l.gross), money(0));
  }
}

export class CartService {
  private readonly carts = new Map<string, Cart>();

  constructor(
    private readonly users: UserRepo,
    private readonly products: ProductRepo,
  ) {}

  cartFor(userId: string): Result<Cart> {
    if (!this.users.byId(userId)) return err('cart/unknown-user', userId);
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = new Cart(userId, this.products);
      this.carts.set(userId, cart);
    }
    return ok(cart);
  }
}
