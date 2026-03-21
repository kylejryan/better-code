---
title: Match Access Patterns to the Right Data Structure
impact: CRITICAL
impactDescription: Correct pattern-to-structure mapping eliminates O(n) operations on hot paths
tags: decision-tree, pattern-matching, lookup, membership, ordered, specialized
---

## Match Access Patterns to the Right Data Structure

Use this decision map. Read left to right — the first matching pattern determines the candidate structure.

### Exact Key Lookup (most common)

```
Need O(1) lookup by single key?
├─ Keys are strings or simple types → hash map (Go: map[K]V, TS: Map<K,V>)
│   ├─ Hot subset exists → LRU cache in front of the map
│   ├─ Reads >> writes + concurrent → Go: sync.Map or read-optimized RWMutex map
│   └─ Need insertion-order iteration → Go: custom ordered map, TS: Map (ordered by spec)
├─ Need lookup by MULTIPLE keys (same data, different paths) → multi-index map
├─ Need prefix lookup on string keys → trie or radix tree
└─ Need range queries on keys → sorted structure (B-tree, skip list, sorted slice + binary search)
```

### Collection Membership / Set Operations

```
Need fast "is X in the set?" checks?
├─ Set is static (built once, queried many times)
│   ├─ Small set (< 64 elements of small ints/enums) → bitset
│   ├─ Medium set (< 10k) → sorted slice + binary search
│   ├─ Large set + approximate OK (false positives tolerable) → bloom filter
│   └─ Large set + exact required → hash set
├─ Need union/intersection/difference operations
│   ├─ Small sets → bitset (bitwise OR/AND/XOR)
│   ├─ Sorted sets → merge-based set operations (O(n+m) sorted merge)
│   └─ Large sets → hash set with iterate-and-probe
└─ Need weighted/scored membership → sorted set (score-indexed)
```

### Ordered Data / Range Queries

```
Need elements in sorted order or range queries?
├─ Data is static (sorted once) → sorted slice + binary search (cache-friendly, simple)
├─ Data changes frequently + need sorted access
│   ├─ Need rank queries (k-th element?) → order-statistic tree or skip list
│   ├─ Need range scans → B-tree or skip list
│   └─ Need priority extraction (always get min/max) → heap (Go: container/heap)
└─ Need time-ordered data with expiry → time-wheel or sorted ring buffer
```

### Specialized Patterns

```
FIFO processing → ring buffer (bounded) or queue (unbounded)
LIFO processing → stack (slice-backed)
Rate limiting / sliding window → circular buffer with time-indexed slots
Deduplication → bloom filter (approximate) or hash set (exact)
Frequency counting → count-min sketch (approximate) or hash map (exact)
LRU eviction → doubly-linked list + hash map (classic LRU)
Hierarchical data → tree (n-ary, trie, or custom per access pattern)
Graph relationships → adjacency list (map[node][]node) or adjacency matrix (dense graphs)
Interval queries → interval tree or segment tree
Spatial queries → R-tree, k-d tree, or grid-based spatial hash
String matching → trie, Aho-Corasick automaton, suffix array
```

**Incorrect (using wrong structure for the access pattern):**

```go
// Need to check if IP is in a blocklist of 10M entries
// Using a slice — O(n) per check
var blocklist []string
func isBlocked(ip string) bool {
    for _, blocked := range blocklist {
        if blocked == ip { return true }
    }
    return false
}
```

**Correct (match the pattern: large set, exact membership, approximate OK):**

```go
// Bloom filter: O(1) check, 1.2 MB memory for 10M entries at 1% FP rate
var blocklist *BloomFilter
func isBlocked(ip string) bool {
    return blocklist.MightContain(ip) // false = definitely not blocked
}
```
