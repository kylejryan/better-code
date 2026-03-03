---
title: Remove Dead Code, Speculative Generality, and True Duplication
impact: MEDIUM
impactDescription: Reduces codebase noise by 10-30%, eliminates maintenance burden of unused code
tags: code-smells, dead-code, yagni, speculative-generality, dispensable
---

## Remove Dead Code, Speculative Generality, and True Duplication

Dispensable smells are code that serves no current purpose. Every line of dead code is a line someone will try to understand, test around, and maintain.

**Dead Code** — Unreachable code, unused variables, commented-out blocks. Delete them. Version control remembers.

**Speculative Generality** — Hooks, parameters, and abstractions for features that don't exist. YAGNI.

**Duplicate Code** — Same logic in multiple places. Verify it's true duplication (same reason to change) before extracting.

**Incorrect (dead code, speculative generality, and unverified duplication):**

```typescript
// Dead code: commented-out blocks and unused function
// function oldCalculation(x: number) { return x * 1.1; } // TODO: remove?
function calculate(x: number) {
  // const debug = true; // Was used for debugging
  const result = x * 1.15;
  // if (featureFlags.newCalculation) { result = x * 1.2; } // Maybe someday?
  return result;
}

// Speculative generality: supports 3 modes, only one is ever used
interface ProcessorOptions {
  mode: "fast" | "balanced" | "thorough"; // Only "fast" is ever called
  maxRetries: number;
  enableCache: boolean;
  pluginDir?: string; // No plugins exist
  onProgress?: (pct: number) => void; // Never used
}
```

**Correct (only code that earns its existence):**

```typescript
function calculate(x: number): number {
  return x * CURRENT_RATE;
}

// Only the options that are actually used
interface ProcessorOptions {
  maxRetries: number;
  enableCache: boolean;
}
```

If you're unsure whether code is used, delete it and run the tests. If tests pass and no one complains, it was dead. Version control has your back.
