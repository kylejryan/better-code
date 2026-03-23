---
title: Consumer-Driven Contract Testing
impact: HIGH
impactDescription: Catches service boundary breaks before production deployment
tags: contract, consumer-driven, pact, schema-validation, service-boundary
---

## Consumer-Driven Contract Testing

Service A calls Service B's API. Service B changes a field name. Both services' tests pass in isolation — A mocks B's old response, B validates its new response. Production breaks because A expects the old field and B sends the new one. Contract tests make the agreement explicit and test both sides against it.

**Incorrect (no contract verification — each side tests in isolation):**

```typescript
// Consumer test — mocks provider with stale assumptions
test("fetches user from auth service", async () => {
    nock("https://auth-service")
        .get("/users/123")
        .reply(200, { id: "123", email: "test@example.com", name: "Alice" });
    // ^^^ This mock may not match what auth-service actually returns

    const user = await authClient.getUser("123");
    expect(user.name).toBe("Alice");
    // Passes in CI, fails in production when auth-service renames 'name' to 'displayName'
});
```

**Correct (shared schema validates both sides):**

```typescript
// shared-schemas/user-response.schema.ts
import { z } from "zod";

export const UserResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string(),
    role: z.enum(["admin", "user", "viewer"]),
});

// Consumer test — validates response against shared schema
test("auth service response matches contract", async () => {
    const response = await authClient.getUser("123");
    const result = UserResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
});

// Provider test — validates handler output against same schema
test("GET /users/:id matches contract", async () => {
    const response = await request(app).get("/users/123").expect(200);
    const result = UserResponseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
});
```

```go
// Provider validates against shared JSON schema
func TestGetUser_MatchesContract(t *testing.T) {
    resp := httptest.NewRecorder()
    req := httptest.NewRequest("GET", "/users/123", nil)
    handler.GetUser(resp, req)

    var body map[string]any
    json.NewDecoder(resp.Body).Decode(&body)

    err := schema.Validate("user-response", body)
    require.NoError(t, err, "handler output does not match contract schema")
}
```

When either side changes the shape, the shared schema acts as the single source of truth. Breaking changes are caught in CI, not production.
