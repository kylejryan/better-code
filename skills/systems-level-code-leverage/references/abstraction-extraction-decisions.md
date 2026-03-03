---
title: Use the Extraction Decision Framework Before Creating Abstractions
impact: HIGH
impactDescription: Prevents wrong abstractions that cost 3-5x more than the duplication they replace
tags: extraction, decision-framework, rule-of-three, abstraction, leverage
---

## Use the Extraction Decision Framework Before Creating Abstractions

Not everything should be extracted. Wrong abstractions cost more than duplication. Use this decision tree before extracting:

```
Is this logic used in 3+ places?
├─ Yes → Extract. The pattern is proven.
├─ No, but used in 2 places:
│   ├─ Same domain concept? → Extract cautiously. Name it after the concept.
│   └─ Different domain concepts? → Do NOT extract. It's coincidence.
└─ Used in 1 place:
    ├─ Independently testable/meaningful? → Extract as named private function.
    └─ A handful of lines with no standalone meaning? → Leave inline.
```

**Incorrect (premature extraction from two occurrences — wrong abstraction):**

```typescript
// Two callers that look similar but represent different concepts
function formatForDisplay(entity: User | Product, type: "user" | "product"): string {
  const name = type === "user" ? entity.fullName : entity.productName;
  const id = type === "user" ? `USR-${entity.id}` : `PRD-${entity.id}`;
  const date = type === "user" ? entity.joinedAt : entity.createdAt;
  return `${name} (${id}) - ${formatDate(date)}`;
}
// Now a user display change risks breaking product display — and vice versa
```

**Correct (extract only when the pattern is proven and named after what it IS):**

```typescript
// Two separate functions — they change for different reasons
function formatUserDisplay(user: User): string {
  return `${user.fullName} (USR-${user.id}) - ${formatDate(user.joinedAt)}`;
}

function formatProductDisplay(product: Product): string {
  return `${product.productName} (PRD-${product.id}) - ${formatDate(product.createdAt)}`;
}

// When a THIRD entity needs display formatting, the pattern is clear:
// Extract a DisplayFormatter with a config-driven approach

// Correctly named: describes what it IS, not where it's USED
function retryWithBackoff<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T> { /* ... */ }
// NOT: function retryPaymentApiCall(fn) — that's not reusable
```

The abstraction's name must describe what it is, not where it's used. `retryWithBackoff()` is reusable. `retryPaymentApiCall()` is not.
