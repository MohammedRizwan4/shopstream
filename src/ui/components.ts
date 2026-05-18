import { format, type Money } from '../shared/money.js';
import type { Product } from '../catalog/product.js';

/** Server-rendered HTML fragments used by the storefront shell. */

export function productCard(product: Product): string {
  return [
    '<article class="card">',
    `  <h3>${escapeHtml(product.name)}</h3>`,
    `  <p>${escapeHtml(product.description)}</p>`,
    `  <strong>${format(product.basePrice)}</strong>`,
    '</article>',
  ].join('\n');
}

export function priceTag(value: Money, struck?: Money): string {
  const current = `<span class="price">${format(value)}</span>`;
  if (!struck) return current;
  return `<s>${format(struck)}</s> ${current}`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
