---
title: Treat Every Internal Interface as a Product With Users
impact: HIGH
impactDescription: Eliminates tribal knowledge, enables self-service integration, prevents "ask the author" bottleneck
tags: internal-apis, discoverability, backward-compatibility, boundaries, leverage
---

## Treat Every Internal Interface as a Product With Users

Every shared module, service boundary, and utility function is a product with users. It must be discoverable (engineers find it without asking), self-service (API signature is sufficient to use it), and backward-compatible (internal changes don't break consumers).

**Incorrect (internal API that requires tribal knowledge):**

```typescript
// Undiscoverable: buried in utils/misc.ts
// Not self-service: requires reading implementation to understand
// Not backward-compatible: changes break all consumers silently
export function process(data: any, opts?: any): any {
  // What does this do? What are valid opts? What does it return?
  // Only the author knows — everyone else Slacks them
}

// Breaking change with no migration path
// v1: process(data, { format: "json" })
// v2: process(data, { outputFormat: "json" }) ← silently breaks all callers
```

**Correct (internal API designed as a product):**

```typescript
// Discoverable: clear name, in the right namespace
// Self-service: types and JSDoc tell you everything
// Backward-compatible: old options still work
interface TransformOptions {
  /** Output format. Default: "json" */
  outputFormat: OutputFormat;
  /** @deprecated Use outputFormat instead. Will be removed in v3. */
  format?: OutputFormat;
}

export function transformDocument(
  document: Document,
  options: TransformOptions = { outputFormat: "json" }
): Result<TransformedDocument, TransformError> {
  const format = options.outputFormat ?? options.format ?? "json";
  // ...
}

// Migration path: deprecation warning, not a breaking change
// New consumers use the current API. Old consumers get warnings and time to migrate.
```

An internal API that requires a Slack message to the author to use correctly is not an API — it's tribal knowledge.
