---
title: Go Performance Characteristics for Data Structure Implementation
impact: MEDIUM-HIGH
impactDescription: Understanding Go's memory model and runtime prevents building structures that fight the language
tags: go, performance, maps, slices, strings, allocation, concurrency, gc, escape-analysis
---

## Go Performance Characteristics for Data Structure Implementation

Go's runtime has specific performance characteristics around memory layout, allocation, and concurrency that directly affect data structure design. Understanding these prevents building structures that fight the language.

**Incorrect (pointer-heavy slice causing cache misses and GC pressure):**

```go
// Slice of pointers: each element is a separate heap allocation
// Poor cache locality, high GC scanning overhead for 100k+ items
type Findings struct {
    items []*Finding  // each pointer chases to a different heap location
}

func (f *Findings) Process() {
    for _, item := range f.items {
        // every access is a potential cache miss
        process(item)
    }
}
```

**Correct (value slice for cache-friendly contiguous memory):**

```go
// Slice of values: contiguous memory block, excellent cache locality
// GC only scans the slice header, not 100k pointers
type Findings struct {
    items []Finding  // packed contiguously in memory
}

func (f *Findings) Process() {
    for i := range f.items {
        // sequential memory access, CPU prefetcher works well
        process(&f.items[i])
    }
}
```

### Maps
- Go maps are hash maps with separate chaining. Good general-purpose but not exceptional for any specific pattern.
- Maps are NOT safe for concurrent read+write. Use sync.RWMutex, sync.Map, or the COW pattern.
- Preallocate with `make(map[K]V, expectedSize)` to avoid rehashing during growth.
- Map iteration order is randomized by design. If you need ordered iteration, sort the keys or use a sorted structure.

### Slices
- `append()` may allocate. If the growth pattern is known, preallocate with `make([]T, 0, expectedCap)`.
- Slice of structs (`[]Struct`) has better cache locality than slice of pointers (`[]*Struct`). Prefer value slices when structs are small (< ~128 bytes).
- For stack-allocated small arrays, use `[N]T` (array) not `[]T` (slice) if N is known at compile time.

### Strings
- Strings are immutable byte slices. Concatenation in a loop creates O(n²) allocations. Use `strings.Builder` or `bytes.Buffer`.
- String → `[]byte` conversion copies. Work in `[]byte` and convert to string once at the end.

### Allocation Patterns
- Small allocations (< 32KB) go to per-P caches (fast, no lock). Large allocations go to the heap (slower).
- Escape analysis: if the compiler can prove a variable doesn't escape the function, it's stack-allocated (free). Use `go build -gcflags="-m"` to see escape decisions.
- `sync.Pool` for recycling hot-path allocations.

### Concurrency Primitives
- `sync.Mutex` is ~20ns uncontended. `sync.RWMutex` read lock is ~25ns. `atomic.Load` is ~1ns. Choose accordingly.
- `chan` is ~50ns for unbuffered send/receive. For high-throughput data passing, consider ring buffers or batching.
- `sync.Once` for lazy initialization. `atomic.Value` for read-heavy config swaps.

### Benchmarking
- Use `go test -bench=. -benchmem` to measure allocations alongside time.
- Use `go test -bench=. -cpuprofile=cpu.prof` then `go tool pprof cpu.prof` for profiling.
- `testing.B.ResetTimer()` after setup code in benchmarks.
