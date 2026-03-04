---
title: Prefer Declarative Over Imperative — Describe What, Not How
impact: MEDIUM-HIGH
impactDescription: Eliminates mutable state, makes data flow visible, enables reusable predicates
tags: declarative, imperative, functional, data-flow, leverage
---

## Prefer Declarative Over Imperative — Describe What, Not How

Declarative code is shorter, more readable, and easier to optimize. It eliminates mutable state, makes the data flow visible, and each predicate is reusable.

**Incorrect (imperative — tells the computer how step by step):**

```typescript
// Imperative: mutable state, hidden data flow, no reusable parts
function getActiveHighValueOrders(orders: Order[]): OrderSummary[] {
  const results: OrderSummary[] = [];
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].status === "active") {
      if (orders[i].total > 1000) {
        const summary: OrderSummary = {
          id: orders[i].id,
          customer: orders[i].customerName,
          total: orders[i].total,
          label: orders[i].total > 5000 ? "premium" : "standard",
        };
        results.push(summary);
      }
    }
  }
  results.sort((a, b) => b.total - a.total);
  return results;
}
```

**Correct (declarative — describes the result, not the steps):**

```typescript
// Reusable predicates — used across the codebase
const isActive = (order: Order) => order.status === "active";
const isHighValue = (order: Order) => order.total > 1000;
const byTotalDesc = (a: OrderSummary, b: OrderSummary) => b.total - a.total;

function toSummary(order: Order): OrderSummary {
  return {
    id: order.id,
    customer: order.customerName,
    total: order.total,
    label: order.total > 5000 ? "premium" : "standard",
  };
}

// Declarative pipeline — what we want, not how to get it
const getActiveHighValueOrders = (orders: Order[]): OrderSummary[] =>
  orders
    .filter(isActive)
    .filter(isHighValue)
    .map(toSummary)
    .sort(byTotalDesc);

// Each predicate is reusable in other contexts
// isActive is used in dashboards, reports, notifications, etc.
```

Configuration as extension point: when behavior varies, prefer configuration over code branches. Adding a new provider should be a dict entry, not a new conditional branch.