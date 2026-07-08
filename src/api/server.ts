import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { systemClock } from '../shared/clock.js';
import { InMemoryUserRepo } from '../users/repo.js';
import { UserService } from '../users/service.js';
import { AuthService } from '../auth/service.js';
import { InMemoryProductRepo } from '../catalog/repo.js';
import { CatalogService } from '../catalog/service.js';
import { SearchIndex } from '../search/index.js';
import { ReviewService } from '../reviews/service.js';
import { CartService } from '../cart/cart.js';
import { InMemoryOrderRepo } from '../orders/repo.js';
import { OrderService } from '../orders/service.js';
import { FakeGateway } from '../payments/gateway.js';
import { PaymentService } from '../payments/service.js';
import { StockLedger } from '../inventory/stock.js';
import { WishlistService } from '../wishlist/service.js';
import { buildRoutes, type RouteTable } from './routes.js';

export interface App {
  routes: RouteTable;
  listen(port: number): void;
}

export function createApp(): App {
  const users = new InMemoryUserRepo();
  const products = new InMemoryProductRepo();
  const orders = new InMemoryOrderRepo();

  const routes = buildRoutes({
    users: new UserService(users, systemClock),
    auth: new AuthService(users, systemClock),
    catalog: new CatalogService(products),
    search: new SearchIndex(products),
    reviews: new ReviewService(users, products),
    carts: new CartService(users, products),
    orders: new OrderService(orders, users, systemClock),
    payments: new PaymentService(new FakeGateway(), users),
    stock: new StockLedger(products),
    wishlist: new WishlistService(users, products, systemClock),
  });

  return {
    routes,
    listen(port: number) {
      createServer((req: IncomingMessage, res: ServerResponse) => {
        const handler = routes[`${req.method} ${req.url?.split('?')[0]}`];
        if (!handler) {
          res.writeHead(404).end();
          return;
        }
        handler(req, res);
      }).listen(port);
    },
  };
}
