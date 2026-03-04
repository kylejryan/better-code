---
title: Maximize Cohesion, Minimize Coupling
impact: HIGH
impactDescription: Enables independent module evolution, reduces cross-team coordination overhead
tags: cohesion, coupling, connascence, modularity, architecture
---

## Maximize Cohesion, Minimize Coupling

High cohesion: everything in a module works together toward a single purpose. Low coupling: modules interact through narrow, stable interfaces. When two modules must change together, understand why — connascence of name is cheap, connascence of algorithm is expensive.

**Incorrect (low cohesion, high coupling — modules know too much about each other):**

```typescript
// OrderProcessor reaches into multiple unrelated concerns
class OrderProcessor {
  process(order: Order) {
    // Knows about email formatting internals
    const subject = `Order #${order.id} Confirmation`;
    const body = `<h1>Thank you</h1><p>Total: $${order.total.toFixed(2)}</p>`;
    emailClient.send(order.customer.email, subject, body);

    // Knows about analytics event structure
    analytics.track({
      event: "order_completed",
      properties: { orderId: order.id, revenue: order.total, items: order.items.length },
    });

    // Knows about inventory database schema
    for (const item of order.items) {
      db.query("UPDATE inventory SET quantity = quantity - $1 WHERE sku = $2",
        [item.quantity, item.sku]);
    }
  }
}
```

**Correct (high cohesion, low coupling — narrow interfaces between modules):**

```typescript
// Each module owns its concern and exposes a minimal interface
class OrderProcessor {
  constructor(
    private readonly notifications: OrderNotifier,
    private readonly analytics: OrderAnalytics,
    private readonly inventory: InventoryService
  ) {}

  async process(order: Order): Promise<Result<void, OrderError>> {
    await this.inventory.reserveItems(order.items);
    await this.notifications.sendConfirmation(order);
    this.analytics.recordCompletion(order);
    return ok(undefined);
  }
}

// Notification module — changes only when notification requirements change
class OrderNotifier {
  sendConfirmation(order: Order): Promise<void> { /* owns email formatting */ }
}

// Analytics module — changes only when tracking requirements change
class OrderAnalytics {
  recordCompletion(order: Order): void { /* owns event structure */ }
}
```

If you split a highly cohesive module in half, both halves would be less useful alone. Changing the internal implementation of module A should require zero changes in module B.
