---
title: Build Vocabulary Layers Where Each Level Speaks Only Its Own Language
impact: CRITICAL
impactDescription: Prevents vocabulary leaks that cause 3-5x maintenance cost across layer boundaries
tags: abstraction-layers, vocabulary, separation, architecture, leverage
---

## Build Vocabulary Layers Where Each Level Speaks Only Its Own Language

Think of your codebase as layers of vocabulary. Each layer speaks a higher-level language than the one below. The cardinal rule: each layer speaks ONLY in the vocabulary of its own level and the level directly below.

```
Layer 4: Business workflows    "Process a refund for order #123"
Layer 3: Domain operations     "Credit the customer's balance" / "Reverse the charge"
Layer 2: Service primitives    "Execute a ledger transaction" / "Send a notification"
Layer 1: Infrastructure        "Insert a row" / "Publish a message" / "Make an HTTP call"
```

**Incorrect (vocabulary leaks across non-adjacent layers):**

```typescript
// Layer 4 function mentions rows, HTTP, and SQL — infrastructure vocabulary
async function processRefund(orderId: string): Promise<void> {
  const order = await db.query("SELECT * FROM orders WHERE id = $1", [orderId]);
  const refundAmount = order.rows[0].total;

  await db.query("INSERT INTO ledger (type, amount) VALUES ('credit', $1)", [refundAmount]);
  await db.query("UPDATE orders SET status = 'refunded' WHERE id = $1", [orderId]);

  await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.STRIPE_KEY}` },
    body: JSON.stringify({ charge: order.rows[0].stripe_charge_id, amount: refundAmount }),
  });

  await fetch(process.env.SLACK_WEBHOOK!, {
    method: "POST",
    body: JSON.stringify({ text: `Refund processed for order ${orderId}` }),
  });
}
```

**Correct (each layer speaks its own vocabulary):**

```typescript
// Layer 4: Business workflow — speaks in business terms only
async function processRefund(orderId: OrderId): Promise<Result<Refund, RefundError>> {
  const order = await orders.findById(orderId);
  if (!order) return err(new OrderNotFoundError(orderId));

  const refund = await billing.reverseCharge(order.chargeId, order.total);
  await orders.markRefunded(orderId, refund.id);
  await notifications.send("refund.processed", { order, refund });

  return ok(refund);
}

// Layer 3: Domain operations — speaks in domain terms
class BillingService {
  async reverseCharge(chargeId: ChargeId, amount: Money): Promise<Refund> { /* ... */ }
}

// Layer 2: Service primitives — speaks in service terms
class PaymentGateway {
  async refund(chargeId: string, amount: number): Promise<RefundResult> { /* ... */ }
}

// Layer 1: Infrastructure — speaks in infrastructure terms
// HTTP calls, SQL queries, message publishing — all hidden here
```

When you find a function mixing vocabulary from two non-adjacent layers, that's the signal to extract intermediate abstractions.
