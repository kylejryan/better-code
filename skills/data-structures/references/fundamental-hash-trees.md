---
title: Fundamental Data Structures — Hash Tables, Trees, Heaps, Tries
impact: MEDIUM
impactDescription: Reference for complexity characteristics and use cases of hash-based and tree-based structures
tags: hash-table, hash-map, hash-set, bst, avl, red-black, heap, b-tree, trie, segment-tree, fundamentals
---

## Fundamental Data Structures — Hash Tables, Trees, Heaps, Tries

Hash-based structures provide O(1) average-case lookups for unordered data; tree-based structures provide O(log n) operations with ordering guarantees. Choose based on whether you need sorted access or just fast key lookup.

**Incorrect (using a sorted tree when only exact-key lookup is needed):**

```go
// Maintaining sorted order for data that's only ever looked up by exact key
// O(log n) per lookup instead of O(1), plus tree overhead
type Node struct {
    Key   string
    Value int
    Left  *Node
    Right *Node
}

func find(root *Node, key string) (int, bool) {
    for root != nil {
        if key < root.Key { root = root.Left }
        else if key > root.Key { root = root.Right }
        else { return root.Value, true }
    }
    return 0, false
}
```

**Correct (use a hash map for O(1) exact-key lookup):**

```go
// O(1) average lookup — no ordering overhead when ordering isn't needed
data := make(map[string]int)
func find(key string) (int, bool) {
    v, ok := data[key]
    return v, ok
}
```

### Hash-Based Structures

**Hash table / hash map:** Key-value store with average O(1) insert/find/delete, worst-case O(n) if degenerate.

**Collision handling:** chaining (buckets with lists), open addressing (linear probing, quadratic, double hashing).

**Hash set:** Value-only version of hash map; supports fast membership checks.

**Typical uses:** symbol tables, indexes, caching, implementing sets, frequency maps, adjacency maps for graphs.

### Trees

**Binary search tree (BST):** In-order traversal yields sorted keys; average O(log n) search/insert/delete, but O(n) if unbalanced.

**Self-balancing BSTs:** AVL, red-black, splay, treap, scapegoat, B-trees; maintain height O(log n).

**Heaps:** Binary heap, binomial heap, Fibonacci heap; support insert and extract-min/max in O(log n) (or better amortized), used as priority queues.

**Multiway / external trees:** B-tree, B+ tree, B* tree for disk-resident indexes; N-ary trees, tries for prefix-based lookup.

**Typical uses:** ordered maps/sets, database indexes, filesystems, schedulers, priority queues, interval and range queries.

### Specialized Trees

**Tries (prefix trees):** Path from root encodes key; lookup time proportional to key length, good for dictionaries and autocomplete.

**Segment trees:** Store aggregate information (min/max/sum) for intervals; support O(log n) range queries and updates.

**Fenwick tree (BIT):** More compact than segment tree, supports prefix sums and updates in O(log n).

**Other:** interval trees, range trees, KD-trees, quad-trees, suffix trees/arrays for string algorithms.

### Sets, Multisets, and Maps

**Set / ordered set:** "No duplicates" collection; hash-backed (unordered, O(1)) or tree-backed (ordered, O(log n)).

**Map / dictionary:** Key-value store; ordered (tree-based) or unordered (hash-based).

**Multiset / multimap:** Allow duplicate keys or values; typically tree-backed.

**Typical uses:** membership, indexing, frequency counts, relational-style joins and grouping.
