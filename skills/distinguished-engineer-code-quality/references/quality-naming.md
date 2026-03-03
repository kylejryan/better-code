---
title: Use Names That Communicate Intent at Every Level
impact: CRITICAL
impactDescription: Reduces code reading time by 40-60%, eliminates "what does this do?" questions
tags: naming, readability, intent, self-documenting, code-quality
---

## Use Names That Communicate Intent at Every Level

Names are the primary documentation of code. Functions use verb phrases describing action and scope. Variables use noun phrases describing the contained value. Booleans read as assertions. Types describe domain concepts. Constants describe meaning, not value.

**Incorrect (names that require reading the implementation to understand):**

```typescript
function proc(d: any[], f: boolean): any[] {
  const r: any[] = [];
  for (let i = 0; i < d.length; i++) {
    if (f) {
      if (d[i].s === 1) r.push(d[i]);
    } else {
      if (d[i].s !== 3) r.push(d[i]);
    }
  }
  return r;
}

const n = 3; // Three what?
const flag = true; // Flag for what?
const data = getStuff(); // What stuff?
class UserManager {} // Manager of what operations?
```

**Correct (names that make the code self-documenting):**

```typescript
function filterOrdersByStatus(
  orders: Order[],
  includeActiveOnly: boolean
): Order[] {
  if (includeActiveOnly) {
    return orders.filter((order) => order.status === OrderStatus.Active);
  }
  return orders.filter((order) => order.status !== OrderStatus.Cancelled);
}

const MAX_RETRY_ATTEMPTS = 3;
const shouldRetry = attempts < MAX_RETRY_ATTEMPTS;
const activeOrders = fetchOrdersByCustomer(customerId);
class PaymentProcessor {} // Clear: processes payments
```

Avoid abbreviations. `ctx`, `req`, `res` are acceptable in their canonical domains (HTTP handlers). `auth_mgr` is not. If you can't name a function without "and," it does too much.
