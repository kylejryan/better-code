---
title: Property-Based Testing for Edge Case Discovery
impact: HIGH
impactDescription: Finds bugs hand-picked test cases miss — the weird inputs nobody thought to test
tags: advanced, property-based, fuzzing, generators, roundtrip, invariants
---

## Property-Based Testing for Edge Case Discovery

Hand-picked test cases reflect the author's assumptions. The bugs that reach production are the ones nobody thought to test. Property-based tests generate thousands of random inputs and verify that general properties hold for ALL of them — then shrink failures to the minimal reproduction case.

**Incorrect (only hand-picked examples):**

```go
func TestSerializeDeserialize(t *testing.T) {
    // Tests exactly the cases the author thought of
    input := Finding{Title: "XSS", Severity: "critical"}
    bytes, _ := Serialize(input)
    result, _ := Deserialize(bytes)
    assert.Equal(t, input, result)
    // Misses: empty title, unicode, null bytes, max-length strings,
    // special characters, deeply nested structures...
}
```

```typescript
test("serialize/deserialize roundtrip", () => {
    const input = { title: "XSS", severity: "critical" };
    expect(deserialize(serialize(input))).toEqual(input);
    // One example. Works for this input. Breaks on others.
});
```

**Correct (property-based — test the invariant, not specific examples):**

```go
import "testing/quick"

func TestSerializeDeserialize_Roundtrip(t *testing.T) {
    f := func(input Finding) bool {
        bytes, err := Serialize(input)
        if err != nil {
            return false
        }
        result, err := Deserialize(bytes)
        if err != nil {
            return false
        }
        return reflect.DeepEqual(input, result)
    }
    // Runs 100+ random Finding values through roundtrip
    if err := quick.Check(f, nil); err != nil {
        t.Error(err) // Reports the minimal failing input
    }
}
```

```typescript
import fc from "fast-check";

test("serialize/deserialize roundtrip for all findings", () => {
    fc.assert(
        fc.property(
            fc.record({
                title: fc.string(),
                severity: fc.oneof(fc.constant("critical"), fc.constant("high"),
                                   fc.constant("medium"), fc.constant("low")),
                tags: fc.array(fc.string()),
            }),
            (finding) => {
                const roundtripped = deserialize(serialize(finding));
                expect(roundtripped).toEqual(finding);
            }
        )
    );
});
```

Key properties to test: roundtrip (`deserialize(serialize(x)) == x`), idempotency (`f(f(x)) == f(x)`), invariants (`isSorted(sort(x))`), and no-crash (`f(x)` never throws for any valid input type).
