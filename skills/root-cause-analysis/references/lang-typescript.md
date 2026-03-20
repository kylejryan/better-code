---
title: TypeScript and Node.js Error Signatures and Diagnostic Patterns
impact: CRITICAL
impactDescription: Maps TS compile errors and Node.js runtime failures to root causes — eliminates the most common async, type, and module resolution misdiagnoses
tags: typescript, javascript, node, async, promise, type, module, esm, cjs, npm
---

## TypeScript / Node.js Diagnostic Reference

TypeScript errors come in two completely different flavors: compile-time type errors (which are safe — nothing ran) and runtime errors (which mean the types lied or were bypassed). Diagnosing each requires a different approach. Node.js adds its own layer of async, module resolution, and event loop complexity.

### Reading TypeScript Compiler Errors

TS errors are verbose but structured. The key is reading them bottom-up.

**Incorrect (reading the first line and guessing):**

```typescript
// Error: Type '{ name: string; age: number; }' is not assignable to type 'User'.
//   Types of property 'role' are incompatible.
//     Type 'undefined' is not assignable to type 'Role'.

// Wrong reaction: "I'll just add role to the object"
const user: User = { name: "Alice", age: 30, role: "admin" }; // Might still fail!
// "admin" might not be assignable to type Role — you haven't read the FULL chain
```

**Correct (reading the full error chain bottom-up):**

```typescript
// Read BOTTOM-UP:
// 1. Type 'undefined' is not assignable to type 'Role' ← THE ACTUAL TYPE MISMATCH
// 2. Types of property 'role' are incompatible         ← WHICH PROPERTY
// 3. Type '{...}' is not assignable to type 'User'     ← THE CONTEXT

// Now check: what is type Role?
type Role = "admin" | "editor" | "viewer"; // It's a string union
// And: is 'role' required or optional in User?
interface User {
    name: string;
    age: number;
    role: Role; // Required! That's why undefined doesn't work
}

// Fix: provide a valid Role value
const user: User = { name: "Alice", age: 30, role: "admin" };
```

### Undefined / Null Runtime Errors

`TypeError: Cannot read properties of undefined (reading 'X')` — the most common JS runtime error. The variable before `.X` is undefined.

**Incorrect (adding optional chaining everywhere):**

```typescript
// "Just add ?. and it'll stop crashing"
const email = user?.profile?.settings?.email;
// This stops the crash but now email is silently undefined
// and the bug surfaces LATER in a more confusing way (sending to undefined, storing null in DB)
```

**Correct (tracing the undefined to its source):**

```typescript
// Step 1: Which part of the chain is undefined?
console.log({ user, profile: user?.profile }); // Add targeted logging

// Step 2: WHY is it undefined? Common sources:
// - API response missing a field (check the actual response, not the type)
// - Async data not loaded yet (component rendered before fetch completed)
// - Array index out of bounds (arr[arr.length] is always undefined)
// - Map/object key that doesn't exist (obj["typo"] is undefined, not an error)
// - Function with no return statement (returns undefined implicitly)

// Step 3: Fix at the SOURCE, not at the access point
// If the API can omit 'profile', make the type reflect that:
interface User {
    profile?: Profile; // Make the type honest
}
// Then handle the absence explicitly where it matters:
if (!user.profile) {
    throw new Error(`User ${user.id} has no profile — expected for verified users`);
}
```

### Async / Promise Errors

**Symptoms:** `UnhandledPromiseRejection`, silent failures, stale data, operations running out of order.

**Incorrect (adding .catch() to suppress the error):**

```typescript
// "Just catch it and log" — this hides the root cause
fetchUser(id).catch((err) => console.error(err));
// The error is logged but nothing handles the failure state
// The component continues as if the fetch succeeded
```

**Correct (understanding which async pattern failed):**

```typescript
// Pattern 1: Missing await — the most common async bug
async function updateUser(id: string) {
    const user = await getUser(id);
    saveAuditLog(user); // BUG: missing await! This runs fire-and-forget
    await deleteCache(id);
    return user;
    // If saveAuditLog fails, you'll never know. If it's slow, deleteCache
    // runs before the audit log is saved.
}

// Fix: await it, or if intentionally concurrent, use Promise.all
async function updateUser(id: string) {
    const user = await getUser(id);
    await saveAuditLog(user); // Now failures propagate
    await deleteCache(id);
    return user;
}

// Pattern 2: Promise.all fails fast — one rejection kills everything
const results = await Promise.all([fetchA(), fetchB(), fetchC()]);
// If fetchB() rejects, fetchA() and fetchC() results are LOST
// Use Promise.allSettled() if you need partial results:
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
const successes = results.filter((r) => r.status === "fulfilled");
const failures = results.filter((r) => r.status === "rejected");

// Pattern 3: forEach doesn't await — use for...of or Promise.all
items.forEach(async (item) => {
    await process(item); // BUG: forEach doesn't await this!
});
// Fix:
for (const item of items) {
    await process(item); // Sequential
}
// Or:
await Promise.all(items.map((item) => process(item))); // Concurrent
```

### Module Resolution Errors

`Cannot find module`, `ERR_MODULE_NOT_FOUND`, `ERR_REQUIRE_ESM` — these are configuration problems, not code problems.

**Diagnostic checklist:**

```bash
# 1. Does the module exist?
npm ls <module-name>            # Is it installed? What version?
ls node_modules/<module-name>   # Is it physically there?

# 2. ESM vs CJS conflict?
# "ERR_REQUIRE_ESM" = you're require()'ing an ESM-only package
# Check the package's package.json for "type": "module"
cat node_modules/<module>/package.json | grep '"type"'

# 3. TypeScript path resolution
npx tsc --traceResolution 2>&1 | grep <module>  # See EXACTLY how TS resolves it

# 4. tsconfig issues — check the EFFECTIVE config, not just tsconfig.json
npx tsc --showConfig  # Shows the resolved config including extended configs
```

**Incorrect (randomly toggling tsconfig settings):**

```jsonc
// "Just try different moduleResolution values until it works"
{
    "compilerOptions": {
        "moduleResolution": "node16", // Changed from "node" — but why?
        "module": "ESNext",           // Does this match your runtime?
        "esModuleInterop": true       // Cargo-culted — do you know what this does?
    }
}
```

**Correct (matching tsconfig to your actual runtime and package ecosystem):**

```jsonc
// For Node.js with CommonJS (most existing projects):
{
    "compilerOptions": {
        "module": "commonjs",
        "moduleResolution": "node",
        "esModuleInterop": true  // Needed for default imports from CJS modules
    }
}

// For Node.js with ESM (package.json has "type": "module"):
{
    "compilerOptions": {
        "module": "node16",           // or "nodenext"
        "moduleResolution": "node16", // must match module setting
        // Note: imports MUST include .js extension even for .ts files
    }
}

// For bundled apps (Vite, webpack, esbuild):
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "bundler", // TS 5.0+ — lets the bundler resolve
    }
}
```

### Event Loop and Performance

**Diagnostic:** detect event loop blocking:

```bash
# Node.js built-in diagnostics
node --inspect app.js                    # Chrome DevTools debugger
node --prof app.js && node --prof-process isolate-*.log  # CPU profiling
node --heap-prof app.js                  # Heap snapshots

# Detect event loop lag at runtime:
# If the event loop is blocked, setTimeout callbacks are delayed
```

```typescript
// Detect event loop blocking in code:
let lastCheck = Date.now();
setInterval(() => {
    const now = Date.now();
    const lag = now - lastCheck - 1000; // expected 1000ms interval
    if (lag > 100) {
        console.warn(`Event loop lag: ${lag}ms`); // Something blocked the loop
    }
    lastCheck = now;
}, 1000);
```

### Key Diagnostic Commands

```bash
# TypeScript
npx tsc --noEmit                        # Type check without building
npx tsc --noEmit --extendedDiagnostics  # Show where compile time is spent

# Node.js runtime
NODE_DEBUG=module node app.js            # Module resolution debugging
NODE_DEBUG=net,http node app.js          # Network debugging
node --enable-source-maps app.js         # Source maps for compiled TS

# Package debugging
npm why <package>                        # Why is this package installed?
npm ls --all <package>                   # Full dependency tree for a package
npm explain <package>                    # Detailed resolution explanation
```
