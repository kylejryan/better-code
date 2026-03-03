---
title: Follow the Optimization Hierarchy — Eliminate Work Before Optimizing It
impact: HIGH
impactDescription: 10-100x gains from eliminating work vs 2-5x from micro-optimizations
tags: optimization, performance, caching, batching, hierarchy
---

## Follow the Optimization Hierarchy — Eliminate Work Before Optimizing It

The hierarchy: (1) Don't do it — remove unnecessary work entirely. (2) Do it fewer times — cache, batch, deduplicate. (3) Better algorithm. (4) Better data structures. (5) Closer to hardware — last resort, not first.

**Incorrect (optimizing work that shouldn't exist):**

```typescript
// Fetches user data for every single item in a loop (N+1 problem)
async function enrichOrders(orders: Order[]): Promise<EnrichedOrder[]> {
  const results: EnrichedOrder[] = [];
  for (const order of orders) {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [order.userId]);
    const address = await db.query("SELECT * FROM addresses WHERE user_id = $1", [order.userId]);
    results.push({ ...order, user: user.rows[0], address: address.rows[0] });
  }
  return results; // 200 orders = 400 queries. "Let's add connection pooling!" Wrong fix.
}
```

**Correct (eliminate unnecessary work, then batch the rest):**

```typescript
async function enrichOrders(orders: Order[]): Promise<EnrichedOrder[]> {
  if (orders.length === 0) return []; // Step 1: Don't do unnecessary work

  // Step 2: Do it fewer times — batch into single queries
  const userIds = [...new Set(orders.map((o) => o.userId))]; // Deduplicate
  const [users, addresses] = await Promise.all([
    db.query("SELECT * FROM users WHERE id = ANY($1)", [userIds]),
    db.query("SELECT * FROM addresses WHERE user_id = ANY($1)", [userIds]),
  ]);

  // Step 4: Better data structure — O(1) lookup instead of O(n) scan
  const userMap = new Map(users.rows.map((u) => [u.id, u]));
  const addressMap = new Map(addresses.rows.map((a) => [a.user_id, a]));

  return orders.map((order) => ({
    ...order,
    user: userMap.get(order.userId)!,
    address: addressMap.get(order.userId)!,
  }));
}
// 200 orders = 2 queries. No micro-optimization needed.
```

Profile before optimizing. Your intuition about what's slow is probably wrong. Measure. But also don't pessimize — choosing O(n²) when O(n) is equally simple is not caution, it's negligence.
