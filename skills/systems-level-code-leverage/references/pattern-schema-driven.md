---
title: Define Data Shape Once — Derive Everything Else From the Schema
impact: HIGH
impactDescription: Eliminates 5-10 handwritten artifacts per entity, prevents drift between layers
tags: schema, code-generation, single-source-of-truth, validation, leverage
---

## Define Data Shape Once — Derive Everything Else From the Schema

From a single schema definition, generate: validation logic, serialization, database migration, API documentation, client SDKs, and type definitions. Every handwritten validator or serializer that could be generated is a maintenance liability and source of drift.

**Incorrect (manually maintaining parallel definitions that drift):**

```typescript
// Database migration — source of truth #1
CREATE TABLE users (id SERIAL, name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE);

// TypeScript type — source of truth #2 (can drift from DB)
interface User { id: number; name: string; email: string; }

// Validation — source of truth #3 (can drift from type)
function validateUser(data: unknown): boolean {
  if (typeof data.name !== "string" || data.name.length > 100) return false;
  if (typeof data.email !== "string" || !data.email.includes("@")) return false;
  return true;
}

// API docs — source of truth #4 (definitely drifts)
// OpenAPI spec manually maintained separately...
```

**Correct (single schema, everything derived):**

```typescript
// ONE source of truth — everything else is generated
const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]),
  createdAt: z.date(),
});

// Derived: TypeScript type
type User = z.infer<typeof UserSchema>;

// Derived: validation (built into the schema)
const result = UserSchema.safeParse(requestBody);

// Derived: OpenAPI documentation
const openApiSpec = generateOpenApi(UserSchema);

// Derived: database migration
const migration = schemaToMigration(UserSchema, "users");

// Adding a field = change ONE line. All artifacts update automatically.
```

Tools: Zod, Pydantic, Protocol Buffers, JSON Schema, Prisma, SQLAlchemy. Pick the one that generates the most downstream artifacts in your stack.