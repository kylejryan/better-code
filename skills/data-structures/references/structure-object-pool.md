---
title: Object Pool (Go) — Reduce GC Pressure by Reusing Hot-Path Allocations
impact: HIGH
impactDescription: Eliminates allocation-heavy hot paths (e.g., 4KB buffer × 10k req/s = 40MB/s garbage) by reusing objects
tags: object-pool, sync-pool, gc-pressure, allocation, go, performance
---

## Object Pool (Go) — Reduce GC Pressure by Reusing Hot-Path Allocations

Reducing GC pressure by reusing allocations for frequently created and destroyed objects of the same type. Common for: request/response objects, buffers, temporary structs in hot loops, parser state.

**Incorrect (allocating buffers on every request):**

```go
func handleRequest(w http.ResponseWriter, r *http.Request) {
    buf := make([]byte, 4096)  // 4KB allocation per request
    // use buf for parsing/processing
    // buf becomes garbage after return → GC pressure
}
// At 10k req/s = 40MB/s of garbage
```

**Correct (type-safe sync.Pool wrapper):**

```go
type Pool[T any] struct {
    pool sync.Pool
}

func NewPool[T any](factory func() T) *Pool[T] {
    return &Pool[T]{
        pool: sync.Pool{
            New: func() any { return factory() },
        },
    }
}

func (p *Pool[T]) Get() T   { return p.pool.Get().(T) }
func (p *Pool[T]) Put(x T)  { p.pool.Put(x) }
```

**Usage with reset pattern:**

```go
type ParseBuffer struct {
    buf  []byte
    pos  int
    errs []error
}

func (pb *ParseBuffer) Reset() {
    pb.pos = 0
    pb.errs = pb.errs[:0]  // keep capacity, clear length
    // Note: don't zero buf — it'll be overwritten
}

var parseBufferPool = NewPool(func() *ParseBuffer {
    return &ParseBuffer{buf: make([]byte, 4096)}
})

func handleRequest(w http.ResponseWriter, r *http.Request) {
    pb := parseBufferPool.Get()
    defer func() {
        pb.Reset()              // CRITICAL: reset before returning to pool
        parseBufferPool.Put(pb)
    }()
    // use pb for parsing
}
```

**Critical:** Objects returned from the pool may contain stale data. Always reset/zero the object after `Get()` before using it. A common pattern is a `Reset()` method on the pooled type.

**When it helps:** Go's GC is generational and fast, but allocation-heavy hot paths (e.g., allocating a 4KB buffer per request × 10k requests/second = 40MB/s of garbage) still create GC pressure. Pooling eliminates these allocations.

**When it doesn't help:** For small, short-lived values (int, small structs), the overhead of the Pool's internal synchronization exceeds the allocation cost. Profile first.
