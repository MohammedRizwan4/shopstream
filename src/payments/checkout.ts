import { err, ok, type Result } from '../shared/result.js';
import { pushToast } from '../ui/toast.js';
import type { PaymentReceipt } from './service.js';
import { PaymentService } from './service.js';

/**
 * One-click express checkout: charge the stored card for the user's
 * latest order without going through the multi-step flow.
 */
export class ExpressCheckout {
  constructor(private readonly payments: PaymentService) {}

  async payNow(orderId: string, userId: string, storedCardToken: string): Promise<Result<PaymentReceipt>> {
    if (!storedCardToken) return err('express/no-card', 'no stored card on file');

    const receipt = await this.payments.payOrder(orderId, userId, storedCardToken);
    if (receipt.ok) {
      pushToast('success', `Payment confirmed — invoice ${receipt.value.invoice.number}`);
    } else {
      pushToast('error', receipt.error.message);
    }
    return receipt;
  }
}
