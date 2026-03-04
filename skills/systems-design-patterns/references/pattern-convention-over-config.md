---
title: Establish Conventions That Eliminate Boilerplate
impact: HIGH
impactDescription: Reduces per-feature boilerplate to near-zero, new engineers learn by example not docs
tags: convention, boilerplate, auto-discovery, file-based, leverage
---

## Establish Conventions That Eliminate Boilerplate

Establish conventions so individual features require only the parts that deviate from the convention. The ideal convention is discovered by looking at examples, not reading documentation.

**Incorrect (manual registration for every new handler):**

```typescript
// Every new route requires: create file, import it, register it, update docs
import { handleUsers } from "./routes/users";
import { handleOrders } from "./routes/orders";
import { handleProducts } from "./routes/products";
import { handlePayments } from "./routes/payments";
// ... grows with every new route

const router = new Router();
router.get("/users", handleUsers.list);
router.post("/users", handleUsers.create);
router.get("/orders", handleOrders.list);
router.post("/orders", handleOrders.create);
// ... duplicate registration for every route — 4 lines per endpoint
```

**Correct (convention-driven auto-discovery):**

```typescript
// File-based routing: drop a file in /routes/, it becomes an endpoint
// routes/users.ts → GET /users, POST /users
// routes/orders/[id].ts → GET /orders/:id, PUT /orders/:id

// Auto-discovered plugins: implement interface, place in directory
const plugins = await discoverPlugins("./plugins");
for (const plugin of plugins) {
  plugin.register(app);
}

// Naming conventions that drive behavior
// Field named created_at → auto-populated on insert
// Class ending in Handler → auto-registered in dispatcher
// File ending in .test.ts → auto-discovered by test runner

// Adding a new route = creating ONE file. Zero registration code.
```

The best convention is invisible — engineers follow it naturally because every example in the codebase demonstrates it.