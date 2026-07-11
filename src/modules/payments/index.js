// payments — charge and refund handling. Leaf module: depends on nothing.
const charges = new Map();
let nextChargeId = 1;

function charge(orderId, amount) {
  if (amount <= 0) throw new Error('Charge amount must be positive');
  const id = `ch_${nextChargeId++}`;
  charges.set(id, { id, orderId, amount, status: 'captured' });
  return charges.get(id);
}

function refund(chargeId) {
  const existing = charges.get(chargeId);
  if (!existing) throw new Error(`Unknown charge: ${chargeId}`);
  existing.status = 'refunded';
  return existing;
}

module.exports = { charge, refund };
