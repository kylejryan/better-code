---
title: Test Isolation — No Shared Mutable State
impact: CRITICAL
impactDescription: Eliminates ordering dependencies and intermittent failures
tags: integration, isolation, database, state-management, test-independence
---

## Test Isolation — No Shared Mutable State

Tests that share a database, global variable, or singleton between test cases create ordering dependencies. Test A seeds data that test B depends on. Test C deletes data that test D expects. The result: tests pass individually but fail when run together, or pass in one order and fail in another.

**Incorrect (shared global test data with ordering dependency):**

```typescript
// test-setup.ts — shared seed data loaded once
beforeAll(async () => {
    await db.users.insert({ id: "user-1", name: "Alice" });
    await db.users.insert({ id: "user-2", name: "Bob" });
});

// user.test.ts — depends on seed data from setup
test("lists all users", async () => {
    const users = await service.listUsers();
    expect(users).toHaveLength(2); // breaks if another test added/deleted users
});

// admin.test.ts — modifies shared data
test("admin can delete user", async () => {
    await service.deleteUser("user-1");
    // now "lists all users" test will fail
});
```

**Correct (each test owns its data, clean state per test):**

```typescript
describe("UserService", () => {
    let db: TestDatabase;

    beforeEach(async () => {
        db = await TestDatabase.create();
        // OR: truncate all tables
        // OR: use transaction wrapper that rolls back after each test
    });

    afterEach(() => db.destroy());

    test("lists users returns only users in database", async () => {
        // Arrange — this test creates exactly what it needs
        await db.users.insert({ id: "user-1", name: "Alice" });
        await db.users.insert({ id: "user-2", name: "Bob" });
        const service = new UserService(db);

        // Act
        const users = await service.listUsers();

        // Assert
        expect(users).toHaveLength(2);
    });

    test("delete user removes from database", async () => {
        // Arrange — independent of other tests
        await db.users.insert({ id: "user-1", name: "Alice" });
        const service = new UserService(db);

        // Act
        await service.deleteUser("user-1");

        // Assert
        const remaining = await service.listUsers();
        expect(remaining).toHaveLength(0);
    });
});
```

```go
func TestUserService_ListUsers(t *testing.T) {
    db := setupTestDB(t)       // fresh DB per test
    t.Cleanup(func() { db.Close() })

    // Seed only what this test needs
    db.Exec("INSERT INTO users (id, name) VALUES ($1, $2)", "1", "Alice")
    db.Exec("INSERT INTO users (id, name) VALUES ($1, $2)", "2", "Bob")

    svc := NewUserService(db)
    users, err := svc.ListUsers(context.Background())
    require.NoError(t, err)
    assert.Len(t, users, 2)
}
```

Run tests in random order (`go test -shuffle=on`, Jest `--randomize`) to surface hidden ordering dependencies.
