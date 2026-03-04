---
title: Recognize Structural Code Smells as Symptoms Demanding Investigation
impact: MEDIUM-HIGH
impactDescription: Early detection prevents 5-10x more expensive fixes later
tags: code-smells, long-method, large-class, primitive-obsession, structural
---

## Recognize Structural Code Smells as Symptoms Demanding Investigation

These are symptoms, not aesthetic preferences. Each points to a deeper structural issue that will compound over time.

**Long Method** — Any function exceeding ~40 lines is suspect. Extract until each function does one thing.

**Large Class** — More than ~200 lines or more than one paragraph of description. Extract along axis of change.

**Long Parameter List** — More than 3 parameters. Introduce parameter objects.

**Primitive Obsession** — Using string for email, int for currency, dict for config. Create domain types.

**Incorrect (multiple structural smells in one class):**

```typescript
// Large class with long methods, many parameters, primitive obsession
class OrderManager {
  processOrder(
    items: string[], quantities: number[], prices: number[], // Data clump + primitives
    customerName: string, customerEmail: string,              // Data clump
    shippingStreet: string, shippingCity: string,             // Data clump
    shippingState: string, shippingZip: string,               // Primitive obsession
    couponCode: string, taxRate: number                       // Long parameter list
  ): { success: boolean; orderId: string; total: number } {
    // 80 lines of mixed validation, calculation, persistence, notification...
  }
}
```

**Correct (domain types, parameter objects, focused classes):**

```typescript
class OrderService {
  constructor(
    private readonly calculator: OrderCalculator,
    private readonly repository: OrderRepository
  ) {}

  createOrder(request: CreateOrderRequest): Result<Order, OrderError> {
    const lineItems = this.calculator.resolveLineItems(request.items);
    const totals = this.calculator.calculateTotals(lineItems, request.coupon);
    return this.repository.save(Order.create(request.customer, request.shipping, totals));
  }
}

// Domain types that enforce invariants
class Email { private constructor(readonly value: string) {} /* factory with validation */ }
class Money { constructor(readonly cents: number, readonly currency: Currency) {} }
class ZipCode { private constructor(readonly value: string) {} /* validates format */ }
```

**Data Clumps** — the same group of fields appears in multiple places. Extract a value object. If fields always travel together, they belong together.
