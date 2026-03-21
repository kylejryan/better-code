---
title: Evaluate Build vs Stdlib and Implement with Benchmarks
impact: CRITICAL
impactDescription: The 10x rule prevents wasted effort on custom structures that don't pay for their maintenance cost
tags: build-vs-stdlib, benchmarks, 10x-rule, implementation, validation
---

## Evaluate Build vs Stdlib and Implement with Benchmarks

### Step 3: Build vs Use Stdlib

**Use stdlib when:**
- The data set is small (< 1000 elements for most operations)
- The operation isn't on a hot path (profiling doesn't flag it)
- The access pattern is simple (single-key lookup, iteration, append)
- Correctness and maintainability matter more than microseconds
- The performance difference is < 2x and doesn't affect user-visible latency

**Build custom when:**
- Profiling shows this data access is a bottleneck
- The access pattern requires multi-dimensional lookup or compound operations that stdlib doesn't support natively
- The data set is large enough that algorithmic complexity matters (O(n) → O(log n) or O(1) saves measurable time)
- The workload is read-heavy and a read-optimized structure would dramatically reduce allocation or lock contention
- You need a structure that doesn't exist in stdlib (LRU cache, bloom filter, trie, multi-index map, ring buffer with specific semantics)

**The 10x rule:** a custom data structure should be at least 10x faster on the target operation to justify the maintenance cost, OR it should reduce code complexity by eliminating workaround logic that compensates for stdlib limitations.

### Step 4: Implement, Benchmark, Validate

1. **Interface first.** Define the exact methods the structure needs to support. No more, no less. A data structure that exposes unnecessary operations is harder to optimize and easier to misuse.

2. **Benchmark before and after.** Use `go test -bench` or a TS benchmark harness. Measure the specific operation on realistic data sizes. Wall-clock time, allocations per operation, and memory footprint.

3. **Property-test invariants.** The structure's invariants (sorted order, uniqueness, capacity bounds) should be tested with random inputs, not just hand-picked cases.

4. **Document the contract.** What operations are O(1)? What's O(n)? What's the memory overhead? What's thread-safe and what isn't? The next engineer who uses this structure needs to know its performance characteristics without reading the implementation.

**Incorrect (building custom without evidence):**

```typescript
// "Maps are slow, let's build a custom hash table"
// No profiling. Map<string, Finding> handles 10k entries in microseconds.
class CustomHashTable {
  // 200 lines of custom implementation
  // Bugs in resize logic
  // No benchmarks proving it's faster
}
```

**Correct (evidence-driven decision):**

```typescript
// Profiling shows: getByService() called 50k times/sec, iterates all 100k findings
// Current: Map<string, Finding> → O(n) filter per call = 5 billion comparisons/sec
// Custom: MultiIndex with service index → O(1) lookup per call
// Benchmark: 50μs → 0.2μs per call (250x improvement)
// Decision: build the multi-index map

// Before: 50μs per getByService call
const findings = new Map<string, Finding>();
function getByService(svc: string): Finding[] {
  return [...findings.values()].filter(f => f.service === svc); // O(n)
}

// After: 0.2μs per getByService call
const findings = new MultiIndex<string, Finding>(f => f.id, {
  byService: f => f.service,
});
function getByService(svc: string): Finding[] {
  return findings.getByIndex("byService", svc); // O(1)
}
```
