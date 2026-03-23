---
title: Snapshot and Golden File Tests
impact: MEDIUM
impactDescription: Catches unintended changes to serialization formats and API response shapes
tags: advanced, snapshot, golden-file, serialization, regression, wire-format
---

## Snapshot and Golden File Tests

Snapshot tests compare output against a saved "known good" result. They catch unintended changes to serialization formats, API responses, code generation output, and CLI formatting. Use them for output where the EXACT format matters for correctness — wire formats, public APIs — not for internal representations that change frequently.

**Incorrect (snapshots for internal/volatile output — constant update churn):**

```typescript
// Snapshot of internal debug representation — changes with every refactor
test("finding debug output", () => {
    const finding = createFinding();
    expect(finding.toString()).toMatchSnapshot();
    // Snapshot: "Finding{id=abc123, created=2024-01-15T10:30:00Z, ...}"
    // Every time a field is added, reordered, or reformatted: "Update snapshot? y/n"
    // After the 50th "y", nobody examines the diff anymore
});
```

**Correct (snapshots for wire format stability):**

```typescript
// Snapshot of public API response shape — changes must be intentional
test("GET /api/findings/:id response matches expected wire format", () => {
    const finding = createTestFinding({
        id: "fixed-id",
        title: "SQL Injection",
        severity: "critical",
        createdAt: new Date("2024-01-15T00:00:00Z"),
    });
    expect(JSON.stringify(finding.toWireFormat(), null, 2)).toMatchSnapshot();
});
```

```go
func TestFindingJSON_MatchesGolden(t *testing.T) {
    finding := Finding{
        ID:        "fixed-id",
        Title:     "SQL Injection",
        Severity:  SeverityCritical,
        CreatedAt: time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC),
    }
    got, _ := json.MarshalIndent(finding, "", "  ")

    golden := filepath.Join("testdata", "finding.golden.json")
    if *update {
        os.WriteFile(golden, got, 0644)
        return
    }

    expected, _ := os.ReadFile(golden)
    if !bytes.Equal(got, expected) {
        t.Errorf("output differs from golden file:\n%s",
            cmp.Diff(string(expected), string(got)))
    }
}
```

Use deterministic inputs (fixed IDs, fixed timestamps) so snapshots are stable. When a snapshot test fails, examine the diff before updating — the whole point is to catch unintended changes.
