import type { User } from '../users/model.js';
import type { Order } from './model.js';
import { auditTrailFor } from './audit.js';

export interface TimelineEvent {
  at: Date;
  label: string;
}

/** Chronological story of an order, rendered for the account page. */
export function timelineFor(order: Order, owner: User): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { at: order.placedAt, label: `${owner.displayName} placed the order` },
  ];
  for (const entry of auditTrailFor(order.id)) {
    if (entry.action === 'transition') {
      events.push({ at: entry.at, label: `status changed: ${entry.detail}` });
    }
  }
  return events.sort((a, b) => a.at.getTime() - b.at.getTime());
}
