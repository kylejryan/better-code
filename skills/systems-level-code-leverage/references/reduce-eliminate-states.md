---
title: Eliminate States to Eliminate Code — Make Illegal States Unrepresentable
impact: MEDIUM-HIGH
impactDescription: Each eliminated boolean halves the state space, removing all associated branching and testing
tags: state-reduction, boolean-soup, state-machines, immutability, code-reduction
---

## Eliminate States to Eliminate Code — Make Illegal States Unrepresentable

Every boolean flag doubles the state space. Every nullable field adds a path. The most effective way to reduce code is to reduce the states your system can be in. Three booleans create 8 states — most of which are illegal.

**Incorrect (boolean soup — 8 possible states, only 4 are valid):**

```typescript
interface Order {
  isPaid: boolean;
  isShipped: boolean;
  isCancelled: boolean;
  // 2³ = 8 states. Can an order be paid AND cancelled AND shipped? Who knows!
}

function getOrderStatus(order: Order): string {
  if (order.isCancelled) return "cancelled";
  if (order.isShipped && order.isPaid) return "shipped";
  if (order.isPaid && !order.isShipped) return "processing";
  if (!order.isPaid && !order.isShipped) return "pending";
  if (order.isShipped && !order.isPaid) return "???"; // Illegal state — but representable!
  return "unknown";
}
```

**Correct (state machine — only valid states exist):**

```typescript
type OrderState =
  | { status: "pending" }
  | { status: "paid"; paidAt: Date }
  | { status: "shipped"; paidAt: Date; shippedAt: Date; trackingId: string }
  | { status: "cancelled"; cancelledAt: Date; reason: string };

// No branching needed for impossible states — they can't exist
function getShippingInfo(order: OrderState & { status: "shipped" }): ShippingInfo {
  // order.trackingId and order.shippedAt are guaranteed to exist
  return { trackingId: order.trackingId, shippedAt: order.shippedAt };
}

// Transitions are explicit and type-safe
function shipOrder(order: OrderState & { status: "paid" }, trackingId: string): OrderState {
  return { status: "shipped", paidAt: order.paidAt, shippedAt: new Date(), trackingId };
}
```

Immutability eliminates defensive copying, synchronization guards, and "did this change out from under me?" checks. Every mutable field is a source of code that manages mutation.
