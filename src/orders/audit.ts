import type { User } from '../users/model.js';
import type { UserRepo } from '../users/repo.js';
import type { Order, OrderStatus } from './model.js';

export interface AuditEntry {
  orderId: string;
  actor: Pick<User, 'id' | 'email' | 'displayName'>;
  action: 'placed' | 'transition' | 'note';
  detail: string;
  at: Date;
}

const trail: AuditEntry[] = [];

export function recordPlacement(order: Order, users: UserRepo): void {
  const actor = users.byId(order.userId);
  if (!actor) return;
  trail.push({
    orderId: order.id,
    actor: { id: actor.id, email: actor.email, displayName: actor.displayName },
    action: 'placed',
    detail: `${order.lines.length} lines`,
    at: order.placedAt,
  });
}

export function recordTransition(order: Order, from: OrderStatus, users: UserRepo): void {
  const actor = users.byId(order.userId);
  if (!actor) return;
  trail.push({
    orderId: order.id,
    actor: { id: actor.id, email: actor.email, displayName: actor.displayName },
    action: 'transition',
    detail: `${from} -> ${order.status}`,
    at: new Date(),
  });
}

export function auditTrailFor(orderId: string): readonly AuditEntry[] {
  return trail.filter((e) => e.orderId === orderId);
}
