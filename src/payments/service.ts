import { err, ok, type Result } from '../shared/result.js';
import type { UserRepo } from '../users/repo.js';
import { createInvoice, type Invoice } from '../billing/invoice.js';
import type { ChargeOutcome, PaymentGateway } from './gateway.js';

export interface PaymentReceipt {
  outcome: ChargeOutcome;
  invoice: Invoice;
}

export class PaymentService {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly users: UserRepo,
  ) {}

  async payOrder(orderId: string, userId: string, cardToken: string): Promise<Result<PaymentReceipt>> {
    const user = this.users.byId(userId);
    if (!user) return err('payment/unknown-user', userId);

    const invoice = createInvoice(orderId, user.email);
    if (!invoice) return err('payment/no-invoice', `cannot invoice order ${orderId}`);

    const outcome = await this.gateway.charge({
      reference: invoice.number,
      amount: invoice.total,
      cardToken,
    });
    if (!outcome.approved) {
      return err('payment/declined', outcome.declineReason ?? 'declined');
    }
    return ok({ outcome, invoice });
  }
}
