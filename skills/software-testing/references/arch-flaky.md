---
title: Flaky Test Zero Tolerance
impact: HIGH
impactDescription: Preserves trust in the test suite — a flaky suite is an ignored suite
tags: architecture, flaky, reliability, quarantine, determinism, ci
---

## Flaky Test Zero Tolerance

A flaky test — one that sometimes passes and sometimes fails without code changes — trains the team to ignore test failures. Once people start saying "oh, that's just the flaky one," trust in the entire suite erodes. A flaky test must be fixed immediately or quarantined out of the main suite.

**Incorrect (time-dependent test that fails near boundaries):**

```typescript
test("token expires after 1 hour", () => {
    const token = createToken({ userId: "123" });
    const decoded = verifyToken(token);
    // Uses real clock — fails if test runs within milliseconds of the hour boundary
    expect(decoded.expiresAt).toBe(
        new Date(Date.now() + 60 * 60 * 1000).toISOString()
    );
    // Also fails if the machine clock drifts or DST changes during test run
});
```

```go
func TestListFindings_ReturnsAll(t *testing.T) {
    db := sharedTestDB // shared mutable state
    svc := NewFindingService(db)

    findings, _ := svc.List(context.Background())
    // Depends on what other tests inserted — passes alone, fails in suite
    assert.Len(t, findings, 3)
}
```

**Correct (deterministic time, isolated state):**

```typescript
test("token expires after 1 hour", () => {
    const fixedNow = new Date("2024-01-15T10:00:00Z");
    const clock = { now: () => fixedNow };
    const token = createToken({ userId: "123" }, { clock });

    const decoded = verifyToken(token, { clock });

    expect(decoded.expiresAt).toBe("2024-01-15T11:00:00.000Z");
    // Deterministic — same result every time, on every machine
});
```

```go
func TestListFindings_ReturnsAll(t *testing.T) {
    db := setupTestDB(t) // fresh DB per test
    svc := NewFindingService(db)

    // Insert exactly what this test expects
    svc.Create(ctx, CreateInput{Title: "A"})
    svc.Create(ctx, CreateInput{Title: "B"})
    svc.Create(ctx, CreateInput{Title: "C"})

    findings, _ := svc.List(context.Background())
    assert.Len(t, findings, 3) // deterministic — always 3
}
```

Common flaky causes: time dependency (inject a clock), ordering dependency (isolate state), race conditions (proper synchronization), port collisions (dynamic allocation), floating point (epsilon comparison), non-deterministic iteration order (sort before comparing).

Detect flakiness: `go test -count=100 -run TestSuspect`. If it fails even once, it's flaky.
