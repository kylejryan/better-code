---
title: Design Boundaries and Contracts That Make Illegal States Unrepresentable
impact: CRITICAL
impactDescription: Eliminates classes of runtime bugs at compile time, reduces defensive code by 60-80%
tags: boundaries, contracts, type-safety, parse-dont-validate, error-handling, architecture
---

## Design Boundaries and Contracts That Make Illegal States Unrepresentable

Public APIs are forever — design them as if they'll be called by code you can't change. Use the type system to eliminate invalid states. Parse at the boundary and produce typed domain objects; internal code operates on correct-by-construction data.

**Incorrect (illegal states are representable, validation scattered everywhere):**

```typescript
interface User {
  email: string;
  verified: boolean;
  verificationDate: Date | null; // Can be {verified: true, date: null} — illegal!
}

// Validation repeated at every call site
function sendWelcomeEmail(user: User) {
  if (!user.email || !user.email.includes("@")) throw new Error("Invalid email");
  if (!user.verified) throw new Error("Not verified");
  if (!user.verificationDate) throw new Error("Missing date"); // Shouldn't be possible!
  // ...
}
```

**Correct (illegal states are unrepresentable, parse at the boundary):**

```typescript
// Types make illegal states impossible
type User = UnverifiedUser | VerifiedUser;
interface UnverifiedUser { status: "unverified"; email: Email; }
interface VerifiedUser { status: "verified"; email: Email; verifiedAt: Date; }

// Parse at the boundary — produce typed domain objects
function parseEmail(input: string): Result<Email, ValidationError> {
  const trimmed = input.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) return err(new InvalidEmailError(input));
  return ok(trimmed as Email);
}

// Internal code operates on correct-by-construction types — no validation needed
function sendWelcomeEmail(user: VerifiedUser): void {
  // user.email is guaranteed valid, user is guaranteed verified with a date
  mailer.send(user.email, welcomeTemplate(user.verifiedAt));
}
```

Error handling is an API. Functions communicate failure through return types (Result, Either, typed exceptions), not through null, -1, or swallowed exceptions.
