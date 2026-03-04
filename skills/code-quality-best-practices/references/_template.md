---
title: Clear, Action-Oriented Title (e.g., "Use Guard Clauses for Early Return")
impact: MEDIUM
impactDescription: Quantified benefit (e.g., "50% reduction in cyclomatic complexity")
tags: code-quality, readability, maintainability
---

## [Rule Title]

[1-2 sentence explanation of the problem and why it matters. Focus on impact to readability, maintainability, or correctness.]

**Incorrect (describe the problem):**

```typescript
// Comment explaining what makes this problematic
function processOrder(order: Order): Result {
    // problematic code
}
```

**Correct (describe the solution):**

```typescript
// Comment explaining why this is better
function processOrder(order: Order): Result {
    // improved code
}
```

[Optional: Additional context, edge cases, or trade-offs]

Reference: [Relevant Source](https://example.com)
