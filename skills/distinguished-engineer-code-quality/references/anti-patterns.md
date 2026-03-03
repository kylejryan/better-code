---
title: Avoid These Anti-Patterns Regardless of Justification
impact: HIGH
impactDescription: Each anti-pattern multiplies maintenance cost by 2-5x and creates classes of recurring bugs
tags: anti-patterns, god-object, stringly-typed, boolean-blindness, null-abuse, magic-numbers
---

## Avoid These Anti-Patterns Regardless of Justification

These patterns create systemic problems that compound over time. Never use them, regardless of time pressure or convenience.

**God Object** — No class should be the dumping ground. If it's growing unboundedly, extract.

**Stringly-Typed Code** — Never use raw strings for enums, states, or identifiers. Use the type system.

**Boolean Blindness** — `process(true, false, true)` is unreadable. Use named parameters or enums.

**Null Abuse** — Don't return null for "not found" or "error." Use Option/Maybe or Result.

**Incorrect (multiple anti-patterns in practice):**

```typescript
// God Object: does everything, grows forever
class AppManager {
  handleLogin() { /* ... */ }
  processPayment() { /* ... */ }
  sendNotification() { /* ... */ }
  generateReport() { /* ... */ }
  // ... 2000 more lines
}

// Stringly-typed + magic numbers + boolean blindness
function createUser(name: string, role: string, active: boolean): any {
  if (role === "admn") { /* typo goes undetected at compile time */ }
  process(true, false, true); // What do these booleans mean?
  if (retries > 3) { /* magic number — 3 what? */ }
  return null; // Not found? Error? Success with no data?
}
```

**Correct (type-safe, self-documenting, explicit):**

```typescript
// Focused classes with single responsibilities
class AuthenticationService { login(credentials: Credentials): Result<Session, AuthError> { /* ... */ } }
class PaymentService { processPayment(request: PaymentRequest): Result<Receipt, PaymentError> { /* ... */ } }

// Type-safe enums, named parameters, explicit returns
enum UserRole { Admin = "admin", Editor = "editor", Viewer = "viewer" }
const MAX_RETRY_ATTEMPTS = 3;

function createUser(request: CreateUserRequest): Result<User, CreateUserError> {
  if (request.retryCount > MAX_RETRY_ATTEMPTS) {
    return err(new MaxRetriesExceededError(MAX_RETRY_ATTEMPTS));
  }
  return ok(User.create(request.name, request.role, request.email));
}
```

Also avoid: inheritance for code reuse (use composition), catch-all exception handlers (catch specific), temporal coupling (enforce ordering via types), copy-paste-modify (extract and parameterize), and premature optimization (profile first).
