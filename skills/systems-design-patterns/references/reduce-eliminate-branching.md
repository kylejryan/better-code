---
title: Reduce Branching Through Polymorphism, Dispatch, and Defaults
impact: MEDIUM-HIGH
impactDescription: Each eliminated if-else removes two code paths to write, test, and maintain
tags: branching, polymorphism, dispatch, null-object, code-reduction
---

## Reduce Branching Through Polymorphism, Dispatch, and Defaults

Every `if` statement is two code paths to write, test, and maintain. Reduce branching through polymorphism (dispatch tables, strategy objects), Null Object pattern, and defaults.

**Incorrect (conditional explosion — every new type adds branches everywhere):**

```typescript
function calculateDiscount(customer: Customer): number {
  if (customer.type === "premium") {
    if (customer.yearsActive > 5) return 0.2;
    return 0.15;
  } else if (customer.type === "business") {
    if (customer.employeeCount > 100) return 0.25;
    return 0.1;
  } else if (customer.type === "basic") {
    return 0;
  }
  return 0;
}

// Null checks scattered everywhere
function logActivity(logger: Logger | null, message: string): void {
  if (logger !== null) {
    logger.log(message);
  }
}
```

**Correct (polymorphism and Null Object eliminate branches):**

```typescript
// Dispatch table — adding a new type is one entry, not a new branch
const discountStrategies: Record<CustomerType, (c: Customer) => number> = {
  premium: (c) => c.yearsActive > 5 ? 0.2 : 0.15,
  business: (c) => c.employeeCount > 100 ? 0.25 : 0.1,
  basic: () => 0,
};

function calculateDiscount(customer: Customer): number {
  return discountStrategies[customer.type](customer);
}

// Null Object — zero conditionals
class NullLogger implements Logger {
  log(_message: string): void { /* silently discard */ }
}

// Always pass a real logger — NullLogger replaces null checks
function processOrder(order: Order, logger: Logger = new NullLogger()): void {
  logger.log(`Processing order ${order.id}`); // No null check needed, ever
}
```

Default values over presence checks. Instead of `if config.timeout !== undefined`, make the default part of the config object's construction.
