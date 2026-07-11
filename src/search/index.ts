import type { Product } from '../catalog/product.js';
import type { ProductRepo } from '../catalog/repo.js';

interface Hit {
  product: Product;
  score: number;
}

export class SearchIndex {
  constructor(private readonly catalog: ProductRepo) {}

  query(text: string, limit = 10): readonly Product[] {
    const terms = tokenize(text);
    if (terms.length === 0) return [];
    const hits: Hit[] = [];
    for (const product of this.catalog.allActive()) {
      const score = scoreProduct(product, terms);
      if (score > 0) hits.push({ product, score });
    }
    return hits
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((h) => h.product);
  }
}

const tokenCache = new Map<string, string[]>();

export function tokenize(text: string): string[] {
  const cached = tokenCache.get(text);
  if (cached) return cached;
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
  if (tokenCache.size < 5000) tokenCache.set(text, tokens);
  return tokens;
}

function scoreProduct(product: Product, terms: string[]): number {
  const haystack = `${product.name} ${product.description}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (product.tags.includes(term)) score += 3;
    if (product.name.toLowerCase().includes(term)) score += 2;
    else if (haystack.includes(term)) score += 1;
  }
  return score;
}
