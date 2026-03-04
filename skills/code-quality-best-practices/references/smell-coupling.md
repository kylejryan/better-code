---
title: Identify Coupling Smells That Cause Shotgun Surgery
impact: MEDIUM-HIGH
impactDescription: Reduces change propagation from N files to 1, prevents accidental breakage across modules
tags: code-smells, feature-envy, shotgun-surgery, coupling, intimacy
---

## Identify Coupling Smells That Cause Shotgun Surgery

Coupling smells mean one change forces modifications across many unrelated modules. Identify them early to prevent exponential maintenance costs.

**Feature Envy** — A method uses more data from another class than its own. Move it to where the data lives.

**Inappropriate Intimacy** — Two classes know too much about each other's internals.

**Shotgun Surgery** — One change requires modifications in many classes.

**Divergent Change** — One class modifies for multiple unrelated reasons.

**Incorrect (feature envy and shotgun surgery):**

```typescript
// Feature Envy: this function envies the Order class
function formatOrderSummary(order: Order): string {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * order.taxRate;
  const shipping = order.weight > 50 ? 15.99 : 5.99;
  const total = subtotal + tax + shipping;
  return `Order ${order.id}: $${total.toFixed(2)}`;
  // Uses 5 fields from Order, zero from its own context
}

// Shotgun surgery: adding a new user field requires changes in 6 places
// user-form.ts, user-api.ts, user-validator.ts, user-mapper.ts,
// user-serializer.ts, user-display.ts — all change together
```

**Correct (logic lives with the data it uses):**

```typescript
// Method moved to where the data lives
class Order {
  get total(): Money {
    return this.subtotal.plus(this.tax).plus(this.shippingCost);
  }

  formatSummary(): string {
    return `Order ${this.id}: ${this.total.format()}`;
  }
}

// Single source of truth eliminates shotgun surgery
class UserSchema {
  // Adding a field here automatically propagates to
  // validation, serialization, API, and display
  static readonly fields = {
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["admin", "user", "viewer"]),
  } as const;
}
```

When two classes change together, analyze the connascence. Connascence of name is cheap. Connascence of algorithm is expensive. Reduce expensive connascence ruthlessly.
