---
title: Every Abstraction Must Satisfy the Three Cs — Composable, Constraining, Complete
impact: CRITICAL
impactDescription: Bad abstractions are worse than no abstraction — they carry indirection cost with none of the reuse benefits
tags: abstraction, composable, constraining, complete, design, leverage
---

## Every Abstraction Must Satisfy the Three Cs — Composable, Constraining, Complete

Bad abstractions are worse than no abstraction because they carry the cognitive cost of indirection while providing none of the benefits of reuse. Every abstraction must be:

1. **Composable**: Can be combined with other abstractions without special-casing. If using A with B requires an `if` statement, the boundary is wrong.
2. **Constraining**: Makes incorrect usage difficult or impossible. Doesn't just make the right thing easy — makes the wrong thing hard.
3. **Complete** (for its scope): Handles the full problem within its declared boundary. Partial coverage is a trap, not an abstraction.

**Incorrect (abstraction that fails the Three Cs):**

```typescript
// Fails Composable: requires special-casing to combine with caching
class HttpClient {
  async get(url: string): Promise<Response> {
    if (this.cacheEnabled) { // Special-casing for composition
      const cached = this.cache.get(url);
      if (cached) return cached;
    }
    const response = await fetch(url);
    if (this.cacheEnabled) this.cache.set(url, response);
    return response;
  }
}

// Fails Complete: handles GET but not POST, PUT, DELETE
// Fails Constraining: accepts any string as URL, any object as body
class ApiClient {
  async get(url: string): Promise<any> { /* ... */ }
  // Where's POST? PUT? DELETE? Callers will bypass the abstraction.
}
```

**Correct (abstraction satisfying all Three Cs):**

```typescript
// Composable: middleware composes without special-casing
type Middleware = (next: HttpHandler) => HttpHandler;
type HttpHandler = (request: Request) => Promise<Response>;

const withCache: Middleware = (next) => async (request) => {
  const cached = cache.get(request.url);
  if (cached) return cached;
  const response = await next(request);
  cache.set(request.url, response);
  return response;
};

const withRetry: Middleware = (next) => async (request) => {
  return retryWithBackoff(() => next(request), { maxAttempts: 3 });
};

// Compose freely: order doesn't matter, no special-casing
const client = pipe(baseFetch, withCache, withRetry, withLogging);

// Constraining: typed routes prevent invalid URLs
// Complete: handles all HTTP methods through a single abstraction
```

If your abstraction requires escape hatches, raw access, or "just this once" bypasses, the boundary is wrong. Redesign it.
