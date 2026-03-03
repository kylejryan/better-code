---
title: Treat Every Line of Code as a Liability, Not an Asset
impact: CRITICAL
impactDescription: Reduces codebase size 30-50% while preserving all functionality
tags: leverage, liability, code-reduction, mindset
---

## Treat Every Line of Code as a Liability, Not an Asset

Every line you write is a line someone must read, understand, test, debug, and maintain. Code is not progress — working capability is progress. The engineer who deletes 500 lines while preserving all functionality has done more than the one who added 500.

Before writing anything, ask four questions:

1. **Does this already exist?** Search the codebase, standard library, and well-maintained packages. The best code is code you didn't write.
2. **Should this be code at all?** Can this be configuration, a schema, a rule in a table, a template? Code that can be data should be data.
3. **How many future features does this unlock?** If "just this one," you're building a dead end.
4. **What's the smallest useful version?** Ship the 80% solution in 20% of the lines.

**Incorrect (writing code that already exists or should be data):**

```typescript
// Reimplementing what the standard library provides
function removeDuplicates<T>(arr: T[]): T[] {
  const seen: T[] = [];
  for (const item of arr) {
    if (!seen.includes(item)) seen.push(item);
  }
  return seen;
}

// Hardcoding what should be configuration
function getApiUrl(env: string): string {
  if (env === "production") return "https://api.example.com";
  if (env === "staging") return "https://staging.api.example.com";
  if (env === "development") return "http://localhost:3000";
  throw new Error("Unknown environment");
}
```

**Correct (leveraging existing solutions, using data over code):**

```typescript
// Standard library does this
const unique = [...new Set(items)];

// Configuration as data — adding an environment is a data change, not a code change
const API_URLS: Record<Environment, string> = {
  production: "https://api.example.com",
  staging: "https://staging.api.example.com",
  development: "http://localhost:3000",
};
const apiUrl = API_URLS[environment]; // Zero code to add a new environment
```

The codebase should grow sublinearly relative to capabilities. Doubling the feature set should not double the code. Deleting code is celebrated as much as writing it.
