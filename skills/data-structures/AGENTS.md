# Data Structures

## Structure

```
data-structures/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

Stdlib data structures are general-purpose by design — they optimize for the average case across all possible use cases. Internal tooling has specific, known access patterns. When you know exactly how data will be read, written, searched, and iterated, you can build a data structure that is dramatically faster than the general-purpose default.

The threshold question: if the code runs once during startup, use whatever is simplest. If it runs on every request, in a tight loop, or on a hot path identified by profiling — that's when custom structures earn their keep.

## The Design Method

Never start from "what data structure should I use?" Start from "what operations does my code actually perform on this data, and at what frequency?"

**Step 1: Profile the Access Pattern.** Answer questions about write patterns, read patterns, size/lifecycle, concurrency, and derived operations. The answers determine the optimal structure. See `references/method-access-pattern-profiling.md` for the full question set.

**Step 2: Match the Pattern to a Structure.** Use the decision trees for exact key lookup, collection membership, ordered data, and specialized patterns. See `references/method-pattern-matching.md` for the complete decision map.

**Step 3: Evaluate Build vs Use Stdlib.** Not every access pattern needs a custom structure. Apply the build-vs-stdlib test and the 10x rule. See `references/method-build-vs-stdlib.md`.

**Step 4: Implement, Benchmark, Validate.** Interface first. Benchmark before and after. Property-test invariants. Document the contract. See `references/method-build-vs-stdlib.md`.

## Structure Catalog by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Design Method | CRITICAL | `method-` |
| 2 | Structure Implementations | HIGH | `structure-` |
| 3 | Language Performance | MEDIUM-HIGH | `lang-` |
| 4 | Fundamentals Reference | MEDIUM | `fundamental-` |

### Available Structures

| Structure | When to Use | Reference |
|-----------|-------------|-----------|
| Multi-Index Map | O(1) lookup by multiple fields on the same collection | `structure-multi-index-map.md` |
| LRU Cache | Bounded cache with least-recently-used eviction | `structure-lru-cache.md` |
| Bloom Filter | Fast "definitely not in set" checks on massive sets | `structure-bloom-filter.md` |
| Ring Buffer | Fixed-capacity FIFO with automatic overwrite | `structure-ring-buffer.md` |
| Trie / Prefix Tree | Prefix-based string operations (autocomplete, routing) | `structure-trie.md` |
| Sorted Slice | Read-heavy ordered data with excellent cache locality | `structure-sorted-slice.md` |
| Concurrent Map (Go) | Read-optimized map for high-concurrency goroutine access | `structure-concurrent-map.md` |
| Bitset | Membership and set operations on small bounded universes | `structure-bitset.md` |
| Object Pool (Go) | Reducing GC pressure by reusing hot-path allocations | `structure-object-pool.md` |

### Language-Specific Performance

- `references/lang-go-performance.md` — Maps, slices, strings, allocations, concurrency primitives
- `references/lang-typescript-performance.md` — Objects vs Maps, arrays, TypedArrays, V8 JIT behavior

### Fundamentals Reference

- `references/fundamental-arrays-lists.md` — Arrays, linked lists, stacks, queues, deques
- `references/fundamental-hash-trees.md` — Hash tables, sets, BSTs, heaps, B-trees, tries, segment trees
- `references/fundamental-graphs-advanced.md` — Graphs, sets/maps, union-find, bloom filters, persistent structures

## Decision Checklist

Before building a custom data structure, verify:

- [ ] Profiling (not intuition) identifies this data access as a bottleneck
- [ ] The access pattern doesn't match any stdlib structure well
- [ ] The expected speedup is 10x+ on the hot operation, OR the custom structure eliminates significant workaround code
- [ ] The data set is large enough that algorithmic complexity matters (not n=50)
- [ ] The structure's contract is clearly defined (what operations, what complexity, what thread-safety)
- [ ] Benchmarks exist comparing the custom structure to the stdlib alternative on realistic data
- [ ] The structure is well-tested, including edge cases (empty, single element, at capacity, concurrent access)
- [ ] Documentation explains when to use this structure and when to stick with stdlib
- [ ] Ownership is clear — someone will maintain this when bugs surface

The fastest data structure is the one you don't need. The second fastest is the right stdlib structure used correctly. Custom structures are the third option — powerful, but they carry maintenance cost. Build them when the evidence demands it.
