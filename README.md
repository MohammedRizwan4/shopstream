# ShopStream + ArchXray

A small modular Node.js e-commerce API, wired up with **ArchXray** — a PR bot that
compares the project's module dependency graph before and after a change and posts
**one diagram** as a PR comment:

- 🟢 added modules/dependencies drawn with green borders and edges
- ⚪ removed ones drawn dashed and ~~crossed out~~
- ⛔ dependencies that violate `arch-rules.json` in red dotted
- 🔄 dependency cycles in orange
- 🔥 node fill shows churn heat (lines touched in the PR)

If the module structure didn't change, the bot stays quiet.

## App layout

```
src/modules/
  api/            HTTP layer → orders, catalog, reviews
  ui/             storefront page → catalog
  orders/         order lifecycle → catalog, payments, notifications
  reviews/        product reviews → catalog
  catalog/        products (leaf)
  payments/       charges & refunds (leaf)
  notifications/  email/sms (leaf)
  legacy/         old CSV export → orders (scheduled for removal)
```

Run the app: `npm install && npm start`, then open http://localhost:3000.

## How ArchXray works

1. **Scan** ([tools/arch-xray/scan.js](tools/arch-xray/scan.js)) — reads every file under
   `src/modules/` at two git refs (via `git show`, no checkout needed) and records an
   edge `A → B` whenever a file in module A imports a file from module B.
2. **Diff** ([tools/arch-xray/diff.js](tools/arch-xray/diff.js)) — added/removed nodes and
   edges, cycle detection (Tarjan SCC), forbidden edges from `arch-rules.json`.
3. **Render** ([tools/arch-xray/render.js](tools/arch-xray/render.js)) — Graphviz dot →
   SVG via `@viz-js/viz` (WASM, no native Graphviz install needed anywhere).
4. **CI** ([.github/workflows/arch-xray.yml](.github/workflows/arch-xray.yml)) — on every PR:
   generate the diff; if `changed`, commit the SVG to the `arch-xray-assets` branch and
   upsert a single sticky comment on the PR. If nothing changed structurally: no comment.

## Run it locally

```bash
# compare your uncommitted working tree against main
npm run arch:diff
# or any two refs
node tools/arch-xray/index.js --base main --head my-branch --out out
```

Open `out/arch-diff.svg`. `out/summary.json` has the machine-readable result
(`changed: false` means the bot would stay quiet).

## Demo script (reproduces the showcase image)

```bash
git checkout -b feature/analytics-refunds
```

1. **Add a module**: create `src/modules/analytics/index.js` and require it from
   `orders` → green node + green edge.
2. **Delete a module**: remove `src/modules/legacy/` → crossed-out node, dashed edges.
3. **Break a rule**: make `payments` require `../ui` → red dotted "forbidden" edge.
4. **Create a cycle**: make `notifications` require `../api` → orange cycle edges.

Push the branch, open a PR, and ArchXray posts the annotated diagram. Fix the
violations, push again — the sticky comment updates in place.

## Notes / limits (POC)

- Modules are top-level directories under `src/modules`; only relative imports are tracked.
- Fork PRs are skipped (the default `GITHUB_TOKEN` can't push the image asset).
- Two PRs publishing assets at the exact same second could race on the assets branch —
  rerun the job if that ever happens.
