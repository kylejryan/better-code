---
title: Sorted Slice + Binary Search — Cache-Friendly Ordered Data
impact: HIGH
impactDescription: Often outperforms balanced trees up to ~100k elements due to contiguous memory layout and CPU cache locality
tags: sorted-slice, binary-search, ordered, range-query, cache-locality
---

## Sorted Slice + Binary Search — Cache-Friendly Ordered Data

Ordered data that's built once (or infrequently modified) and queried many times. Simpler and faster than tree structures for static or mostly-static data due to cache locality.

A sorted slice stores elements contiguously in memory. Binary search over a contiguous array has excellent CPU cache behavior. A tree stores elements scattered across the heap with pointers — every tree traversal step is a potential cache miss.

**Incorrect (tree structure for static data):**

```go
// Using a tree for data that's sorted once at startup
// Each node is a heap allocation; traversal chases pointers
type Node struct {
    Value int
    Left  *Node
    Right *Node
}
// 100k nodes = 100k allocations, poor cache behavior for range scans
```

**Correct (Go sorted slice):**

```go
type SortedSlice[T any] struct {
    data []T
    less func(a, b T) bool
}

func NewSortedSlice[T any](data []T, less func(a, b T) bool) *SortedSlice[T] {
    s := &SortedSlice[T]{data: data, less: less}
    sort.Slice(s.data, func(i, j int) bool { return less(s.data[i], s.data[j]) })
    return s
}

func (s *SortedSlice[T]) Search(target T) (int, bool) {
    i := sort.Search(len(s.data), func(i int) bool {
        return !s.less(s.data[i], target)
    })
    if i < len(s.data) && !s.less(target, s.data[i]) {
        return i, true
    }
    return i, false
}

// Range query: two binary searches
func (s *SortedSlice[T]) Range(low, high T) []T {
    start := sort.Search(len(s.data), func(i int) bool {
        return !s.less(s.data[i], low)
    })
    end := sort.Search(len(s.data), func(i int) bool {
        return s.less(high, s.data[i])
    })
    return s.data[start:end]
}
```

**Correct (TypeScript sorted array):**

```typescript
class SortedArray<T> {
    private data: T[];
    private compare: (a: T, b: T) => number;

    constructor(data: T[], compare: (a: T, b: T) => number) {
        this.compare = compare;
        this.data = [...data].sort(compare);
    }

    search(target: T): { index: number; found: boolean } {
        let lo = 0, hi = this.data.length;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (this.compare(this.data[mid], target) < 0) lo = mid + 1;
            else hi = mid;
        }
        return {
            index: lo,
            found: lo < this.data.length && this.compare(this.data[lo], target) === 0,
        };
    }

    range(low: T, high: T): T[] {
        const start = this.search(low).index;
        const end = this.search(high).index;
        return this.data.slice(start, end);
    }
}
```

**Performance:** O(log n) search, O(n) insert (due to shift). Excellent for read-heavy, write-rare data. Often outperforms balanced trees up to ~100k elements due to cache locality.
