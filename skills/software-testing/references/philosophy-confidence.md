---
title: Justified Confidence Over Coverage Metrics
impact: CRITICAL
impactDescription: Eliminates false confidence from meaningless tests
tags: philosophy, confidence, coverage, metrics, testing-purpose
---

## Justified Confidence Over Coverage Metrics

Tests exist for one reason: to give you justified confidence that your software does what you intend and won't break what already works when you change it. The question is never "do we have enough tests?" The question is: "if this change introduced a bug, which test would catch it?"

**Incorrect (testing for coverage, not confidence):**

```typescript
// 100% coverage, zero confidence — tests assert nothing meaningful
describe("UserService", () => {
    test("create user", () => {
        const service = new UserService(mockDB);
        const result = service.create({ name: "test" });
        expect(result).toBeDefined(); // proves nothing
    });

    test("delete user", () => {
        const service = new UserService(mockDB);
        service.delete("123");
        expect(true).toBe(true); // literally meaningless
    });

    test("get user", () => {
        const service = new UserService(mockDB);
        const result = service.getByID("123");
        expect(typeof result).toBe("object"); // vacuous assertion
    });
});
```

**Correct (testing behavior that matters):**

```typescript
// Lower coverage percentage, dramatically higher confidence
describe("UserService", () => {
    test("create user persists to database and returns generated ID", async () => {
        const db = await TestDatabase.create();
        const service = new UserService(db);

        const user = await service.create({ name: "Alice", email: "alice@example.com" });

        expect(user.id).toBeDefined();
        const persisted = await db.users.findById(user.id);
        expect(persisted.name).toBe("Alice");
        expect(persisted.email).toBe("alice@example.com");
    });

    test("create user rejects duplicate email", async () => {
        const db = await TestDatabase.create();
        const service = new UserService(db);
        await service.create({ name: "Alice", email: "alice@example.com" });

        await expect(
            service.create({ name: "Bob", email: "alice@example.com" })
        ).rejects.toThrow("email already exists");
    });

    test("delete user removes from database and revokes active sessions", async () => {
        const db = await TestDatabase.create();
        const sessions = new TestSessionStore();
        const service = new UserService(db, sessions);
        const user = await service.create({ name: "Alice", email: "alice@example.com" });
        await sessions.create(user.id);

        await service.delete(user.id);

        expect(await db.users.findById(user.id)).toBeNull();
        expect(await sessions.getActive(user.id)).toHaveLength(0);
    });
});
```

Each test verifies a specific behavior that, if broken, would matter in production. When a test fails, you know exactly what behavior regressed.
