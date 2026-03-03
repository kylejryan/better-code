---
title: Enforce Separation of Concerns at Every Level
impact: CRITICAL
impactDescription: Reduces change blast radius to single modules, enables independent team ownership
tags: separation-of-concerns, single-responsibility, layers, architecture
---

## Enforce Separation of Concerns at Every Level

Every module, class, and function should have one reason to change. Layer boundaries are contracts, not suggestions — data crossing a boundary must be transformed into the receiving layer's domain model. Never pass a database row to a UI component.

**Incorrect (mixed concerns — HTTP handling, business logic, and database access in one function):**

```typescript
// One function that changes for three different reasons
app.post("/orders", async (req, res) => {
  const items = req.body.items;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items" });
  }
  let total = 0;
  for (const item of items) {
    const product = await db.query("SELECT price FROM products WHERE id = $1", [item.id]);
    total += product.rows[0].price * item.quantity;
  }
  const tax = total * 0.08;
  const orderId = await db.query(
    "INSERT INTO orders (total, tax, status) VALUES ($1, $2, 'pending') RETURNING id",
    [total, tax]
  );
  res.json({ orderId: orderId.rows[0].id, total: total + tax });
});
```

**Correct (each layer has one reason to change):**

```typescript
// HTTP layer — changes when API contract changes
app.post("/orders", async (req, res) => {
  const result = await orderService.createOrder(req.body.items);
  if (result.isErr()) {
    return res.status(400).json({ error: result.error.message });
  }
  res.json(toOrderResponse(result.value));
});

// Business logic — changes when business rules change
class OrderService {
  constructor(
    private readonly products: ProductRepository,
    private readonly orders: OrderRepository,
    private readonly taxCalculator: TaxCalculator
  ) {}

  async createOrder(items: OrderItemInput[]): Promise<Result<Order, OrderError>> {
    if (items.length === 0) return err(new EmptyOrderError());
    const lineItems = await this.products.resolveLineItems(items);
    const total = lineItems.reduce((sum, li) => sum + li.subtotal, 0);
    const tax = this.taxCalculator.calculate(total);
    return ok(await this.orders.save(new Order(lineItems, total, tax)));
  }
}
```

If you find yourself importing from a sibling module "just this once," stop. That import is an architectural decision — make it consciously or not at all.
