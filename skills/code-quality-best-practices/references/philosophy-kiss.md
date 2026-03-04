---
title: Apply KISS — Compress Capability Into Minimal Conceptual Surface
impact: CRITICAL
impactDescription: Reduces cognitive load by 50-80%, cuts maintenance cost proportionally
tags: kiss, simplicity, abstraction, complexity, philosophy
---

## Apply KISS — Compress Capability Into Minimal Conceptual Surface

Simplicity is not the absence of capability — it is the compression of capability into the smallest conceptual surface area. Prefer the boring solution that works over the clever solution that impresses. Measure complexity by the number of things a developer must hold in their head simultaneously.

**Incorrect (clever but fragile — requires understanding bitwise ops, implicit state, and recursion):**

```typescript
// "Elegant" but only one person can maintain this
function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>(
    (acc, val) =>
      acc.concat(
        Array.isArray(val) ? flatten(val as (T | T[])[]) : (val as T)
      ),
    []
  );
}

// Clever memoization with WeakMap and Proxy
const memoize = <T extends object, R>(fn: (arg: T) => R) =>
  new Proxy(fn, {
    apply: (target, thisArg, [arg]) =>
      (cache.get(arg) ?? (cache.set(arg, target.call(thisArg, arg)), cache.get(arg)))!,
  });
```

**Correct (boring but maintainable — any engineer can understand and modify):**

```typescript
// Clear intent, standard approach, easy to debug
function flatten<T>(items: (T | T[])[]): T[] {
  return items.flat(Infinity) as T[];
}

// Simple memoization with explicit cache
function memoize<TArg, TResult>(fn: (arg: TArg) => TResult): (arg: TArg) => TResult {
  const cache = new Map<TArg, TResult>();

  return (arg: TArg): TResult => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}
```

Every abstraction must pay for itself. If it doesn't simplify at least three call sites or eliminate a class of bugs, it is premature. "What is the simplest thing that could possibly work?" is a design methodology, not a joke.
