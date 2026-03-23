---
title: Real Dependencies Over Mocks in Integration Tests
impact: CRITICAL
impactDescription: Catches the #1 source of production bugs — component contract mismatches
tags: integration, real-dependencies, testcontainers, database, mocking-antipattern
---

## Real Dependencies Over Mocks in Integration Tests

A unit test with a mocked database tests your code's interaction with the mock. An integration test with a real database tests your code's interaction with the actual database — including query correctness, transaction behavior, constraint enforcement, and migration validity. Most production bugs live at component boundaries, not inside individual functions.

**Incorrect (mocking the database in an integration test):**

```go
type MockDB struct {
    users map[string]User
}

func (m *MockDB) GetByID(ctx context.Context, id string) (User, error) {
    u, ok := m.users[id]
    if !ok { return User{}, ErrNotFound }
    return u, nil
}

func TestUserService_CreateAndRetrieve(t *testing.T) {
    // This test passes even if the real SQL has a typo,
    // the migration is broken, or constraints are wrong
    mock := &MockDB{users: map[string]User{
        "123": {ID: "123", Email: "test@example.com"},
    }}
    svc := NewUserService(mock)
    user, _ := svc.GetByID(context.Background(), "123")
    assert.Equal(t, "test@example.com", user.Email)
    // Green in CI, broken in production
}
```

**Correct (real database via testcontainers):**

```go
func TestUserService_CreateAndRetrieve(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping integration test in short mode")
    }

    db := setupTestDB(t) // real postgres via testcontainers
    defer db.Close()
    svc := NewUserService(db)

    // Create
    user, err := svc.Create(context.Background(), CreateUserInput{
        Email: "test@example.com",
        Name:  "Test User",
    })
    require.NoError(t, err)
    require.NotEmpty(t, user.ID)

    // Retrieve — exercises the real SQL query
    found, err := svc.GetByID(context.Background(), user.ID)
    require.NoError(t, err)
    assert.Equal(t, "test@example.com", found.Email)
    assert.Equal(t, "Test User", found.Name)
}
```

```typescript
describe("POST /api/findings", () => {
    let app: Application;
    let db: TestDatabase;

    beforeAll(async () => {
        db = await TestDatabase.create(); // real postgres or sqlite
        app = createApp({ database: db });
    });
    afterAll(() => db.destroy());

    it("creates a finding and returns it with generated ID", async () => {
        const response = await request(app)
            .post("/api/findings")
            .send({ title: "SQL injection in login", severity: "critical" })
            .expect(201);

        expect(response.body.id).toBeDefined();
        // Verify it's actually persisted — not just returned
        const fromDB = await db.findings.findById(response.body.id);
        expect(fromDB.title).toBe("SQL injection in login");
    });
});
```

Use real dependencies where feasible. Mock only what you can't control (external third-party APIs, time, randomness).
