---
title: Apply Behavioral Patterns to Manage Complex Algorithms and Communication
impact: HIGH
impactDescription: Eliminates sprawling conditionals, decouples event producers from consumers, enables runtime algorithm swaps
tags: strategy, observer, state, command, chain-of-responsibility, behavioral, design-patterns
---

## Apply Behavioral Patterns to Manage Complex Algorithms and Communication

Behavioral patterns manage algorithms and object communication. Strategy swaps algorithms at runtime. Observer handles one-to-many notifications. State eliminates conditional sprawl for state-dependent behavior.

**Strategy** — Use when an algorithm varies independently from clients. Avoid when there's only one algorithm.

**Observer** — Use when one-to-many notification with an open-ended set of dependents. Avoid when dependents are fixed and small.

**State** — Use when behavior changes based on internal state with complex transitions. Avoid when there are only 2-3 states.

**Incorrect (conditional sprawl for behavior that varies by type/state):**

```typescript
function calculateShipping(order: Order): number {
  if (order.shippingMethod === "standard") {
    if (order.weight > 50) return order.weight * 0.5 + 10;
    return order.weight * 0.3 + 5;
  } else if (order.shippingMethod === "express") {
    if (order.weight > 50) return order.weight * 1.2 + 25;
    return order.weight * 0.8 + 15;
  } else if (order.shippingMethod === "overnight") {
    if (order.weight > 50) return order.weight * 2.0 + 50;
    return order.weight * 1.5 + 30;
  } else if (order.shippingMethod === "freight") {
    // ... another 10 lines
  }
  throw new Error("Unknown method");
  // Every new shipping method: add another branch, risk missing one
}
```

**Correct (Strategy pattern — new methods added without modifying existing code):**

```typescript
interface ShippingCalculator {
  calculate(weight: number): Money;
}

const shippingStrategies: Record<ShippingMethod, ShippingCalculator> = {
  standard: { calculate: (w) => money((w > 50 ? w * 0.5 + 10 : w * 0.3 + 5)) },
  express:  { calculate: (w) => money((w > 50 ? w * 1.2 + 25 : w * 0.8 + 15)) },
  overnight:{ calculate: (w) => money((w > 50 ? w * 2.0 + 50 : w * 1.5 + 30)) },
};

function calculateShipping(order: Order): Money {
  const strategy = shippingStrategies[order.shippingMethod];
  if (!strategy) throw new UnknownShippingMethodError(order.shippingMethod);
  return strategy.calculate(order.weight);
}
// Adding freight: add one entry to shippingStrategies. Zero changes to calculateShipping.
```

Before applying a behavioral pattern, answer: What specific problem am I solving? What is the cost of NOT using this pattern? What does this pattern make harder?
