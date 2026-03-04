---
title: Treat Errors as Part of the Domain Model
impact: CRITICAL
impactDescription: Eliminates swallowed errors, forces callers to handle every failure path
tags: error-handling, result-types, domain-errors, exceptions, code-quality
---

## Treat Errors as Part of the Domain Model

Errors are domain concepts — PaymentDeclined, InventoryExhausted, and NetworkTimeout are fundamentally different failures. Use the type system to force callers to handle errors. Never catch and swallow. Never collapse distinct errors into generic strings.

**Incorrect (generic errors, swallowed exceptions, stringly-typed failures):**

```typescript
async function processPayment(orderId: string, amount: number): Promise<any> {
  try {
    const result = await paymentApi.charge(amount);
    if (!result.ok) {
      console.log("Payment failed"); // Swallowed — caller never knows
      return null; // null means... what exactly?
    }
    return result.data;
  } catch (e) {
    // Catches everything: network errors, type errors, bugs
    return { error: "Something went wrong" }; // Useless error message
  }
}
```

**Correct (typed errors, exhaustive handling, explicit failure paths):**

```typescript
type PaymentError =
  | { type: "card_declined"; reason: string }
  | { type: "insufficient_funds"; available: number; required: number }
  | { type: "network_timeout"; retryAfterMs: number }
  | { type: "invalid_amount"; amount: number };

async function processPayment(
  orderId: OrderId,
  amount: Money
): Promise<Result<PaymentConfirmation, PaymentError>> {
  if (amount.cents <= 0) {
    return err({ type: "invalid_amount", amount: amount.cents });
  }

  const response = await this.gateway.charge(amount);

  switch (response.status) {
    case "success":
      return ok({ transactionId: response.id, amount, processedAt: new Date() });
    case "declined":
      return err({ type: "card_declined", reason: response.declineReason });
    case "insufficient_funds":
      return err({ type: "insufficient_funds", available: response.available, required: amount.cents });
    default:
      return err({ type: "network_timeout", retryAfterMs: 5000 });
  }
}
```

If you catch an exception, you must: handle it meaningfully, wrap and re-throw with added context, or log it and fail the operation. `catch (e) {}` is always a bug.
