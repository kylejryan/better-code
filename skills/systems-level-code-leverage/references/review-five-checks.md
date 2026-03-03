---
title: Apply the Five-Check Review Lens in Order — Existence, Placement, Shape, Minimum, Composability
impact: MEDIUM
impactDescription: Catches leverage failures before they compound, ensures every piece of code earns its existence
tags: review, code-review, leverage-review, five-checks, review-lens
---

## Apply the Five-Check Review Lens in Order — Existence, Placement, Shape, Minimum, Composability

When reviewing or writing code, apply these checks in order. Each catches a different class of leverage failure.

**Check 1: Existence** — Does this need to exist? Can the feature be achieved by configuring existing code, composing existing primitives, or extending an existing abstraction?

**Check 2: Placement** — Is this in the right place? Code in the wrong layer will be duplicated when someone can't find it or can't depend on its module. Misplaced code is the most common cause of duplication.

**Check 3: Shape** — Is this the right shape? Could this serve a broader purpose with minimal effort? If adding one parameter would triple reuse potential, do it. But only generalize along axes you've seen vary.

**Check 4: Minimum** — Is this the minimum? Read every line: what happens if I delete this? If "nothing changes" — delete it. If "one edge case breaks" — is that edge case worth the line?

**Check 5: Composability** — Does this compose? Can other engineers plug it into contexts you didn't anticipate? If it requires specific global state, initialization order, or sibling functions — it doesn't compose.

**Incorrect (fails multiple checks):**

```typescript
// Fails Check 1: lodash.groupBy already does this
function groupByCategory(products: Product[]): Record<string, Product[]> {
  const groups: Record<string, Product[]> = {};
  for (const p of products) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }
  return groups;
}

// Fails Check 2: placed in OrderService but used by 3 other services
// Fails Check 3: hardcoded to orders, but works for any entity with a date
function getRecentOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.createdAt > thirtyDaysAgo());
}

// Fails Check 5: requires global state to function
let _config: Config;
function initConfig(c: Config) { _config = c; }
function getApiUrl(): string { return _config.apiUrl; } // Fails if init not called
```

**Correct (passes all five checks):**

```typescript
// Check 1: use existing groupBy (Object.groupBy or lodash)
const grouped = Object.groupBy(products, (p) => p.category);

// Check 2: placed in shared utils, accessible to all services
// Check 3: generic shape — works for any entity with a date field
function getRecent<T>(items: T[], dateField: keyof T, withinDays: number = 30): T[] {
  const cutoff = subDays(new Date(), withinDays);
  return items.filter((item) => (item[dateField] as Date) > cutoff);
}

// Check 5: no global state, composes freely
function createApiClient(config: ApiConfig): ApiClient {
  return { baseUrl: config.apiUrl, fetch: config.fetch ?? globalThis.fetch };
}
// Callers provide config — no init order, no global state, fully composable
```

You'll know the system is working when: new features require mostly configuration, the Nth feature costs dramatically less than the first, engineers work in parallel without conflicts, and the codebase grows sublinearly relative to capabilities.
