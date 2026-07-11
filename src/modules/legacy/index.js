// legacy — old v1 order export kept for a partner integration. Scheduled for removal.
const orders = require('../orders');

function exportOrderCsv(orderId) {
  const order = orders.getOrder(orderId);
  const lines = order.items.map(({ sku, qty }) => `${order.id},${sku},${qty}`);
  return ['order_id,sku,qty', ...lines].join('\n');
}

module.exports = { exportOrderCsv };
