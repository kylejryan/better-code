---
title: Apply Structural Patterns to Manage Interface Complexity and Composition
impact: HIGH
impactDescription: Isolates external volatility, prevents class explosion, simplifies subsystem interfaces
tags: adapter, decorator, facade, composite, proxy, structural, design-patterns
---

## Apply Structural Patterns to Manage Interface Complexity and Composition

Structural patterns assemble objects into larger structures while keeping them flexible. Each has a specific problem — using one without the problem adds indirection without value.

**Adapter** — Integrate third-party interfaces that don't match your domain model. Isolates external volatility.

**Decorator** — Add behavior dynamically without subclassing. Compose responsibilities in arbitrary combinations.

**Facade** — Simplify a complex subsystem interface for most callers.

**Incorrect (direct coupling to third-party interface throughout codebase):**

```typescript
// Every caller knows about Stripe's specific API shape
async function chargeCustomer(customerId: string, amount: number) {
  const stripe = new Stripe(process.env.STRIPE_KEY!);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    customer: customerId,
    payment_method_types: ["card"],
  });
  return { id: paymentIntent.id, status: paymentIntent.status };
}
// If we switch to Square, we change every call site
```

**Correct (adapter isolates external dependency):**

```typescript
// Domain interface — stable, owned by us
interface PaymentGateway {
  charge(customer: CustomerId, amount: Money): Promise<Result<PaymentId, PaymentError>>;
}

// Adapter — only place that knows about Stripe
class StripeGateway implements PaymentGateway {
  constructor(private readonly client: Stripe) {}

  async charge(customer: CustomerId, amount: Money): Promise<Result<PaymentId, PaymentError>> {
    try {
      const intent = await this.client.paymentIntents.create({
        amount: amount.cents,
        currency: amount.currency,
        customer: customer.value,
        payment_method_types: ["card"],
      });
      return ok(PaymentId.from(intent.id));
    } catch (e) {
      return err(this.mapError(e));
    }
  }
}

// Decorator — adds logging without modifying the gateway
class LoggingGateway implements PaymentGateway {
  constructor(private readonly inner: PaymentGateway, private readonly logger: Logger) {}

  async charge(customer: CustomerId, amount: Money): Promise<Result<PaymentId, PaymentError>> {
    this.logger.info("Charging", { customer, amount });
    const result = await this.inner.charge(customer, amount);
    this.logger.info("Charge result", { success: result.isOk() });
    return result;
  }
}
```

Every pattern adds indirection. Every layer of indirection is a layer to debug through. Apply only when the benefit clearly outweighs the cost.
