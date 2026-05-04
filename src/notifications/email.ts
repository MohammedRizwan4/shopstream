import { format } from '../shared/money.js';
import type { Order } from '../orders/model.js';
import type { User } from '../users/model.js';

interface OutboundEmail {
  to: string;
  subject: string;
  body: string;
}

const outbox: OutboundEmail[] = [];

export function sendOrderConfirmation(user: User, order: Order): void {
  const lines = order.lines
    .map((l) => `  ${l.quantity} × ${l.name} — ${format(l.gross)}`)
    .join('\n');
  outbox.push({
    to: user.email,
    subject: `Order ${order.id} confirmed`,
    body: `Hi ${user.displayName},\n\n${lines}\n\nTotal: ${format(order.total)}\n`,
  });
}

export function sendTrackingNotice(to: string, trackingCode: string, carrier: string): void {
  outbox.push({
    to,
    subject: `Your parcel is on its way (${carrier})`,
    body: `Track it with code ${trackingCode}.`,
  });
}

export function pendingEmails(): readonly OutboundEmail[] {
  return outbox;
}
