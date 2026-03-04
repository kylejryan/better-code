---
title: Enforce Correctness, Clarity, and Changeability Simultaneously
impact: CRITICAL
impactDescription: Eliminates entire classes of bugs, reduces onboarding time, minimizes change blast radius
tags: correctness, clarity, changeability, invariants, philosophy
---

## Enforce Correctness, Clarity, and Changeability Simultaneously

Every piece of code must satisfy three invariants: correctness (does exactly what it claims, handles edge cases, fails explicitly), clarity (understandable in 30 seconds by an unfamiliar engineer), and changeability (blast radius proportional to semantic scope). These reinforce each other — they are not in tension.

**Incorrect (sacrifices clarity and changeability for "working" code):**

```typescript
// Handles orders but mixes concerns, swallows errors, and uses magic values
function proc(d: any): any {
  if (d.t === 1) {
    const r = d.items.reduce((a: number, b: any) => a + b.p * b.q, 0);
    if (r > 0) {
      d.total = r;
      d.status = 2;
      db.save(d);
      return d;
    }
  }
  return null; // Silent failure — caller doesn't know what went wrong
}
```

**Correct (all three invariants satisfied):**

```typescript
// Correctness: explicit types, exhaustive handling, typed errors
// Clarity: descriptive names, single responsibility, readable flow
// Changeability: adding a new order type doesn't require modifying this function
function calculateOrderTotal(order: Order): Result<OrderTotal, OrderError> {
  if (order.items.length === 0) {
    return err(new EmptyOrderError(order.id));
  }

  const total = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  if (total <= 0) {
    return err(new InvalidTotalError(order.id, total));
  }

  return ok({ orderId: order.id, total, itemCount: order.items.length });
}
```

Correctness without clarity creates code only the author can maintain. Clarity without changeability creates beautiful code that's expensive to evolve. All three must be present.
