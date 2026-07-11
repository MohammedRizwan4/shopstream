// catalog — product listing and lookup. Leaf module: depends on nothing.
const products = new Map([
  ['sku-001', { sku: 'sku-001', name: 'Mechanical Keyboard', price: 89.0, stock: 12 }],
  ['sku-002', { sku: 'sku-002', name: 'USB-C Hub', price: 39.5, stock: 40 }],
  ['sku-003', { sku: 'sku-003', name: '4K Monitor', price: 349.0, stock: 5 }],
]);

function listProducts() {
  return [...products.values()];
}

function getProduct(sku) {
  const product = products.get(sku);
  if (!product) throw new Error(`Unknown product: ${sku}`);
  return product;
}

function reserveStock(sku, qty) {
  const product = getProduct(sku);
  if (product.stock < qty) throw new Error(`Out of stock: ${sku}`);
  product.stock -= qty;
  return product;
}

module.exports = { listProducts, getProduct, reserveStock };
