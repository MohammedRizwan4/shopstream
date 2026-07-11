// analytics — refund and revenue metrics for the finance dashboard.
const events = [];

function track(event, payload) {
  events.push({ event, payload, at: new Date().toISOString() });
}

function refundRate() {
  const refunds = events.filter((e) => e.event === 'order.refunded').length;
  const orders = events.filter((e) => e.event === 'order.placed').length;
  return orders === 0 ? 0 : refunds / orders;
}

module.exports = { track, refundRate };
