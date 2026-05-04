import { err, ok, type Result } from '../shared/result.js';
import type { ProductRepo } from '../catalog/repo.js';
import { scheduleReplenishment } from '../shipping/service.js';

interface StockLevel {
  onHand: number;
  reserved: number;
}

const REORDER_THRESHOLD = 5;

export class StockLedger {
  private readonly levels = new Map<string, StockLevel>();

  constructor(private readonly catalog: ProductRepo) {}

  receive(productId: string, quantity: number): Result<StockLevel> {
    if (!this.catalog.byId(productId)) return err('stock/unknown-product', productId);
    const level = this.levels.get(productId) ?? { onHand: 0, reserved: 0 };
    level.onHand += quantity;
    this.levels.set(productId, level);
    return ok(level);
  }

  reserve(productId: string, quantity: number): Result<StockLevel> {
    const level = this.levels.get(productId);
    if (!level) return err('stock/none', productId);
    if (level.onHand - level.reserved < quantity) {
      return err('stock/insufficient', `${productId}: need ${quantity}`);
    }
    level.reserved += quantity;
    if (level.onHand - level.reserved <= REORDER_THRESHOLD) {
      scheduleReplenishment(productId, REORDER_THRESHOLD * 4);
    }
    return ok(level);
  }

  available(productId: string): number {
    const level = this.levels.get(productId);
    return level ? level.onHand - level.reserved : 0;
  }
}
