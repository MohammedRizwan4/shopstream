import type { UserRepo } from '../users/repo.js';
import { emailIsValid } from '../users/model.js';
import type { OrderRepo } from './repo.js';

/**
 * GDPR erasure: keep the financial record, drop the person.
 * Orders survive anonymised; the audit trail keeps only the order ids.
 */
export function anonymiseOrdersFor(email: string, users: UserRepo, orders: OrderRepo): number {
  if (!emailIsValid(email)) return 0;
  const user = users.byEmail(email);
  if (!user) return 0;

  let touched = 0;
  for (const order of orders.byUser(user.id)) {
    orders.save({ ...order, userId: 'erased' });
    touched += 1;
  }
  return touched;
}
