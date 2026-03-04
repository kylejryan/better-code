---
title: Refactor in Small Verified Steps That Preserve Behavior
impact: MEDIUM
impactDescription: Reduces refactoring risk from "prayer-based" to deterministic, zero-regression changes
tags: refactoring, methodology, small-steps, behavior-preservation, testing
---

## Refactor in Small Verified Steps That Preserve Behavior

Before refactoring: ensure test coverage and understand the code. During: small verified steps, one refactoring move per commit. After: verify the improvement and document the decision. Refactoring changes structure, not behavior.

**Before refactoring:**
1. Ensure test coverage — write characterization tests if none exist
2. Understand the code — trace execution paths, draw dependency graphs
3. Define the goal — what smell are you eliminating? what property are you adding?

**Incorrect (big-bang refactoring without safety net):**

```typescript
// "I'll just rewrite the whole thing" — no tests, no incremental steps
// Original: 200-line function with 5 responsibilities
// Attempt: rewrite from scratch in one commit
// Result: subtle behavioral changes, broken edge cases, 3-day debugging session
function processOrder(order: any) {
  // ... 200 lines refactored all at once with no intermediate verification
}
```

**Correct (sequence of named, small refactoring moves):**

```typescript
// Step 1: Write characterization tests capturing current behavior
test("existing order with tax calculates correctly", () => { /* ... */ });
test("order with coupon applies discount before tax", () => { /* ... */ });

// Step 2: Extract Method — pull validation logic out (run tests: ✓)
function validateOrderItems(items: OrderItem[]): Result<void, ValidationError> { /* ... */ }

// Step 3: Introduce Parameter Object — replace 5 fields (run tests: ✓)
interface CreateOrderRequest { items: OrderItem[]; customer: Customer; coupon?: CouponCode; }

// Step 4: Extract Class — separate calculation concern (run tests: ✓)
class OrderCalculator {
  calculateTotals(items: OrderItem[], coupon?: CouponCode): OrderTotals { /* ... */ }
}

// Step 5: Apply Dependency Inversion — inject repository (run tests: ✓)
// Each step: one commit, tests pass, behavior preserved
```

If tests fail after a refactoring move, revert that move — don't debug forward. Keep the code compiling and tests passing at every intermediate step.
