---
title: Chaos and Fault Injection Testing
impact: HIGH
impactDescription: Verifies system resilience before production failures teach you the hard way
tags: advanced, chaos, fault-injection, resilience, error-handling, circuit-breaker
---

## Chaos and Fault Injection Testing

Systems fail in production. The question is whether you've verified the failure behavior in advance or are discovering it during an incident. Fault injection tests inject failures at dependency boundaries and verify the system degrades gracefully — meaningful errors, no data corruption, recovery when the dependency returns.

**Incorrect (only testing the happy path):**

```go
func TestCreateFinding(t *testing.T) {
    db := setupTestDB(t)
    svc := NewFindingService(db)

    finding, err := svc.Create(ctx, CreateInput{Title: "XSS", Severity: "high"})
    require.NoError(t, err)
    require.NotEmpty(t, finding.ID)
    // What happens when the DB is down? When it times out?
    // When it accepts the write but the transaction fails to commit?
    // This test has no idea.
}
```

**Correct (injecting faults to test failure behavior):**

```go
// Fault-injecting wrapper
type FaultyDB struct {
    real      Database
    failAfter int
    callCount int
}

func (f *FaultyDB) Query(ctx context.Context, q string, args ...any) (Result, error) {
    f.callCount++
    if f.callCount > f.failAfter {
        return Result{}, errors.New("connection refused")
    }
    return f.real.Query(ctx, q, args...)
}

func TestCreateFinding_DBFailureMidTransaction(t *testing.T) {
    realDB := setupTestDB(t)
    faultyDB := &FaultyDB{real: realDB, failAfter: 1} // fail on second query
    svc := NewFindingService(faultyDB)

    _, err := svc.Create(ctx, CreateInput{Title: "XSS", Severity: "high"})

    // Assert graceful failure
    require.Error(t, err)
    assert.Contains(t, err.Error(), "failed to create finding")

    // Assert no partial data left behind
    findings, _ := realDB.Query(ctx, "SELECT * FROM findings")
    assert.Empty(t, findings)
}
```

```typescript
// Override fetch to inject failures for external API
test("handles external API failure gracefully", async () => {
    const faultyFetch = (url: string) => {
        if (url.includes("/external-api")) {
            return Promise.reject(new Error("ECONNREFUSED"));
        }
        return originalFetch(url);
    };

    const service = new NotificationService({ fetch: faultyFetch });
    const result = await service.notifyWithFallback(alert);

    // System should degrade gracefully, not crash
    expect(result.notified).toBe(false);
    expect(result.fallbackUsed).toBe(true);
    expect(result.error).toContain("ECONNREFUSED");
});
```

Assert: meaningful errors to callers, no data corruption on partial failure, recovery when dependencies return, timeouts fire before resource exhaustion.
