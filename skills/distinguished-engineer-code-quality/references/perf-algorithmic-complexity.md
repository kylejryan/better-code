---
title: Choose Correct Algorithmic Complexity Before Writing Code
impact: HIGH
impactDescription: Prevents O(n²) when O(n) is equally simple — 100-1000x improvement at scale
tags: big-o, algorithmic-complexity, data-structures, performance
---

## Choose Correct Algorithmic Complexity Before Writing Code

Know the Big-O of every collection operation. `list.contains()` is O(n) — calling it in a loop creates O(n²). Choosing O(n²) when O(n) is equally simple is not "avoiding premature optimization" — it is negligence.

**Incorrect (O(n²) hidden in innocent-looking code):**

```typescript
// Looks simple but is O(n * m) — quadratic for large datasets
function findCommonUsers(listA: User[], listB: User[]): User[] {
  return listA.filter((a) => listB.some((b) => b.id === a.id));
}

// O(n²) string building
function buildReport(items: string[]): string {
  let result = "";
  for (const item of items) {
    result += item + "\n"; // Creates a new string every iteration
  }
  return result;
}
```

**Correct (O(n) with proper data structures):**

```typescript
// O(n + m) with a Set lookup — linear regardless of dataset size
function findCommonUsers(listA: User[], listB: User[]): User[] {
  const idSet = new Set(listB.map((b) => b.id));
  return listA.filter((a) => idSet.has(a.id));
}

// O(n) string building with array join
function buildReport(items: string[]): string {
  return items.join("\n");
}
```

Hash maps for lookup. Sorted structures for range queries. Append-only logs for sequential writes. Prefer streaming/iterator-based processing over materializing entire collections when the consumer only needs one element at a time.
