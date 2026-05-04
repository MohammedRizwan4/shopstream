import type { Money } from '../shared/money.js';

export interface ChargeRequest {
  reference: string;
  amount: Money;
  cardToken: string;
}

export interface ChargeOutcome {
  transactionId: string;
  approved: boolean;
  declineReason?: string;
}

export interface PaymentGateway {
  charge(request: ChargeRequest): Promise<ChargeOutcome>;
  refund(transactionId: string, amount: Money): Promise<ChargeOutcome>;
}

/** Deterministic fake gateway: declines tokens ending in "00". */
export class FakeGateway implements PaymentGateway {
  private seq = 0;

  async charge(request: ChargeRequest): Promise<ChargeOutcome> {
    this.seq += 1;
    const approved = !request.cardToken.endsWith('00');
    return {
      transactionId: `txn_${String(this.seq).padStart(6, '0')}`,
      approved,
      declineReason: approved ? undefined : 'issuer declined',
    };
  }

  async refund(transactionId: string, _amount: Money): Promise<ChargeOutcome> {
    return { transactionId, approved: true };
  }
}
