---
title: Test Data Builders Over Raw Literals
impact: HIGH
impactDescription: Makes tests readable — you see only what's relevant, not 15 fields of noise
tags: architecture, test-data, builders, factories, readability, maintenance
---

## Test Data Builders Over Raw Literals

When tests need complex objects, builder functions set sensible defaults and let each test override only what's relevant to that test. This eliminates noise — a test for severity-based routing shouldn't need to specify the finding's title, service, creation date, and 12 other fields.

**Incorrect (raw object literals with full field specification):**

```typescript
test("critical findings trigger immediate notification", async () => {
    const finding = {
        id: "f8d7e6c5-b4a3-2190-0000-abcdef123456",
        title: "SQL Injection in auth handler",       // irrelevant to this test
        description: "Found via automated scan...",    // irrelevant
        severity: "critical",                          // THIS is what matters
        status: "open",                                // irrelevant
        service: "auth-service",                       // irrelevant
        assignee: "security-team",                     // irrelevant
        tags: ["injection", "auth"],                   // irrelevant
        createdAt: new Date("2024-01-15T10:30:00Z"),  // irrelevant
        updatedAt: new Date("2024-01-15T10:30:00Z"),  // irrelevant
        source: "scanner",                             // irrelevant
        confidence: 0.95,                              // irrelevant
    };
    // 12 lines of noise obscuring the one field that matters
    expect(await shouldNotifyImmediately(finding)).toBe(true);
});
```

**Correct (builder with sensible defaults, override only what matters):**

```typescript
function buildFinding(overrides: Partial<Finding> = {}): Finding {
    return {
        id: randomUUID(),
        title: "Test finding",
        description: "Test description",
        severity: "medium",
        status: "open",
        service: "test-service",
        assignee: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: "manual",
        confidence: 1.0,
        ...overrides,
    };
}

test("critical findings trigger immediate notification", async () => {
    const finding = buildFinding({ severity: "critical" });
    expect(await shouldNotifyImmediately(finding)).toBe(true);
});

test("medium findings do not trigger immediate notification", async () => {
    const finding = buildFinding({ severity: "medium" });
    expect(await shouldNotifyImmediately(finding)).toBe(false);
});
```

```go
func NewTestFinding(overrides ...func(*Finding)) Finding {
    f := Finding{
        ID:        uuid.New().String(),
        Title:     "Test finding",
        Severity:  SeverityMedium,
        Status:    StatusOpen,
        Service:   "test-service",
        CreatedAt: time.Now(),
    }
    for _, o := range overrides {
        o(&f)
    }
    return f
}

// In test — only the relevant field is visible
critical := NewTestFinding(func(f *Finding) {
    f.Severity = SeverityCritical
})
```

The test reads like a specification: "a critical finding triggers immediate notification." No noise.
