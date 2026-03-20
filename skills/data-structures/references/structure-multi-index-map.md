---
title: Multi-Index Map — O(1) Lookup by Multiple Fields
impact: HIGH
impactDescription: Eliminates O(n) scans when the same collection needs lookup by 3+ different fields
tags: multi-index, secondary-index, lookup, map, index
---

## Multi-Index Map — O(1) Lookup by Multiple Fields

When you have a collection of records and need O(1) lookup by multiple different fields. Example: scan findings indexed by ID, by service name, by severity, and by CWE — any of which may be the lookup key depending on the code path.

Without a multi-index map, you maintain parallel maps (byID, byService, bySeverity) and manually keep them in sync on every insert/update/delete. This is error-prone and verbose. A multi-index map encapsulates the synchronization.

**Interface:**
```
Insert(item T)
Delete(key K)
GetByPrimary(key K) → T
GetByIndex(indexName, value) → []T
Update(key K, mutator func(T) T)
Iterate() → iterator over all items
Count() → int
```

**Incorrect (manually synchronized parallel maps):**

```go
type FindingStore struct {
    byID       map[string]*Finding
    byService  map[string][]*Finding
    bySeverity map[string][]*Finding
}

func (s *FindingStore) Insert(f *Finding) {
    s.byID[f.ID] = f
    s.byService[f.Service] = append(s.byService[f.Service], f)
    s.bySeverity[f.Severity] = append(s.bySeverity[f.Severity], f)
    // Bug: forgot to update byCWE index added last week
}

func (s *FindingStore) Delete(id string) {
    f := s.byID[id]
    delete(s.byID, id)
    // Bug: need to find and remove from byService and bySeverity slices
    // This is O(n) and error-prone
}
```

**Correct (Go multi-index map):**

```go
type MultiIndex[K comparable, T any] struct {
    primary  map[K]T
    indices  map[string]map[any][]K  // indexName → indexValue → primary keys
    keyFn    func(T) K
    indexFns map[string]func(T) any
}

func NewMultiIndex[K comparable, T any](
    keyFn func(T) K,
    indexFns map[string]func(T) any,
) *MultiIndex[K, T] {
    mi := &MultiIndex[K, T]{
        primary:  make(map[K]T),
        indices:  make(map[string]map[any][]K),
        keyFn:    keyFn,
        indexFns: indexFns,
    }
    for name := range indexFns {
        mi.indices[name] = make(map[any][]K)
    }
    return mi
}

func (mi *MultiIndex[K, T]) Insert(item T) {
    key := mi.keyFn(item)
    mi.primary[key] = item
    for name, fn := range mi.indexFns {
        val := fn(item)
        mi.indices[name][val] = append(mi.indices[name][val], key)
    }
}

func (mi *MultiIndex[K, T]) GetByIndex(indexName string, value any) []T {
    keys := mi.indices[indexName][value]
    results := make([]T, 0, len(keys))
    for _, k := range keys {
        results = append(results, mi.primary[k])
    }
    return results
}
```

**Correct (TypeScript multi-index map):**

```typescript
class MultiIndex<K, T> {
    private primary: Map<K, T> = new Map();
    private indices: Map<string, Map<unknown, Set<K>>> = new Map();
    private keyFn: (item: T) => K;
    private indexFns: Map<string, (item: T) => unknown>;

    constructor(keyFn: (item: T) => K, indexFns: Record<string, (item: T) => unknown>) {
        this.keyFn = keyFn;
        this.indexFns = new Map(Object.entries(indexFns));
        for (const name of this.indexFns.keys()) {
            this.indices.set(name, new Map());
        }
    }

    insert(item: T): void {
        const key = this.keyFn(item);
        this.primary.set(key, item);
        for (const [name, fn] of this.indexFns) {
            const val = fn(item);
            const idx = this.indices.get(name)!;
            if (!idx.has(val)) idx.set(val, new Set());
            idx.get(val)!.add(key);
        }
    }

    getByIndex(indexName: string, value: unknown): T[] {
        const keys = this.indices.get(indexName)?.get(value);
        if (!keys) return [];
        return [...keys].map(k => this.primary.get(k)!);
    }
}
```

**Performance:** O(1) lookup on any index. O(number of indices) insert/delete overhead. Memory overhead: one extra map entry per index per item. Worth it when you have 3+ access paths into the same data set.
