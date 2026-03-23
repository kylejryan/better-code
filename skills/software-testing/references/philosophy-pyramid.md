---
title: The Testing Shape — Type System as Foundation
impact: CRITICAL
impactDescription: Maximizes confidence per minute of engineering time
tags: philosophy, pyramid, type-system, static-analysis, test-levels
---

## The Testing Shape — Type System as Foundation

The classic testing pyramid (many unit tests, fewer integration tests, few E2E tests) was good advice when integration tests were slow and expensive. Modern tooling has changed the cost equation. Optimize for confidence per minute of engineering time.

**Incorrect (classic pyramid — unit test everything, mock aggressively):**

```typescript
// Dozens of unit tests with mocks for a simple CRUD handler
describe("createFinding", () => {
    test("calls repository.save", () => {
        const mockRepo = { save: jest.fn().mockResolvedValue({ id: "1" }) };
        const handler = new FindingHandler(mockRepo);
        handler.create({ title: "XSS", severity: "high" });
        expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });

    test("calls validator.validate", () => {
        const mockValidator = { validate: jest.fn().mockReturnValue(true) };
        const handler = new FindingHandler(mockRepo, mockValidator);
        handler.create({ title: "XSS", severity: "high" });
        expect(mockValidator.validate).toHaveBeenCalled();
    });

    // 15 more tests asserting internal call patterns...
    // Every refactor breaks these tests even when behavior is unchanged
});
```

**Correct (invest in integration tests and the type system):**

```typescript
// TypeScript strict mode catches type errors at zero runtime cost
// eslint and biome catch code quality issues statically
// Then: fewer but more valuable integration tests

describe("POST /api/findings", () => {
    let app: Application;
    let db: TestDatabase;

    beforeAll(async () => {
        db = await TestDatabase.create();
        app = createApp({ database: db });
    });

    afterAll(() => db.destroy());

    test("creates finding and persists to database", async () => {
        const response = await request(app)
            .post("/api/findings")
            .send({ title: "SQL Injection", severity: "critical", service: "auth" })
            .expect(201);

        expect(response.body.id).toBeDefined();
        const fromDB = await db.findings.findById(response.body.id);
        expect(fromDB.title).toBe("SQL Injection");
    });

    test("rejects invalid severity with 400", async () => {
        await request(app)
            .post("/api/findings")
            .send({ title: "Test", severity: "banana" })
            .expect(400);
    });
});
```

The type system is the base. Integration tests are the middle. Unit tests target complex logic. E2E tests cover the 3-5 critical user journeys.
