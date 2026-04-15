import type { Money } from '../shared/money.js';

export type ProductId = string;

export interface Product {
  id: ProductId;
  sku: string;
  name: string;
  description: string;
  basePrice: Money;
  taxCategory: 'standard' | 'reduced' | 'exempt';
  tags: readonly string[];
  active: boolean;
}
