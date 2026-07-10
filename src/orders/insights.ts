import type { User } from '../users/model.js';
import type { UserRepo } from '../users/repo.js';
import type { OrderRepo } from './repo.js';

export interface CustomerInsight {
  user: Pick<User, 'id' | 'displayName' | 'marketingOptIn'>;
  orderCount: number;
  lifetimeValueMinor: number;
  repeatBuyer: boolean;
}

/** Support-dashboard rollup of a customer's ordering behaviour. */
export function insightFor(userId: string, users: UserRepo, orders: OrderRepo): CustomerInsight | null {
  const user = users.byId(userId);
  if (!user) return null;
  const history = orders.byUser(userId);
  const lifetime = history
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + o.total.amount, 0);
  return {
    user: { id: user.id, displayName: user.displayName, marketingOptIn: user.marketingOptIn },
    orderCount: history.length,
    lifetimeValueMinor: lifetime,
    repeatBuyer: history.length >= 2,
  };
}
