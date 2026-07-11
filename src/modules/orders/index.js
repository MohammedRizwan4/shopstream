// orders — order lifecycle. Coordinates catalog, payments, and notifications.
const catalog = require('../catalog');
const payments = require('../payments');
const notifications = require('../notifications');
const analytics = require('../analytics');

const orders = new Map();
let nextOrderId = 1;

function placeOrder(customerEmail, items) {
  if (!items.length) throw new Error('Order must contain at least one item');

  let total = 0;
  for (const { sku, qty } of items) {
    const product = catalog.reserveStock(sku, qty);
    total += product.price * qty;
  }

  const id = `ord_${nextOrderId++}`;
  const payment = payments.charge(id, total);
  const order = { id, customerEmail, items, total, paymentId: payment.id, status: 'confirmed' };
  orders.set(id, order);

  notifications.sendEmail(customerEmail, `Order ${id} confirmed`, `Total: $${total.toFixed(2)}`);
  analytics.track('order.placed', { orderId: id, total });
  return order;
}

function cancelOrder(orderId) {
  const order = orders.get(orderId);
  if (!order) throw new Error(`Unknown order: ${orderId}`);
  payments.refund(order.paymentId);
  order.status = 'cancelled';
  analytics.track('order.refunded', { orderId });
  notifications.sendEmail(order.customerEmail, `Order ${orderId} cancelled`, 'Your refund is on the way.');
  return order;
}

function getOrder(orderId) {
  const order = orders.get(orderId);
  if (!order) throw new Error(`Unknown order: ${orderId}`);
  return order;
}

module.exports = { placeOrder, cancelOrder, getOrder };
