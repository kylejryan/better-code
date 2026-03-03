---
title: Eliminate Shared Mutable State in Concurrent Code
impact: HIGH
impactDescription: Prevents race conditions, deadlocks, and data corruption in concurrent systems
tags: concurrency, shared-state, immutability, channels, async, performance
---

## Eliminate Shared Mutable State in Concurrent Code

Shared mutable state is the root of all concurrency bugs. Eliminate it. If you can't, isolate it behind a single owner and communicate via messages or channels. Prefer immutable data in concurrent contexts. Every lock is a serialization point and a potential bottleneck.

**Incorrect (shared mutable state across concurrent operations):**

```typescript
// Shared mutable counter — race condition
let requestCount = 0;
const results: any[] = [];

async function handleRequests(urls: string[]): Promise<any[]> {
  const promises = urls.map(async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    requestCount++; // Race condition: read-modify-write is not atomic
    results.push(data); // Race condition: concurrent array mutations
    return data;
  });
  await Promise.all(promises);
  return results; // May be corrupted or incomplete
}
```

**Correct (no shared mutable state, results collected immutably):**

```typescript
// Each concurrent task returns its own result — no shared state
async function handleRequests(urls: string[]): Promise<RequestResult[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return { url, data, status: "success" as const };
      } catch (error) {
        return { url, data: null, status: "failed" as const, error };
      }
    })
  );

  // Aggregation happens after all concurrent work is done
  const successCount = results.filter((r) => r.status === "success").length;
  return results;
}
```

Understand the concurrency model of your platform: async/await, green threads, OS threads, actors, CSP channels. Use the one that fits, not the one you know. Minimize critical sections relentlessly.
