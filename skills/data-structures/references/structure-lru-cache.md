---
title: LRU Cache — Bounded Cache with Least-Recently-Used Eviction
impact: HIGH
impactDescription: O(1) get/put with automatic memory-bounded eviction for caching expensive computations
tags: lru, cache, eviction, bounded, least-recently-used
---

## LRU Cache — Bounded Cache with Least-Recently-Used Eviction

Bounded cache where the least recently used item is evicted when capacity is reached. Common for: caching expensive computations, parsed results, API responses, or resolved references.

**Interface:**
```
Get(key K) → (V, bool)    // returns value and whether found; marks as recently used
Put(key K, value V)         // inserts or updates; evicts LRU item if at capacity
Delete(key K)
Len() → int
Clear()
```

**Incorrect (unbounded cache — memory leak):**

```typescript
// Grows forever, no eviction, eventual OOM
const cache = new Map<string, ParsedResult>();
function getParsed(key: string): ParsedResult {
    if (!cache.has(key)) cache.set(key, expensiveParse(key));
    return cache.get(key)!;
}
```

**Correct (Go LRU — doubly-linked list + hash map):**

```go
type LRUCache[K comparable, V any] struct {
    capacity int
    items    map[K]*list.Element
    order    *list.List  // front = most recent, back = least recent
}

type entry[K comparable, V any] struct {
    key   K
    value V
}

func NewLRU[K comparable, V any](capacity int) *LRUCache[K, V] {
    return &LRUCache[K, V]{
        capacity: capacity,
        items:    make(map[K]*list.Element, capacity),
        order:    list.New(),
    }
}

func (c *LRUCache[K, V]) Get(key K) (V, bool) {
    if el, ok := c.items[key]; ok {
        c.order.MoveToFront(el)
        return el.Value.(*entry[K, V]).value, true
    }
    var zero V
    return zero, false
}

func (c *LRUCache[K, V]) Put(key K, value V) {
    if el, ok := c.items[key]; ok {
        c.order.MoveToFront(el)
        el.Value.(*entry[K, V]).value = value
        return
    }
    if c.order.Len() >= c.capacity {
        oldest := c.order.Back()
        c.order.Remove(oldest)
        delete(c.items, oldest.Value.(*entry[K, V]).key)
    }
    el := c.order.PushFront(&entry[K, V]{key: key, value: value})
    c.items[key] = el
}
```

**Correct (TypeScript LRU — exploiting Map insertion order):**

```typescript
class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, V> = new Map();

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.cache.delete(key);  // remove
            this.cache.set(key, value);  // re-insert at end (most recent)
        }
        return value;
    }

    put(key: K, value: V): void {
        this.cache.delete(key);  // remove if exists (resets position)
        if (this.cache.size >= this.capacity) {
            // Evict oldest (first key in insertion order)
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
        this.cache.set(key, value);
    }
}
```

The TS approach is simpler than the linked-list method and performs well for moderate cache sizes.

**Performance:** O(1) get and put. Memory overhead: one linked-list node per entry (Go) or negligible (TS Map approach). The Go version is better for high-throughput concurrent access with a RWMutex wrapper.
