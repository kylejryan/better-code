---
title: Profile the Access Pattern Before Choosing a Data Structure
impact: CRITICAL
impactDescription: Wrong structure choice wastes implementation time and delivers no performance gain; correct profiling prevents this
tags: access-pattern, profiling, write-pattern, read-pattern, concurrency, design-method
---

## Profile the Access Pattern Before Choosing a Data Structure

Before choosing or building anything, answer these questions about the data. Different answer combinations point to radically different implementations.

**Write patterns:**
- How is data added? One at a time, in batches, or all at once at startup?
- How often is data modified after initial insertion?
- Are deletes frequent, rare, or never?
- Is write order significant (insertion order matters) or arbitrary?
- Is the data append-only (immutable once written)?

**Read patterns:**
- What's the primary lookup? By key, by index, by range, by prefix, by multiple fields?
- Are lookups exact-match or partial/fuzzy?
- How often is the full collection iterated vs individual elements accessed?
- Are reads sequential (iterate in order) or random (jump to arbitrary elements)?
- Is there a hot subset (20% of keys serve 80% of reads)?

**Size and lifecycle:**
- How many elements? 10? 1,000? 1,000,000?
- Is the size bounded or unbounded?
- Does the collection grow over time or is it relatively stable?
- What's the element size? Primitives, small structs, or large objects with references?
- What's the lifetime? Request-scoped, session-scoped, or application lifetime?

**Concurrency:**
- Single-threaded/single-goroutine access, or shared across concurrent contexts?
- Read-heavy, write-heavy, or balanced?
- Can we tolerate eventual consistency or need strict consistency?

**Derived operations:**
- Do you need set operations (union, intersection, difference)?
- Do you need sorting or top-N queries?
- Do you need aggregations (count, sum, group-by)?
- Do you need change detection (what changed since last check)?

**Incorrect (choosing structure before profiling):**

```typescript
// "We need fast lookups so let's use a Map"
// But the actual hot path is prefix search, not exact key lookup
const findings = new Map<string, Finding>();

// Every prefix search is O(n) — iterating the entire map
function findByPrefix(prefix: string): Finding[] {
  return [...findings.values()].filter(f => f.id.startsWith(prefix));
}
```

**Correct (profile first, then choose):**

```typescript
// Access pattern analysis:
// - Lookups are by ID prefix (e.g., "CVE-2024-"), not exact key
// - Data is loaded at startup, rarely modified
// - ~50k entries, prefix queries on every request
// → Trie is the right structure, not a hash map

const findings = new Trie<Finding>();

// O(prefix length + matches) instead of O(n)
function findByPrefix(prefix: string): Finding[] {
  return findings.getByPrefix(prefix);
}
```
