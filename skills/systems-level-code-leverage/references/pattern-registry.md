---
title: Use Registry Pattern to Collapse the Cost of Adding Variants
impact: HIGH
impactDescription: Adding a new variant costs 1 function instead of N file changes across routing, tests, and docs
tags: registry, dispatch, decorator, variants, leverage
---

## Use Registry Pattern to Collapse the Cost of Adding Variants

When you have N things of the same kind (handlers, validators, strategies, plugins), don't write N registration calls. Use a registry. It collapses the cost of adding a new variant from "write logic + update routing + update tests + update docs" to "write logic."

**Incorrect (growing conditional chain — every new type touches routing code):**

```typescript
// Every new event type: add a branch, update tests, update docs
function handleEvent(event: AppEvent): void {
  if (event.type === "user.created") handleUserCreated(event);
  else if (event.type === "user.deleted") handleUserDeleted(event);
  else if (event.type === "order.placed") handleOrderPlaced(event);
  else if (event.type === "order.shipped") handleOrderShipped(event);
  else if (event.type === "payment.received") handlePaymentReceived(event);
  else if (event.type === "payment.refunded") handlePaymentRefunded(event);
  // ... grows forever, risk of missing a new type
  else throw new Error(`Unhandled event: ${event.type}`);
}
```

**Correct (registry — adding a new event type requires ONE function):**

```typescript
// Registry: maps event types to handlers
const eventHandlers = new Map<string, EventHandler>();

function onEvent(type: string, handler: EventHandler): void {
  eventHandlers.set(type, handler);
}

function handleEvent(event: AppEvent): void {
  const handler = eventHandlers.get(event.type);
  if (!handler) throw new UnhandledEventError(event.type);
  handler(event);
}

// Each handler registers itself — zero changes to dispatch logic
onEvent("user.created", async (event) => {
  await userService.onCreated(event.data);
});

onEvent("order.placed", async (event) => {
  await orderService.onPlaced(event.data);
});

// Adding a new event: write ONE handler + ONE registration. Done.
// With decorators: even the registration is automatic
```

The registry collapses the cost of adding a new variant from "write logic + update routing + update tests + update docs" to "write logic."