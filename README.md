# 🛍️ ShopStream

A modular e-commerce backend. Every domain concern lives in its own module under
`src/`, wired together only by the `api` composition root.

## Architecture rules

- `payments` must never depend on `ui`
- nothing imports `api` — it is the composition root
- `shared` is a dependency-free kernel

Rules are enforced on every PR by [ArchXray](https://github.com/MohammedRizwan4/arch-xray).

## Modules

`api` · `auth` · `users` · `catalog` · `search` · `reviews` · `pricing` ·
`promotions` · `cart` · `orders` · `payments` · `billing` · `inventory` ·
`shipping` · `notifications` · `ui` · `shared`
