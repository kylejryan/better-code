---
title: Arrange-Act-Assert Structure
impact: HIGH
impactDescription: Makes test failures immediately diagnosable
tags: unit, structure, arrange-act-assert, aaa, readability
---

## Arrange-Act-Assert Structure

Every unit test has exactly three sections: Arrange (set up state), Act (execute the behavior), Assert (verify the result). If you can't clearly identify these three sections, the test is doing too much. One logical assertion per test — verify one behavior so failures tell you exactly what broke.

**Incorrect (mixed concerns, multiple behaviors, unclear structure):**

```typescript
test("discount", () => {
    const order = { subtotal: 150_00, customerTier: "gold" };
    const discount = calculateDiscount(order);
    expect(discount).toBe(15_00);
    const tax = calculateTax(order, discount);
    expect(tax).toBe(13_50);
    const shipping = calculateShipping(order);
    expect(shipping).toBe(0);
    const total = order.subtotal - discount + tax + shipping;
    expect(total).toBe(148_50);
    // When this fails, which calculation broke? Unknown.
});
```

**Correct (clear AAA structure, one behavior per test):**

```typescript
test("applies tiered discount for gold customers over $100", () => {
    // Arrange
    const order = { subtotal: 150_00, customerTier: "gold" };

    // Act
    const discount = calculateDiscount(order);

    // Assert
    expect(discount).toBe(15_00);
});

test("gold customers under $100 receive no discount", () => {
    // Arrange
    const order = { subtotal: 50_00, customerTier: "gold" };

    // Act
    const discount = calculateDiscount(order);

    // Assert
    expect(discount).toBe(0);
});
```

```go
func TestDiscountCalculation_AppliesTieredDiscount(t *testing.T) {
    // Arrange
    order := Order{Subtotal: 150_00, CustomerTier: "gold"}

    // Act
    discount := CalculateDiscount(order)

    // Assert
    if discount != 15_00 {
        t.Errorf("expected 1500 discount for gold tier $150 order, got %d", discount)
    }
}
```

When a test with clear AAA structure fails, the name tells you what behavior broke, and the assertion tells you how the actual result diverged from expected.
