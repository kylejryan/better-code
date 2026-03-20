---
title: TypeScript / JavaScript Performance Characteristics for Data Structure Implementation
impact: MEDIUM-HIGH
impactDescription: Understanding V8's optimization model prevents building structures that deoptimize or fight the JIT
tags: typescript, javascript, v8, performance, map, set, array, typed-array, jit
---

## TypeScript / JavaScript Performance Characteristics for Data Structure Implementation

V8's JIT compiler and memory model have specific behaviors that affect data structure performance. Understanding hidden classes, typed arrays, and monomorphism prevents building structures that deoptimize.

**Incorrect (dynamically adding properties deoptimizes V8's hidden classes):**

```typescript
// V8 creates a new hidden class for each unique property shape
// Dynamically adding properties puts the object into "dictionary mode" — slow
function buildIndex(items: Item[]): Record<string, Item> {
    const index: Record<string, Item> = {};
    for (const item of items) {
        index[item.id] = item;  // each unique key forces a new hidden class transition
    }
    return index;
    // Result: megamorphic access pattern, V8 can't optimize property access
}
```

**Correct (use Map for dynamic key sets):**

```typescript
// Map is designed for dynamic key sets — no hidden class overhead
function buildIndex(items: Item[]): Map<string, Item> {
    const index = new Map<string, Item>();
    for (const item of items) {
        index.set(item.id, item);  // Map handles dynamic keys efficiently
    }
    return index;
    // Result: O(1) lookups, no deoptimization, insertion-ordered iteration
}
```

### Objects vs Maps
- Plain objects (`{}`) are optimized by V8 for "shapes" — same properties in same order stored efficiently. Adding/deleting properties dynamically deoptimizes ("dictionary mode").
- `Map<K, V>` is better when: keys are not strings, keys are added/deleted frequently, or you need ordered iteration.
- For numeric keys, `Map` significantly outperforms objects (objects coerce numeric keys to strings).
- `Set<T>` is the stdlib membership check. O(1) add/has/delete.

### Arrays
- V8 optimizes arrays of a single type ("packed" arrays). Mixing types or creating holes triggers deoptimization.
- `TypedArrays` (Uint8Array, Float64Array, etc.) are contiguous memory buffers — dramatically faster for numeric data, no boxing overhead.
- `.push()` is amortized O(1). `.unshift()` is O(n). If you need both-ends insertion, use a deque.
- `.sort()` is Timsort — O(n log n), stable, efficient for partially sorted data.

### Memory
- Every object has ~40-80 bytes of overhead. For millions of small objects, use `TypedArrays` or `ArrayBuffer`.
- `WeakMap` / `WeakRef` for caches that shouldn't prevent garbage collection.
- Strings are interned by V8 for small strings — identity comparison can be O(1).

### V8-Specific Optimization
- Monomorphic call sites (one shape) are optimized heavily. Megamorphic (many shapes) is slow.
- Avoid creating functions in hot loops (new closures each iteration).
- `for` loops and `for...of` are faster than `.forEach()` for hot paths.

### Benchmarking
- Use `performance.now()` for microbenchmarks, but beware V8 optimizing away unused results.
- Prevent dead code elimination by assigning results to a module-level variable.
- Run benchmarks multiple times to account for JIT warmup.
