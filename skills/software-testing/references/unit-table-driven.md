---
title: Table-Driven Tests for Multi-Case Logic
impact: HIGH
impactDescription: Scales to 50+ test cases without duplication
tags: unit, table-driven, parameterized, go, typescript, data-driven
---

## Table-Driven Tests for Multi-Case Logic

When testing a function with many input/output pairs, table-driven tests eliminate duplication and make it trivial to add new cases. Each row is a test case — name, inputs, expected outputs — and a single loop runs them all.

**Incorrect (duplicated test functions for each case):**

```go
func TestParseSeverity_Critical(t *testing.T) {
    got, err := ParseSeverity("CRITICAL")
    if err != nil { t.Fatal(err) }
    if got != SeverityCritical { t.Errorf("got %v", got) }
}

func TestParseSeverity_CriticalLower(t *testing.T) {
    got, err := ParseSeverity("critical")
    if err != nil { t.Fatal(err) }
    if got != SeverityCritical { t.Errorf("got %v", got) }
}

func TestParseSeverity_Unknown(t *testing.T) {
    _, err := ParseSeverity("banana")
    if err == nil { t.Fatal("expected error") }
}

func TestParseSeverity_Empty(t *testing.T) {
    _, err := ParseSeverity("")
    if err == nil { t.Fatal("expected error") }
}
// Repetitive — and adding a new severity level means writing another full function
```

**Correct (table-driven pattern):**

```go
func TestParseSeverity(t *testing.T) {
    tests := []struct {
        name     string
        input    string
        expected Severity
        wantErr  bool
    }{
        {"critical uppercase", "CRITICAL", SeverityCritical, false},
        {"critical lowercase", "critical", SeverityCritical, false},
        {"critical mixed case", "Critical", SeverityCritical, false},
        {"high", "HIGH", SeverityHigh, false},
        {"medium", "MEDIUM", SeverityMedium, false},
        {"low", "LOW", SeverityLow, false},
        {"unknown value", "banana", SeverityUnknown, true},
        {"empty string", "", SeverityUnknown, true},
        {"whitespace only", "  ", SeverityUnknown, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseSeverity(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr = %v", err, tt.wantErr)
            }
            if got != tt.expected {
                t.Errorf("got %v, want %v", got, tt.expected)
            }
        })
    }
}
```

```typescript
// TypeScript equivalent using test.each
test.each([
    { input: "CRITICAL", expected: "critical", shouldThrow: false },
    { input: "critical", expected: "critical", shouldThrow: false },
    { input: "banana", expected: null, shouldThrow: true },
    { input: "", expected: null, shouldThrow: true },
])("parseSeverity($input) → $expected", ({ input, expected, shouldThrow }) => {
    if (shouldThrow) {
        expect(() => parseSeverity(input)).toThrow();
    } else {
        expect(parseSeverity(input)).toBe(expected);
    }
});
```

Adding a new case is one line. The test structure never changes.
