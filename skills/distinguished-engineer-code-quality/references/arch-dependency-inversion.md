---
title: Invert Dependencies — High-Level Policy Must Not Depend on Low-Level Detail
impact: CRITICAL
impactDescription: Enables testing without infrastructure, swap implementations with zero business logic changes
tags: dependency-inversion, inversion-of-control, interfaces, testability, architecture
---

## Invert Dependencies — High-Level Policy Must Not Depend on Low-Level Detail

Business logic defines interfaces for what it needs. Infrastructure implements those interfaces. The composition root wires implementations to interfaces. Tests supply alternative implementations with zero changes to business logic.

**Incorrect (business logic depends directly on infrastructure):**

```typescript
// Business logic is coupled to PostgreSQL — can't test without a database
class OrderService {
  async createOrder(items: CartItem[]): Promise<Order> {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // ... 20 lines of SQL mixed with business logic
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    }
  }
}
```

**Correct (business logic depends on abstractions it defines):**

```typescript
// Business logic defines what it needs — no infrastructure imports
interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: OrderId): Promise<Order | null>;
}

interface PaymentGateway {
  charge(amount: Money, method: PaymentMethod): Promise<PaymentResult>;
}

class OrderService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly payments: PaymentGateway
  ) {}

  async createOrder(items: CartItem[]): Promise<Result<Order, OrderError>> {
    const order = Order.create(items);
    const payment = await this.payments.charge(order.total, order.paymentMethod);
    if (payment.isDeclined()) return err(new PaymentDeclinedError(payment.reason));
    return ok(await this.orders.save(order.markPaid(payment.id)));
  }
}

// Infrastructure implements the interface
class PostgresOrderRepository implements OrderRepository { /* ... */ }

// Tests use fakes with zero changes to OrderService
class InMemoryOrderRepository implements OrderRepository { /* ... */ }
```

This is non-negotiable for any code that will survive longer than a sprint.
