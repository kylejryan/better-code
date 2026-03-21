---
title: Fundamental Data Structures — Graphs, Union-Find, Probabilistic, Persistent
impact: MEDIUM
impactDescription: Reference for complexity characteristics and use cases of graph and advanced data structures
tags: graph, adjacency-list, adjacency-matrix, dag, union-find, disjoint-set, bloom-filter, persistent, sparse, fundamentals
---

## Fundamental Data Structures — Graphs, Union-Find, Probabilistic, Persistent

Graph representations and advanced structures serve specialized access patterns — choose adjacency lists for sparse graphs, matrices for dense graphs, and probabilistic structures when approximate answers save orders of magnitude in memory.

**Incorrect (adjacency matrix for a sparse dependency graph):**

```go
// 10k nodes, ~20k edges → matrix wastes O(V²) = 100M entries for 20k edges
type Graph struct {
    matrix [10000][10000]bool  // 100 MB for a sparse graph
}

func (g *Graph) HasEdge(from, to int) bool {
    return g.matrix[from][to]
}
```

**Correct (adjacency list for sparse graphs):**

```go
// O(V+E) space — only stores edges that exist
type Graph struct {
    adj map[int][]int  // 10k keys, ~20k total edge entries
}

func (g *Graph) HasEdge(from, to int) bool {
    for _, neighbor := range g.adj[from] {
        if neighbor == to { return true }
    }
    return false
}
// For frequent edge existence checks on sparse graphs, use map[int]map[int]struct{}
```

### Graphs

**Graph:** Set of vertices and edges; can be directed/undirected, weighted/unweighted, simple/multigraph.

**Representations:**
- **Adjacency list:** space O(V+E), good for sparse graphs.
- **Adjacency matrix:** O(V²) space, fast O(1) edge existence queries, good for dense graphs.

**Higher-level variants:** DAGs, trees as special graphs, flow networks, hypergraphs.

**Typical uses:** networks (social, communication, roads), dependency graphs, compilers (CFGs), circuit design, recommendation systems.

### Disjoint-Set (Union-Find)

Maintains dynamic partition of elements into disjoint sets. Supports find and union with near-constant amortized time using union by rank + path compression.

**Typical uses:** connected components, Kruskal's MST, equivalence classes, cycle detection in undirected graphs.

### Probabilistic Structures

**Bloom filter:** Space-efficient membership with false positives; useful in caches and distributed systems.

**Count-min sketch:** Approximate frequency counting in sublinear space.

**HyperLogLog:** Approximate cardinality estimation.

**Typical uses:** deduplication, cache pre-filtering, stream processing, distributed systems.

### Persistent Structures

Versions of lists/trees that support efficient snapshots and history. Common in functional languages.

**Typical uses:** undo/redo, time-travel debugging, immutable data stores, concurrent data access without locks.

### Sparse Structures

Sparse matrices, compressed sparse row/column formats for linear algebra on graphs and high-dimensional data.

**Typical uses:** graph algorithms at scale, machine learning, scientific computing, recommendation engines.
