---
title: Concurrent Read-Optimized Map (Go) — Zero-Lock Reads via Copy-on-Write
impact: HIGH
impactDescription: Eliminates read lock contention for maps read thousands of times/sec by many goroutines
tags: concurrent, copy-on-write, atomic, rwmutex, goroutine, go
---

## Concurrent Read-Optimized Map (Go) — Zero-Lock Reads via Copy-on-Write

Map that's read thousands of times per second by many goroutines but written infrequently. Common for: configuration caches, feature flags, resolved references, lookup tables refreshed periodically.

**Why sync.Map often isn't the answer:** sync.Map is optimized for (1) keys written once and read many times, and (2) disjoint key sets across goroutines. For a general read-heavy map with periodic full replacement, a simpler approach often wins.

**Incorrect (mutex on every read):**

```go
type ConfigCache struct {
    mu   sync.Mutex
    data map[string]string
}

func (c *ConfigCache) Get(key string) string {
    c.mu.Lock()         // every read takes a full lock
    defer c.mu.Unlock() // all readers serialize
    return c.data[key]
}
```

**Correct (copy-on-write pattern):**

```go
type COWMap[K comparable, V any] struct {
    data atomic.Pointer[map[K]V]
}

func NewCOWMap[K comparable, V any]() *COWMap[K, V] {
    m := &COWMap[K, V]{}
    empty := make(map[K]V)
    m.data.Store(&empty)
    return m
}

func (m *COWMap[K, V]) Get(key K) (V, bool) {
    current := *m.data.Load()
    v, ok := current[key]
    return v, ok
}

func (m *COWMap[K, V]) Replace(newData map[K]V) {
    m.data.Store(&newData)
}
```

Readers access the map with zero locking (atomic pointer load). Writers build a complete new map and atomically swap the pointer. Old map is GC'd once all readers finish.

Ideal when: writes are infrequent (bulk replacement, not per-key updates), the map fits comfortably in memory twice (old + new during swap), and read performance is the priority.

**Alternative (RWMutex for per-key updates):**

```go
type RWMap[K comparable, V any] struct {
    mu   sync.RWMutex
    data map[K]V
}

func (m *RWMap[K, V]) Get(key K) (V, bool) {
    m.mu.RLock()
    defer m.mu.RUnlock()
    v, ok := m.data[key]
    return v, ok
}

func (m *RWMap[K, V]) Set(key K, value V) {
    m.mu.Lock()
    defer m.mu.Unlock()
    m.data[key] = value
}
```

Simpler, supports per-key mutation, but readers contend on the RWMutex (readers don't block each other, but writers block everyone). Fine unless you have extremely high read concurrency.

**Performance comparison:**
- `atomic.Load`: ~1ns per read, zero contention
- `sync.RWMutex.RLock`: ~25ns per read, readers don't block each other
- `sync.Mutex.Lock`: ~20ns per read, all readers serialize
- `chan`-based: ~50ns overhead, inappropriate for read-heavy patterns
