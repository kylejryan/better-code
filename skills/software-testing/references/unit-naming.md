---
title: Test Naming as Specification
impact: HIGH
impactDescription: Test names become living documentation of expected behavior
tags: unit, naming, readability, specification, documentation
---

## Test Naming as Specification

Test names should describe the behavior being verified, not the implementation being called. When a test fails, the name alone should tell you what behavior broke. Good test names read like specifications — they document what the system promises.

**Incorrect (names describe implementation, not behavior):**

```go
func TestCalculateDiscount(t *testing.T) {
    // What about it? What's the expected behavior?
}

func TestParseInput(t *testing.T) {
    // Fails — but was it a valid input that should parse, or invalid that should reject?
}

func TestHandleRequest(t *testing.T) {
    // Which request? What's the expected outcome?
}
```

```typescript
test("createUser", () => { /* ... */ });
test("discount function", () => { /* ... */ });
test("error case", () => { /* ... */ });
```

**Correct (names describe behavior and conditions):**

```go
func TestDiscountCalculation_AppliesTieredDiscount(t *testing.T) { /* ... */ }
func TestDiscountCalculation_ReturnsZeroForUnknownTier(t *testing.T) { /* ... */ }
func TestParseSeverity_RejectsEmptyString(t *testing.T) { /* ... */ }
func TestParseSeverity_IsCaseInsensitive(t *testing.T) { /* ... */ }
func TestAuthMiddleware_RejectsExpiredToken(t *testing.T) { /* ... */ }
func TestAuthMiddleware_AllowsValidTokenForMatchingTenant(t *testing.T) { /* ... */ }
```

```typescript
test("applies tiered discount for gold customers over $100", () => { /* ... */ });
test("returns zero discount for unknown customer tier", () => { /* ... */ });
test("rejects duplicate email with descriptive error", () => { /* ... */ });
test("revoked token returns 401 even if not expired", () => { /* ... */ });
```

When the CI report shows `TestAuthMiddleware_RejectsExpiredToken FAIL`, you know exactly what broke without reading the test body.
