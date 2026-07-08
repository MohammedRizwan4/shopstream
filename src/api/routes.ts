import type { IncomingMessage, ServerResponse } from 'node:http';
import type { UserService } from '../users/service.js';
import type { AuthService } from '../auth/service.js';
import type { CatalogService } from '../catalog/service.js';
import type { SearchIndex } from '../search/index.js';
import type { ReviewService } from '../reviews/service.js';
import type { CartService } from '../cart/cart.js';
import type { OrderService } from '../orders/service.js';
import type { PaymentService } from '../payments/service.js';
import type { StockLedger } from '../inventory/stock.js';
import type { WishlistService } from '../wishlist/service.js';

export interface Services {
  users: UserService;
  auth: AuthService;
  catalog: CatalogService;
  search: SearchIndex;
  reviews: ReviewService;
  carts: CartService;
  orders: OrderService;
  payments: PaymentService;
  stock: StockLedger;
  wishlist: WishlistService;
}

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;
export type RouteTable = Record<string, Handler>;

export function buildRoutes(services: Services): RouteTable {
  return {
    'GET /health': (_req, res) => json(res, 200, { status: 'ok' }),
    'GET /search': (req, res) => {
      const query = new URL(req.url ?? '', 'http://x').searchParams.get('q') ?? '';
      json(res, 200, services.search.query(query));
    },
    'POST /users': withBody((body, res) => {
      const result = services.users.register(body.email, body.displayName);
      json(res, result.ok ? 201 : 422, result);
    }),
    'POST /login': withBody((body, res) => {
      const result = services.auth.login(body.email);
      json(res, result.ok ? 200 : 401, result);
    }),
  };
}

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function withBody(handle: (body: any, res: ServerResponse) => void): Handler {
  return (req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        handle(JSON.parse(Buffer.concat(chunks).toString() || '{}'), res);
      } catch {
        json(res, 400, { error: 'invalid JSON' });
      }
    });
  };
}
