import type { User } from '../users/model.js';
import type { Order } from './model.js';

/** CSV export for finance — one row per order line. */
export function exportOrdersCsv(orders: readonly Order[], owner: User): string {
  const rows = [['order_id', 'customer', 'product', 'qty', 'gross_minor', 'status']];
  for (const order of orders) {
    for (const line of order.lines) {
      rows.push([
        order.id,
        owner.email,
        line.name,
        String(line.quantity),
        String(line.gross.amount),
        order.status,
      ]);
    }
  }
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

function csvEscape(field: string): string {
  return /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
}
