---
title: Apply DRY to Knowledge, Not Text
impact: CRITICAL
impactDescription: Eliminates false coupling, reduces change propagation to single locations
tags: dry, duplication, knowledge, abstraction, rule-of-three, philosophy
---

## Apply DRY to Knowledge, Not Text

DRY is about knowledge, not text. Two identical-looking code blocks that change for different reasons are NOT duplication — they are coincidence. Merging them creates coupling where none should exist. Tolerate duplication until you see it three times (Rule of Three).

**Incorrect (false DRY — merging coincidental similarity creates coupling):**

```typescript
// These look similar but represent different domain concepts
// Merging them means a billing change could break user registration
function formatEntity(entity: User | Invoice, type: "user" | "invoice"): string {
  const name = type === "user" ? entity.fullName : entity.clientName;
  const id = type === "user" ? entity.userId : entity.invoiceNumber;
  const date = type === "user" ? entity.registeredAt : entity.issuedAt;
  return `${name} (${id}) - ${date.toISOString()}`;
}
```

**Correct (true DRY — each domain concept has one canonical representation):**

```typescript
// User formatting — changes when user display requirements change
function formatUserSummary(user: User): string {
  return `${user.fullName} (${user.userId}) - ${user.registeredAt.toISOString()}`;
}

// Invoice formatting — changes when billing requirements change
function formatInvoiceSummary(invoice: Invoice): string {
  return `${invoice.clientName} (${invoice.invoiceNumber}) - ${invoice.issuedAt.toISOString()}`;
}

// TRUE duplication: business rule exists in one place
const TAX_RATE = 0.08; // Single source of truth
function calculateTax(amount: number): number {
  return amount * TAX_RATE;
}
```

When you do extract, name the abstraction after what it knows or enforces, not after the callers that use it. True DRY: a business rule in one place, a data transformation with one canonical implementation, a configuration value with one source of truth.
