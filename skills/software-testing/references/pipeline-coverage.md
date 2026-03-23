---
title: Coverage Ratchet — Never Decrease, Don't Target
impact: MEDIUM-HIGH
impactDescription: Ensures new code is tested without requiring retroactive coverage of legacy code
tags: pipeline, coverage, ratchet, threshold, ci-gate
---

## Coverage Ratchet — Never Decrease, Don't Target

Don't set a global coverage target ("all code must be 80% covered"). That either forces busywork on legacy code or encourages meaningless tests to hit the number. Instead, set a ratchet: coverage of CHANGED files must not decrease. New code must be tested; existing code isn't penalized retroactively.

**Incorrect (global coverage target drives meaningless tests):**

```typescript
// Developer needs to ship a critical fix but coverage is at 79.8%
// Writes tests like these to cross the 80% threshold:
test("constructor exists", () => {
    const service = new FindingService(db);
    expect(service).toBeDefined(); // +2% coverage, 0% confidence
});

test("getter returns value", () => {
    const finding = new Finding({ title: "test" });
    expect(finding.title).toBe("test"); // tests the language, not the code
});

// Coverage: 80.1%. Confidence: unchanged. Time wasted: real.
```

**Correct (ratchet on changed files, higher floor for critical paths):**

```yaml
# CI configuration — coverage rules
coverage:
  # Changed files must not decrease in coverage
  diff-threshold: 0%

  # Critical paths have a higher floor
  overrides:
    - path: "src/auth/**"
      min: 90%
    - path: "src/billing/**"
      min: 90%
    - path: "src/data/migrations/**"
      min: 85%

  # Glue code and config have relaxed expectations
  exclude:
    - "src/config/**"
    - "src/generated/**"
    - "**/*.d.ts"
```

```typescript
// New code gets real tests — the ratchet ensures this naturally
test("rate limiter blocks after threshold", async () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
    const clock = new FakeClock();

    // First 3 requests succeed
    for (let i = 0; i < 3; i++) {
        expect(await limiter.check("user-1", { clock })).toBe(true);
    }

    // 4th request blocked
    expect(await limiter.check("user-1", { clock })).toBe(false);

    // After window expires, requests succeed again
    clock.advance(1001);
    expect(await limiter.check("user-1", { clock })).toBe(true);
});
```

Coverage as a ratchet gives teams the right incentive: test what you change, invest testing effort where it matters most (auth, payments, data integrity), and don't waste time writing vacuous tests to hit a number.
