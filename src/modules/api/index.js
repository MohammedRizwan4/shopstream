// api — HTTP layer. Routes requests to domain modules; owns no business logic.
const http = require('http');
const orders = require('../orders');
const catalog = require('../catalog');
const reviews = require('../reviews');

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/products') {
        return json(res, 200, catalog.listProducts());
      }
      if (req.method === 'POST' && req.url === '/orders') {
        const { customerEmail, items } = await readBody(req);
        return json(res, 201, orders.placeOrder(customerEmail, items));
      }
      if (req.method === 'POST' && req.url === '/reviews') {
        const { sku, rating, text } = await readBody(req);
        return json(res, 201, reviews.addReview(sku, rating, text));
      }
      return json(res, 404, { error: 'Not found' });
    } catch (err) {
      return json(res, 400, { error: err.message });
    }
  });
}

module.exports = { createServer };
