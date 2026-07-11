// ui — server-rendered storefront page. Reads product data from catalog.
const catalog = require('../catalog');

function renderHomePage() {
  const rows = catalog
    .listProducts()
    .map((p) => `<li>${p.name} — $${p.price.toFixed(2)} (${p.stock} in stock)</li>`)
    .join('\n');
  return `<html><body><h1>ShopStream</h1><ul>${rows}</ul></body></html>`;
}

module.exports = { renderHomePage };
