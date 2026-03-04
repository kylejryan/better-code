---
title: Understand Memory Models and Hidden Allocations
impact: MEDIUM-HIGH
impactDescription: Reduces GC pressure by 30-70%, prevents OOM in data-intensive operations
tags: memory, allocations, gc-pressure, streaming, performance
---

## Understand Memory Models and Hidden Allocations

Understand reference vs. value types, heap vs. stack, GC pressure. Beware hidden allocations: string concatenation in loops, closure captures, intermediate collections in chained operations. For large datasets, use streaming over loading everything into memory.

**Incorrect (hidden allocations causing GC pressure):**

```typescript
// Creates N intermediate arrays and N string objects
function processLargeDataset(records: Record[]): string[] {
  return records
    .map((r) => ({ ...r, normalized: r.name.toLowerCase() })) // N new objects
    .filter((r) => r.normalized.startsWith("a"))                // New array
    .map((r) => `${r.id}: ${r.normalized}`)                     // N new strings
    .sort()                                                      // New array
    .map((s) => s.toUpperCase());                                // N new strings
  // 5 intermediate arrays, 3N string allocations for what could be a single pass
}
```

**Correct (single-pass processing, minimal allocations):**

```typescript
// Single pass, minimal intermediate allocations
function processLargeDataset(records: Record[]): string[] {
  const results: string[] = [];
  for (const record of records) {
    const normalized = record.name.toLowerCase();
    if (normalized.startsWith("a")) {
      results.push(`${record.id}: ${normalized}`.toUpperCase());
    }
  }
  return results.sort();
  // 1 array, N result strings — unavoidable allocations only
}

// For truly large datasets, use streaming
async function* processStream(records: AsyncIterable<Record>): AsyncGenerator<string> {
  for await (const record of records) {
    const normalized = record.name.toLowerCase();
    if (normalized.startsWith("a")) {
      yield `${record.id}: ${normalized}`.toUpperCase();
    }
  }
}
```

Profile before optimizing. But understand the memory model so you don't accidentally create O(n) copies of data that should be processed in a single pass.
