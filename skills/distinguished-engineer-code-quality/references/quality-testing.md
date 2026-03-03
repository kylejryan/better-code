---
title: Test Behavior Not Implementation — Follow the Testing Pyramid
impact: CRITICAL
impactDescription: Tests survive refactoring, catch real bugs, document system behavior
tags: testing, test-pyramid, behavior-testing, arrange-act-assert, code-quality
---

## Test Behavior Not Implementation — Follow the Testing Pyramid

Tests assert on outputs and side effects, not on which internal methods were called. Tests that break when you refactor internals are coupling to implementation. Follow the pyramid: many fast unit tests, moderate integration tests, few end-to-end tests. Each test has exactly one reason to fail.

**Incorrect (testing implementation details, brittle to refactoring):**

```typescript
test("processOrder", () => {
  const mockRepo = jest.fn();
  const mockEmail = jest.fn();
  const mockLogger = jest.fn();
  const service = new OrderService(mockRepo, mockEmail, mockLogger);

  service.processOrder(testOrder);

  // Coupled to implementation: breaks if we change internal method names
  expect(mockRepo).toHaveBeenCalledWith("save", expect.any(Object));
  expect(mockEmail).toHaveBeenCalledTimes(1);
  expect(mockLogger).toHaveBeenCalledWith("info", expect.stringContaining("order"));
});

test("test3", () => { // Name tells nothing about behavior
  expect(calculate(1, 2, 3)).toBe(6);
});
```

**Correct (testing behavior, survives refactoring):**

```typescript
test("completed order includes correct total and tax", async () => {
  // Arrange: set up preconditions with real (in-memory) collaborators
  const orders = new InMemoryOrderRepository();
  const service = new OrderService(orders, new FakePaymentGateway());

  // Act: exercise the behavior
  const result = await service.createOrder([
    { productId: "widget-1", quantity: 2, unitPrice: 1000 },
    { productId: "widget-2", quantity: 1, unitPrice: 2500 },
  ]);

  // Assert: verify observable outcomes
  expect(result.isOk()).toBe(true);
  const order = result.value;
  expect(order.subtotal).toBe(4500);
  expect(order.tax).toBe(360); // 8% tax
  expect(order.total).toBe(4860);
});

test("order with expired card returns payment declined error", async () => {
  const service = new OrderService(
    new InMemoryOrderRepository(),
    new FakePaymentGateway({ alwaysDecline: true })
  );

  const result = await service.createOrder([{ productId: "w-1", quantity: 1, unitPrice: 1000 }]);

  expect(result.isErr()).toBe(true);
  expect(result.error.type).toBe("card_declined");
});
```

Test names are documentation: `test_payment_fails_when_card_is_expired` tells the next engineer what the system does. Tests are production code — they follow the same quality standards.
