import { err, ok, type Result } from '../shared/result.js';
import type { StockLedger } from '../inventory/stock.js';
import type { Order } from './model.js';

/**
 * Reserves stock for every line of an order before it is accepted,
 * so we stop selling items we cannot fulfil.
 */
export function reserveStockFor(order: Order, ledger: StockLedger): Result<Order> {
  const reserved: string[] = [];
  for (const line of order.lines) {
    const result = ledger.reserve(line.productId, line.quantity);
    if (!result.ok) {
      return err(
        'order/out-of-stock',
        `${line.name}: only ${ledger.available(line.productId)} left`,
      );
    }
    reserved.push(line.productId);
  }
  return ok(order);
}
