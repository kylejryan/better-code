---
title: Eliminate Duplication Across Service and Repository Boundaries
impact: HIGH
impactDescription: Prevents N copies of shared logic drifting apart, reduces cross-service bugs by 60-80%
tags: shared-types, cross-service, duplication, boundaries, leverage
---

## Eliminate Duplication Across Service and Repository Boundaries

The most expensive duplication is not within a file — it's across services and repositories. Shared types, shared validation, and shared patterns (health checks, logging, graceful shutdown) should exist in exactly one place.

**Incorrect (same logic copy-pasted across services):**

```typescript
// Service A: validates email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Service B: validates email (different regex — has drifted!)
function validateEmail(email: string): boolean {
  return /^[\w.]+@[\w]+\.[\w]+$/.test(email); // Doesn't match Service A!
}

// Service C: validates email (yet another variant)
function checkEmail(e: string): boolean {
  return e.includes("@") && e.includes("."); // Barely validates
}
// Three services, three definitions, three bugs when the rules change
```

**Correct (shared package, single source of truth):**

```typescript
// @company/shared-validation — one package, one source of truth
export const EmailSchema = z.string().email().transform((e) => e.toLowerCase().trim());
export type Email = z.infer<typeof EmailSchema>;

// Service A, B, C all import from the same package
import { EmailSchema } from "@company/shared-validation";
const email = EmailSchema.parse(input); // Same validation everywhere

// Shared patterns as a framework, not copy-paste
// @company/service-framework
export function createService(config: ServiceConfig): Application {
  const app = express();
  app.get("/health", healthCheck);           // Every service gets health checks
  app.use(structuredLogging(config.name));    // Every service gets structured logging
  app.use(gracefulShutdown());               // Every service gets graceful shutdown
  return app;
}
```

If every service needs health checks, graceful shutdown, structured logging, and metrics — that's a framework, not boilerplate to copy-paste.
